import Joi from 'joi';

const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'string.email': 'Username must be a valid email address',
      'any.required': 'Username is required',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
});

export default loginSchema;