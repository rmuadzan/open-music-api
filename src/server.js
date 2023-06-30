require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const path = require('path');

const config = require('./utils/config');
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
  LikesServices,
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
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerServices');
const ExportsValidator = require('./validator/exports');
const uploads = require('./api/uploads');
const UploadsValidator = require('./validator/uploads');
const StorageServices = require('./services/storage/StorageServices');
const CacheService = require('./services/redis/CacheServices');

const init = async () => {
  const cacheServices = new CacheService();
  const albumsServices = new AlbumsServices(cacheServices);
  const likesServices = new LikesServices(albumsServices, cacheServices);
  const songsServices = new SongsServices(cacheServices);
  const usersServices = new UsersServices();
  const authenticationsServices = new AuthenticationsServices();
  const collaborationsServices = new CollaborationsServices(usersServices);
  const playlistsServices = new PlaylistsServices(collaborationsServices, cacheServices);
  const playlistsSongsServices = new PlaylistsSongsServices(songsServices, cacheServices);
  const playlistsSongsActivitiesServices = new PlaylistsSongsActivitiesServices();
  const storageService = new StorageServices(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    debug: { request: ['error'] },
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
    {
      plugin: Inert,
    },
    {
      plugin: Vision,
    },
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'Test API Documentation',
          version: '1.0.0',
        },
      },
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

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      h.redirect('/documentation');
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsServices,
        validator: AlbumsValidator,
        songService: songsServices,
        likesServices,
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
    {
      plugin: _exports,
      options: {
        ExportsServices: ProducerService,
        playlistsServices,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        uploadsService: storageService,
        albumsServices,
        validator: UploadsValidator,
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
