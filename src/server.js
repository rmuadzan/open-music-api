require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./api/albums');
const AlbumsValidator = require('./validator/albums');
const songs = require('./api/songs');
const SongsValidator = require('./validator/songs');
const {
  AlbumsServices,
  UsersServices,
  SongsServices,
  AuthenticationsServices,
  PlaylistsServices,
  PlaylistsSongsServices,
  CollaborationsServices,
  PlaylistsSongsActivitiesServices,
} = require('./services/postgres');
const ClientError = require('./exceptions/ClientError');
const users = require('./api/users');
const UsersValidator = require('./validator/users');
const authentications = require('./api/authentications');
const TokenManager = require('./tokenize/tokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const playlists = require('./api/playlists');
const PlaylistsValidator = require('./validator/playlists');
const PlaylistsSongsValidator = require('./validator/playlistsSongs');
const collaborations = require('./api/collaborations');
const CollaborationsValidator = require('./validator/collaborations');

const init = async () => {
  const albumsServices = new AlbumsServices();
  const songsServices = new SongsServices();
  const usersServices = new UsersServices();
  const authenticationsServices = new AuthenticationsServices();
  const collaborationsServices = new CollaborationsServices(usersServices);
  const playlistsServices = new PlaylistsServices(collaborationsServices);
  const playlistsSongsServices = new PlaylistsSongsServices(songsServices);
  const playlistsSongsActivitiesServices = new PlaylistsSongsActivitiesServices();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsServices,
        validator: AlbumsValidator,
        songService: songsServices,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsServices,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersServices,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsServices,
        usersServices,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsServices,
        playlistsSongsServices,
        playlistsSongsActivitiesServices,
        playlistsValidator: PlaylistsValidator,
        playlistsSongsValidator: PlaylistsSongsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsServices,
        playlistsServices,
        validator: CollaborationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
