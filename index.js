import express from "express";
const app = express();
import bodyParser from "body-parser";
import "dotenv/config";
const port = process.env.PORT || 3000;

// file upload
import fileUpload from "express-fileupload";

import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/rateLimiter.js";

// Middleware
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors({}));
app.use(limiter);

// route
import routes from "./routes/main.js";
app.use(routes);

// jobs import 
import './jobs/index.js'

app.listen(port, function (req, res) {
  console.log("listening on port", port);
});
