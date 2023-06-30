const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
    options: {
      tags: ['api'],
      description: 'Create album',
      validate: {
        payload: Joi.object({
          name: Joi.string(),
          year: Joi.number()
            .required(),
        }),
        failAction: (request, reply, error) => {
          throw new InvariantError(error.message);
        },
      },
      response: {
        status: {
          201: Joi.object({
            status: 'success',
            data: Joi.object({
              albumId: Joi.string(),
            }),
          }),
          400: Joi.object({
            statusCode: 400,
            error: Joi.string(),
            message: Joi.string(),
          }),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
    options: {
      tags: ['api'],
      description: 'Get album',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
      response: {
        // status: {
        //   200: Joi.object({
        //     status: 'success',
        //     data: Joi.object({
        //       album: Joi.object({
        //         id: Joi.string(),
        //         name: Joi.string(),
        //         year: Joi.number().integer(),
        //         coverUrl: Joi.string(),
        //         songs: Joi.array().items(Joi.object({
        //           id: Joi.string(),
        //           title: Joi.string(),
        //           performer: Joi.string(),
        //         })),
        //       }),
        //     }),
        //   }),
        // },
      },
    },
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
    options: {
      tags: ['api'],
      description: 'Update album',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          year: Joi.number().integer().min(1900).max(new Date().getFullYear())
            .required(),
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
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
    options: {
      tags: ['api'],
      description: 'Delete album',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
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
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.postAlbumLikeHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Like album',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
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
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getAlbumLikesByIdHandler,
    options: {
      tags: ['api'],
      description: 'Get total likes of album',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
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
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: handler.deleteAlbumLikeByIdHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Unlike album',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
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
