import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 4, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.", // return message on rate limit exceeded
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
