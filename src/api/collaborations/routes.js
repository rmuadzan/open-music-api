const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollaborationHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Add collaborator to playlist',
      validate: {
        payload: Joi.object({
          playlistId: Joi.string().max(50).required(),
          userId: Joi.string().max(50).required(),
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
              collaborationId: Joi.string(),
            }),
          }),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: 'openmusicapp_jwt',
      tags: ['api'],
      description: 'Delete collaborator to playlist',
      validate: {
        payload: Joi.object({
          playlistId: Joi.string().max(50).required(),
          userId: Joi.string().max(50).required(),
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
