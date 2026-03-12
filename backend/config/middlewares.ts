import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:5173',
        'https://localhost:5173',
        'http://127.0.0.1:5173',
        'https://127.0.0.1:5173',
        'http://localhost:3000',
        'https://localhost:3000',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      headers: '*',
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;