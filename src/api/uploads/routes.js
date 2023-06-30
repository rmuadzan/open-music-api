const Joi = require('joi');
const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
      tags: ['api'],
      description: 'Add album cover',
      validate: {
        params: Joi.object({
          id: Joi.string(),
        }),
      },
      response: {
        status: {
          201: Joi.object({
            status: 'success',
            message: Joi.string(),
          }),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/upload/images/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file/images'),
      },
    },
  },
];

module.exports = routes;
