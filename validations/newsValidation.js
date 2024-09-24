import vine from "@vinejs/vine";
import { CustomerErrorReporter } from "./customError.js";

vine.errorReporter = () => new CustomerErrorReporter();

export const newsValidation = vine.object({
  title: vine.string().minLength(2).maxLength(200),
  content: vine.string().minLength(5).maxLength(30000),
});
