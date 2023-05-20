const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { uploadsService, albumsServices, validator }) => {
    const uploadsHandler = new UploadsHandler(uploadsService, albumsServices, validator);
    server.route(routes(uploadsHandler));
  },
};
