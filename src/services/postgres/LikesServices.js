const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesServices {
  constructor(albumsServices, cacheServices) {
    this._pool = new Pool();
    this._albumsServices = albumsServices;
    this._cacheServices = cacheServices;
  }

  async addAlbumLike(userId, albumId) {
    await this._albumsServices.verifyAlbumExistence(albumId);
    const id = `album_like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    let result;
    try {
      result = await this._pool.query(query);
    } catch (error) {
      throw new InvariantError('Like gagal ditambahkan. Album telah disukai');
    }

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this._cacheServices.delete(`albums:${albumId}`);
  }

  async getAlbumLikesById(albumId) {
    await this._albumsServices.verifyAlbumExistence(albumId);

    try {
      const result = await this._cacheServices.get(`albums:${albumId}`);
      return { result: JSON.parse(result), status: 'cache' };
    } catch (error) {
      const albumsQuery = {
        text: `SELECT COUNT(id) AS "likes" 
        FROM user_album_likes
        WHERE album_id = $1
        GROUP BY album_id`,
        values: [albumId],
      };
      const queryResult = await this._pool.query(albumsQuery);

      if (!queryResult.rowCount) {
        throw new NotFoundError('Likes album tidak ditemukan');
      }

      const result = queryResult.rows[0];
      await this._cacheServices.set(`albums:${albumId}`, JSON.stringify(result));

      return { result, status: 'database' };
    }
  }

  async deleteAlbumLikeById(userId, albumId) {
    await this._albumsServices.verifyAlbumExistence(albumId);
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal batal menyukai album. Id tidak ditemukan');
    }

    await this._cacheServices.delete(`albums:${albumId}`);
  }
}

module.exports = LikesServices;
