const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator, songService, likesServices) {
    this._service = service;
    this._validator = validator;
    this._songService = songService;
    this._likesServices = likesServices;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._songService.getSongsByAlbumId(id);
    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._likesServices.addAlbumLike(userId, id);

    const response = h.response({
      status: 'success',
      message: 'Berhasil like album',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;

    const { result: likes, status } = await this._likesServices.getAlbumLikesById(id);
    likes.likes = parseInt(likes.likes, 10);

    const response = h.response({
      status: 'success',
      data: likes,
    }).code(200);

    if (status === 'cache') {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteAlbumLikeByIdHandler(request) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._likesServices.deleteAlbumLikeById(userId, id);
    return {
      status: 'success',
      message: 'Berhasil unlike album',
    };
  }
}

module.exports = AlbumsHandler;
