import vine, { errors } from "@vinejs/vine";
import { newsValidation } from "../validations/newsValidation.js";
import prisma from "../db/db.config.js";
import {
  imageValidator,
  generateUniqueName,
  genImageUrl,
  removeImage,
  uploadImage,
} from "../utils/helper.js";

import NewsApiTransform from "../transform/newsApiTransform.js";
import redisCache from "../db/redis.config.js";
import logger from "../config/logger.js";

class NewsController {
  // create news
  static async createNews(req, res) {
    try {
      const user = req.user;

      const body = req.body;

      console.log("body data", req.body);

      const validator = vine.compile(newsValidation);
      const payload = await validator.validate(body);

      console.log("paylaod data", payload);

      if (!req.files || Object.keys(req.files).length == 0) {
        return res.status(400).json({
          status: 400,
          message: "Profile image is required",
        });
      }

      const image = req.files?.image;

      const message = imageValidator(image?.size, image?.mimetype);

      if (message !== null) {
        return res.status(400).json({
          status: 400,
          message: message,
        });
      }
      //   uplaod image
      const imageName = uploadImage(image);

      const addNews = await prisma.news.create({
        data: {
          user_id: user.id,
          title: payload.title,
          content: payload.content,
          image: imageName,
        },
      });

      // remove cache
      redisCache.del("/api/news", (err) => {
        if (err) throw err;
      });

      return res.status(200).json({
        status: 200,
        message: "News successfully created",
        data: addNews,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          errors: error.messages,
          message: "Something went wrong",
        });
      }
    }
  }

  //   show news
  static async showNews(req, res) {
    try {
      const user = req.user;

      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);

      if (page < 0) {
        page = 1;
      }

      if (limit < 0 || limit > 100) {
        limit = 10;
      }

      const skip = (page - 1) * limit;

      const news = await prisma.news.findMany({
        take: limit,
        skip: skip,
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      });

      const newTransform = news?.map((item) =>
        NewsApiTransform.transform(item)
      );

      const totalNews = await prisma.news.count();

      const totalPages = Math.ceil(totalNews / limit);

      return res.json({
        status: 200,
        news: newTransform,
        metaData: {
          totalPages: totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      });
    } catch (error) {
      logger.error(error.message)
      return res.status(500).json({
        error: error.message
      })
    }
  }

  //  single news details
  static async showSingleNews(req, res) {
    try {
      const newsId = req.params.id;

      if (!newsId) {
        return res.json({
          status: 200,
          message: "News id is missing in parameter",
        });
      }

      const news = await prisma.news.findUnique({
        where: {
          id: Number(newsId),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const data = NewsApiTransform.transform(news);

      return res.json({
        status: 200,
        news: data,
        message: "news details",
      });
    } catch (error) {
      logger.error(error?.message);
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  //   update news details
  static async update(req, res) {
    try {
      const { id } = req.params;

      const user = req.user;

      const body = req.body;

      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (user.id !== news.user_id) {
        return res.status(400).json({
          message: "Unauthorized",
        });
      }

      const validator = vine.compile(newsValidation);

      const payload = await validator.validate(body);

      // update the data

      const image = req?.files?.image;
      if (image) {
        const message = imageValidator(image?.size, image.mimetype);
        if (message !== null) {
          return res.status(400).json({
            message: message,
          });
        }
        // update new image
        const imageName = uploadImage(image);
        payload.image = imageName;

        // delete old image
        removeImage(news.image);
      }

      const updatedData = await prisma.news.update({
        data: payload,
        where: {
          id: Number(id),
        },
      });

      // remove caching
      redisCache.del("/api/news", (error) => {
        if (error) throw error;
      });

      return res.status(200).json({
        message: "news update successfully",
        data: updatedData,
      });
    } catch (error) {
      logger.error(error?.message);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          errors: error.messages,
        });
      }
    }
  }

  // delete news
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const user = req.user;

      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (user.id !== news?.user_id) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      // delete image from filesystem
      removeImage(news.image);

      await prisma.news.delete({
        where: {
          id: Number(id),
        },
      });

      // remove caching
      redisCache.del("/api/news", (error) => {
        if (error) throw error;
      });

      return res.status(200).json({
        message: "News deleted successfully",
      });
    } catch (error) {
      logger.error(error?.message);
      return res.json({
        status: 500,
        errors: error.messages,
      });
    }
  }
}

export default NewsController;
