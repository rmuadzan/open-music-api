const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsSongsServices {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistsSong(playlistId, songId) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylistsSongs(playlistId) {
    const query = {
      text: `SELECT playlists_songs.id AS "id", songs.title AS "title", songs.performer AS "performer"
      FROM playlists_songs 
      LEFT JOIN playlists ON playlists.id = playlists_songs.playlist_id 
      LEFT JOIN songs ON songs.id = playlists_songs.song_id
      WHERE playlists.id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistsSong(id, playlistId) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [id, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsSongsServices;
