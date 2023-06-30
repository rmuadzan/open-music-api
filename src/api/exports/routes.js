const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.postExportPlaylistsHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'export songs from playlist',
      validate: {
        params: Joi.object({
          playlistId: Joi.string().required(),
        }),
        payload: Joi.object({
          targetEmail: Joi.string(),
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
];

module.exports = routes;
