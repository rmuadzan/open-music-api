const Joi = require('joi');

const PlaylistSongsPayloadSchema = Joi.object({
  songId: Joi.string().max(50).required(),
});

module.exports = { PlaylistSongsPayloadSchema };
