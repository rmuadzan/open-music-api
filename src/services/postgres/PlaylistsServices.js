const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsServices {
  constructor(collaborationsServices, cacheServices) {
    this._pool = new Pool();
    this._collaborationsServices = collaborationsServices;
    this._cacheServices = cacheServices;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id AS "id", playlists.name AS "name", users.username AS "username" 
      FROM playlists 
      LEFT JOIN users on users.id = playlists.owner
      LEFT JOIN collaborations on collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getPlaylistById(id) {
    try {
      const result = await this._cacheServices.get(`playlist:${id}`);
      return { result: JSON.parse(result), status: 'cache' };
    } catch (error) {
      const query = {
        text: `SELECT playlists.id AS "id", playlists.name AS "name", users.username AS "username" 
        FROM playlists 
        LEFT JOIN users on users.id = playlists.owner
        WHERE playlists.id = $1`,
        values: [id],
      };
      const { rows, rowCount } = await this._pool.query(query);

      if (!rowCount) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }

      const result = rows[0];
      await this._cacheServices.set(`playlist:${id}`, JSON.stringify(result));

      return { result, status: 'database' };
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }

    this._cacheServices.delete(`playlist:${id}`);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsServices.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsServices;
