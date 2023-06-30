const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
    options: {
      tags: ['api'],
      description: 'Create user',
      validate: {
        payload: Joi.object({
          username: Joi.string().max(50).required(),
          password: Joi.string().required(),
          fullname: Joi.string().required(),
        }),
        failAction: (request, reply, error) => {
          throw new InvariantError(error.message);
        },
      },
      response: {
        status: {
          201: Joi.object({
            status: 'success',
            message: Joi.string(),
            data: Joi.object({
              userId: Joi.string(),
            }),
          }),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUserByIdHandler,
  },
];

module.exports = routes;
