const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler,
    options: {
      tags: ['api'],
      description: 'Create song',
      validate: {
        payload: Joi.object({
          title: Joi.string().required(),
          year: Joi.number().integer().min(1900).max(new Date().getFullYear())
            .required(),
          genre: Joi.string().required(),
          performer: Joi.string().required(),
          duration: Joi.number(),
          albumId: Joi.string().max(50),
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
              songId: Joi.string(),
            }),
          }),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongsHandler,
    options: {
      tags: ['api'],
      description: 'Get all songs',
      validate: {
        query: Joi.object({
          title: Joi.string(),
          performer: Joi.string(),
        }),
      },
      // response: {
      //   status: {
      //     200: Joi.object({
      //       status: 'success',
      //       data: Joi.object({
      //         songs: Joi.object(),
      //       }),
      //     }),
      //   },
      // },
    },
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHandler,
    options: {
      tags: ['api'],
      description: 'Get song',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
      // response: {
      //   status: {
      //     200: Joi.object({
      //       status: 'success',
      //       data: Joi.object({
      //         song: Joi.object({
      //         }),
      //       }),
      //     }),
      //   },
      // },
    },
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler,
    options: {
      tags: ['api'],
      description: 'Update song',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          title: Joi.string().required(),
          year: Joi.number().integer().min(1900).max(new Date().getFullYear())
            .required(),
          genre: Joi.string().required(),
          performer: Joi.string().required(),
          duration: Joi.number(),
          albumId: Joi.string().max(50),
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
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler,
    options: {
      tags: ['api'],
      description: 'Delete song',
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
