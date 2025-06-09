import Joi from 'joi';

const registerSchema = Joi.object({
    username: Joi.string()
        .required()
        .messages({
            'string.email': 'Username must be a valid email address',
            'any.required': 'Username is required',
        }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required',
        }), 
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required',
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Confirm Password must match Password',
            'any.required': 'Confirm Password is required',
        }),
});

export default registerSchema;