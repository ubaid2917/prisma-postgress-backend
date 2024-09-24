import vine from '@vinejs/vine'  
import { CustomerErrorReporter } from './customError.js'; 

// custom error handeler

vine.errorReporter = () => new CustomerErrorReporter()

export const registerSchema = vine.object({
    name: vine.string().minLength(2).maxLength(191),
    email: vine.string().email(),
    password: vine.string().minLength(6).maxLength(100).confirmed()
});

export const loginSchema = vine.object({
    email: vine.string().email(),
    password: vine.string()
});