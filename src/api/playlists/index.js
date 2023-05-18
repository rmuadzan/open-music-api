const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsServices,
    playlistsSongsServices,
    songsServices,
    playlistsValidator,
    playlistsSongsValidator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsServices,
      playlistsSongsServices,
      songsServices,
      playlistsValidator,
      playlistsSongsValidator,
    );
    server.route(routes(playlistsHandler));
  },
};
