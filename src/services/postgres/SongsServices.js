const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongDBToModel } = require('../../utils');

class SongsServices {
  constructor(cacheServices) {
    this._pool = new Pool();
    this._cacheServices = cacheServices;
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getSongs({ title = '', performer = '' }) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
      values: [`%${title}%`, `%${performer}%`],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getSongById(id) {
    try {
      const result = await this._cacheServices.get(`song:${id}`);
      return { result: JSON.parse(result), status: 'cache' };
    } catch {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
      };
      const { rows, rowCount } = await this._pool.query(query);

      if (!rowCount) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }

      const result = rows[0];
      await this._cacheServices.set(`song:${id}`, JSON.stringify(result));

      return { result: mapSongDBToModel(result), status: 'database' };
    }
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId = null,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    await this._cacheServices.delete(`song:${id}`);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheServices.delete(`song:${id}`);
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async verifySongExistence(id) {
    const query = {
      text: 'SELECT 1 from songs WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = SongsServices;
