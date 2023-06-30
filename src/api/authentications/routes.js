const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler,
    options: {
      tags: ['api'],
      description: 'Authenticate user login',
      validate: {
        payload: Joi.object({
          username: Joi.string().max(50).required(),
          password: Joi.string().required(),
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
              accessToken: Joi.string(),
              refreshToken: Joi.string(),
            }),
          }),
        },
      },
    },
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler,
    options: {
      tags: ['api'],
      description: 'Update user access token',
      validate: {
        payload: Joi.object({
          refreshToken: Joi.string().required(),
        }),
        failAction: (request, reply, error) => {
          throw new InvariantError(error.message);
        },
      },
      response: {
        status: {
          200: Joi.object({
            status: 'success',
            message: Joi.string(),
            data: Joi.object({
              accessToken: Joi.string(),
            }),
          }),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler,
    options: {
      tags: ['api'],
      description: 'Delete user authentication',
      validate: {
        payload: Joi.object({
          refreshToken: Joi.string().required(),
        }),
        failAction: (request, reply, error) => {
          throw new InvariantError(error.message);
        },
      },
      response: {
        status: {
          200: Joi.object({
            status: 'success',
            message: Joi.string(),
          }),
        },
      },
    },
  },
];

module.exports = routes;
