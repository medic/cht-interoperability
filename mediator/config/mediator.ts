export const mediatorConfig = {
  urn: 'urn:mediator:cht-mediator',
  version: '1.0.0',
  name: 'CHT Mediator',
  description: 'The default mediator for CHT applications',
  defaultChannelConfig: [
    {
      name: 'Mediator',
      urlPattern: '^/mediator/.*$',
      routes: [
        {
          name: 'Mediator',
          host: 'mediator',
          pathTransform: 's/\\/mediator/',
          port: 6000,
          primary: true,
          type: 'http',
        },
      ],
      allow: ['interop'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      type: 'http',
    },
  ],
  endpoints: [
    {
      name: 'Mediator',
      host: 'mediator',
      path: '/',
      port: '6000',
      primary: true,
      type: 'http',
    },
  ],
};
