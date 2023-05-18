const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsServices, playlistsServices, validator) {
    this._collaborationsServices = collaborationsServices;
    this._playlistsServices = playlistsServices;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { userId: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsServices.verifyPlaylistAccess(playlistId, credentialId);
    const collaborationId = await this._collaborationsServices.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const { userId: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsServices.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsServices.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
