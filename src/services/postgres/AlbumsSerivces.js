const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsServices {
  constructor(cacheServices) {
    this._pool = new Pool();
    this._cacheServices = cacheServices;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, year, createdAt],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getAlbumById(id) {
    try {
      const result = await this._cacheServices.get(`albums:${id}`);
      console.log('1');
      return { result: JSON.parse(result), status: 'cache' };
    } catch (error) {
      const albumsQuery = {
        text: 'SELECT id, name, year, cover AS "coverUrl" FROM albums WHERE id = $1',
        values: [id],
      };

      const { rows, rowCount } = await this._pool.query(albumsQuery);

      if (!rowCount) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      const result = rows[0];
      await this._cacheServices.set(`albums:${id}`, JSON.stringify(result));

      console.log('2');

      return { result, status: 'database' };
    }
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }

    await this._cacheServices.delete(`albums:${id}`);
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheServices.delete(`albums:${id}`);
  }

  async addAlbumsCover(fileLocation, albumId) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [fileLocation, albumId],
    };

    await this._pool.query(query);
    await this._cacheServices.delete(`albums:${albumId}`);
  }

  async verifyAlbumExistence(id) {
    const query = {
      text: 'SELECT 1 from albums WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = AlbumsServices;
