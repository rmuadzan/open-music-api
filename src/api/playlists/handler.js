const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(
    playlistsServices,
    playlistsSongsServices,
    playlistsSongsActivitiesServices,
    playlistsValidator,
    playlistsSongsValidator,
  ) {
    this._playlistsServices = playlistsServices;
    this._playlistsSongsServices = playlistsSongsServices;
    this._playlistsSongsActivitiesServices = playlistsSongsActivitiesServices;
    this._playlistsValidator = playlistsValidator;
    this._playlistsSongsValidator = playlistsSongsValidator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._playlistsValidator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { userId } = request.auth.credentials;

    const playlistId = await this._playlistsServices.addPlaylist(name, userId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { userId } = request.auth.credentials;
    const playlists = await this._playlistsServices.getPlaylists(userId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;
    await this._playlistsServices.verifyPlaylistOwner(id, userId);
    await this._playlistsServices.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongtoPlaylistHandler(request, h) {
    this._playlistsSongsValidator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistAccess(id, userId);

    await this._playlistsSongsServices.addPlaylistsSong(id, songId);

    await this._playlistsSongsActivitiesServices.addPlaylistsSongsActivity({
      playlistId: id, songId, userId, action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke dalam playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsfromPlaylistHandler(request) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistAccess(id, userId);

    const playlist = await this._playlistsServices.getPlaylistById(id);
    const songs = await this._playlistsSongsServices.getPlaylistsSongs(id);
    return {
      status: 'success',
      data: {
        playlist: {
          ...playlist,
          songs,
        },
      },
    };
  }

  async deleteSongfromPlaylistHandler(request) {
    this._playlistsSongsValidator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistAccess(id, userId);
    await this._playlistsSongsServices.deletePlaylistsSong(songId, id);

    await this._playlistsSongsActivitiesServices.addPlaylistsSongsActivity({
      playlistId: id, songId, userId, action: 'delete',
    });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getSongsActivitiesfromPlaylistHandler(request) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistAccess(id, userId);

    const activities = await this._playlistsSongsActivitiesServices.getPlaylistsSongsActivities(id);
    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
