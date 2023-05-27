const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsSongsServices {
  constructor(songsServices, cacheServices) {
    this._pool = new Pool();
    this._songsServices = songsServices;
    this._cacheServices = cacheServices;
  }

  async addPlaylistsSong(playlistId, songId) {
    await this._songsServices.verifySongExistence(songId);
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }

    await this._cacheServices.delete(`playlist-songs:${playlistId}`);
  }

  async getPlaylistsSongs(playlistId) {
    try {
      const result = await this._cacheServices.get(`playlist-songs:${playlistId}`);
      return { result: JSON.parse(result), status: 'cache' };
    } catch (error) {
      const query = {
        text: `SELECT playlists_songs.id AS "id", songs.title AS "title", songs.performer AS "performer"
        FROM playlists_songs 
        LEFT JOIN playlists ON playlists.id = playlists_songs.playlist_id 
        LEFT JOIN songs ON songs.id = playlists_songs.song_id
        WHERE playlists.id = $1`,
        values: [playlistId],
      };
      const { rows } = await this._pool.query(query);

      const result = rows;
      await this._cacheServices.set(`playlist-songs:${playlistId}`, JSON.stringify(result));

      return { result, status: 'database' };
    }
  }

  async deletePlaylistsSong(id, playlistId) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [id, playlistId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheServices.delete(`playlist-songs:${playlistId}`);
  }
}

module.exports = PlaylistsSongsServices;
