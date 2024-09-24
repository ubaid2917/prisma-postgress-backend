# Project Overview

- User authentication with [JWT](https://www.npmjs.com/package/jsonwebtoken)
- The user can update his profile
- Apply [Vine.js](https://vinejs.dev/docs/introduction) for request validation
- CRUD on the news and one-to-many relation between user and news
- Redis caching on news using [express-redis-cache](https://www.npmjs.com/package/express-redis-cache)
- File Uploads with [Multer](https://www.npmjs.com/package/multer)
- Sending Emails with [Nodemailer](https://www.npmjs.com/package/nodemailer) with google smtp
- For security, use  [Helmet](https://www.npmjs.com/package/helmet) and [CORS](https://www.npmjs.com/package/cors)
- Apply [rate-limit](https://www.npmjs.com/package/express-rate-limit) to prevent unlimited requests
- Apply logger using [Winston](https://www.npmjs.com/package/express-rate-limit)
- Apply Queue handler using [Bullmq](https://docs.bullmq.io/readme-1)
