const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsServices, playlistsServices, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsServices,
      playlistsServices,
      validator,
    );
    server.route(routes(collaborationsHandler));
  },
};
