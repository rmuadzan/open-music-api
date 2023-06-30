const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Create playlist',
      validate: {
        payload: Joi.object({
          name: Joi.string().required(),
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
              playlistId: Joi.string(),
            }),
          }),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Get all playlists',
      response: {
        status: {
          200: Joi.object({
            status: 'success',
            data: Joi.object({
              playlists: Joi.array(),
            }),
          }),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Delete playlist',
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
    path: '/playlists/{id}/songs',
    handler: handler.postSongtoPlaylistHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Add song to playlist',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          songId: Joi.string().required(),
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
          }),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: handler.getSongsfromPlaylistHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Get songs from playlist',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: 'success',
            data: Joi.object({
              playlist: Joi.object(),
            }),
          }),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: handler.deleteSongfromPlaylistHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Delete song from playlist',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          songId: Joi.string().required(),
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
          }),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: handler.getSongsActivitiesfromPlaylistHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Get activities of playlist',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: 'success',
            data: Joi.object({
              playlistId: Joi.string(),
              activities: Joi.array(),
            }),
          }),
        },
      },
    },
  },
];

module.exports = routes;
