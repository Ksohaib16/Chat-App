const Joi = require('joi');

const signupBody = Joi.object({
    name: Joi.string().min(2).required().messages({
        message: 'Name must be at least 2 characters',
    }),
    email: Joi.string().email().required().messages({
        message: 'Please enter a valid email address',
    }),
    number: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({ message: 'Please enter a valid phone number' }),
});

module.exports = { signupBody };
