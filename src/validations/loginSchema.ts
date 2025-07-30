import Joi from 'joi';

const loginSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required',
      'string.base': 'Username must be a string',
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required',
      'string.base': 'Password must be a string',
    }),
});

export default loginSchema;