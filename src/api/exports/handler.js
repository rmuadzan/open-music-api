const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(ExportsServices, playlistsServices, validator) {
    this._exportsServices = ExportsServices;
    this._validator = validator;
    this._playlistsServices = playlistsServices;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const { playlistId } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._exportsServices.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
