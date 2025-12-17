const Joi = require('joi');

const validationSchemas = {
  userAuth: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).optional(),
    avatar: Joi.string().uri().optional()
  }),
  
  message: Joi.object({
    text: Joi.string().min(1).max(5000).required(),
    roomId: Joi.string().optional(),
    receiverId: Joi.string().optional(),
    senderId: Joi.string().required()
  }),
  
  room: Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(200).optional(),
    isPrivate: Joi.boolean().optional()
  })
};

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return { isValid: false, errors };
  }
  
  return { isValid: true, data: value };
};

module.exports = {
  validationSchemas,
  validate
};