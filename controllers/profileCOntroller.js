import prisma from "../db/db.config.js";
import { generateUniqueName, imageValidator } from "../utils/helper.js";

class profileController {
  static async userProfile(req, res) {
    try {
      const user = req.user;

      const userData = await prisma.users.findUnique({
        where: {
          id: user.id,
        },
      });

      if (userData) {
        return res.status(200).json({
          status: 200,
          message: "User profile data",
          data: userData,
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "No user found",
        });
      }
    } catch (error) {
      logger.error(error.message)
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const user = req.user;

      if (!req.files || Object.keys(req.files).length == 0) {
        return res.status(400).json({
          status: 400,
          message: "Profile image is required",
        });
      }

      const profile = req.files.profile;

      const message = imageValidator(profile?.size, profile.mimetype);

      if (message !== null) {
        return res.status(400).json({
          errors: {
            profile: message,
          },
        });
      }

      const imageExt = profile?.name.split(".");

      console.log("image Ext", imageExt);
      const imageName = generateUniqueName() + "." + imageExt[1];

      console.log("image name", imageName);
      console.log("unique name for image", generateUniqueName());

      const uplaodPath = process.cwd() + "/public/images/" + imageName;

      profile.mv(uplaodPath, (err) => {
        if (err) throw err;
      });

      await prisma.users.update({
        data: {
          profile: imageName,
        },
        where: {
          id: user.id,
        },
      });

      return res.json({
        status: 200,
        message: "Profile updated successfully",
        data: {
          profile: imageName,
        },
      });
    } catch (error) {
      logger.error(error.message)
      return res.json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }
}

export default profileController;
