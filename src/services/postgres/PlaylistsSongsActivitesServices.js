const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistsSongsServices {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistsSongsActivity({
    playlistId, songId, userId, action,
  }) {
    const id = `song_actv-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlists_songs_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Riwayat aktivitas gagal ditambahkan ke dalam lagu playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylistsSongsActivities(playlistId) {
    const query = {
      text: `SELECT users.username AS "username", songs.title AS "title", playlists_songs_activities.action AS "action", playlists_songs_activities.time AS "time"
      FROM playlists_songs_activities
      LEFT JOIN playlists ON playlists.id = playlists_songs_activities.playlist_id 
      LEFT JOIN songs ON songs.id = playlists_songs_activities.song_id
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1
      ORDER BY playlists_songs_activities.time`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistsSongsServices;
