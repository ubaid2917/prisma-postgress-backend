import prisma from "../db/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { registerSchema, loginSchema } from "../validations/authValidation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/mailer.js";
import logger from "../config/logger.js";
import { emailQueue, emailQueueName } from "../jobs/emailQuejob.js";

class AuthController {
  // register
  static async register(req, res) {
    try {
      const body = req.body;

      // compliling validation
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);
    
      // console.log('payload', payload)
      //   check eamil already exist or not
      const aleadyExist = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (aleadyExist) {
        return res.json({
          status: 400,
          message: "Email already in use",
        });
      }

      //   encrypt password
      const sPassword = await bcrypt.hash(payload.password, 10);

      const user = await prisma.users.create({
        data: {
          name: payload.name,
          email: payload.email,
          password: sPassword,
        },
      });

      return res.json({
        status: 200,
        message: "User Successfully registered",
        data: user,
      });
      return res.json({ payload: payload });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          errors: error.messages,
        });
      }
    }
  }

  //   login

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(req.body); // Use validate to check req.body

      // Check if user exists
      const user = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (user) {
        // Match password
        const matchPassword = await bcrypt.compare(
          payload.password,
          user.password
        );

        if (matchPassword) {
          // Issue token to user
          const payloadData = {
            id: user.id,
            email: user.email,
          };

          // Generate token
          const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
            expiresIn: "20d",
          });

          // Return token to the client
          return res.status(200).json({
            message: "Login successful",
            accessToken: `Bearer ${token}`, // Sending token back
          });
        } else {
          return res.status(400).json({
            message: "Invalid Credentials", // Password mismatch case
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid Credentials", // User not found case
        });
      }
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          errors: error.messages,
        });
      }

      // Handle any other errors
      return res.status(500).json({
        message: "Server Error",
        error: error.message,
      });
    }
  }  



  // send mail
  static async sendTestEmail (req,res) {
    try {
      const {email } = req.query;
        
      const payload = [
        {
          toEmail: email,
          subject: "You got an amazing",
          body: "<h1>Hi Ubaid</h1>"
        },
        {
          toEmail: email,
          subject: "You got an amazing offer",
          body: "<h1>Hi Ubaid you got this amaizig offer</h1>"
        } 
      ] 
      await emailQueue.add(emailQueueName, payload)
      // await sendEmail(payload.toEmail, payload.subject, payload.body); 
      res.status(200).json({message: "Job added sucessfully"})
    } catch (error) {
      logger.error({type: "Email error ", body:error})
      res.status(500).json({message: "Something went wrong"})
    }
     
  }
}

export default AuthController;
