export const mediatorConfig = {
  urn: 'urn:mediator:ltfu-mediator',
  version: '1.0.0',
  name: 'Loss to Follow Up Mediator',
  description: 'A loss to follow up mediator for mediator for CHIS.',
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
