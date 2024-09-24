import { Router } from "express";
const router = Router();
import AuthController from "../controllers/authController.js";
import profileController from "../controllers/profileCOntroller.js";
import newsController from "../controllers/newsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import   redisCache   from "../db/redis.config.js";

// routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

// profile routes
router.get("/profile", authMiddleware, redisCache.route(),  profileController.userProfile);
router.put("/profile", authMiddleware, profileController.updateProfile); 



// news routes 
router.post('/news',  authMiddleware,   newsController.createNews )
router.get('/news', authMiddleware, redisCache.route(), newsController.showNews)

// single news 
router.get('/showSingle/:id', authMiddleware, newsController.showSingleNews) 


// update news 
router.put('/updateNews/:id', authMiddleware, newsController.update) 

// delete news 
router.delete('/deleteNews/:id', authMiddleware, newsController.delete) 


router.get('/sendEmail', AuthController.sendTestEmail)
export default router;
