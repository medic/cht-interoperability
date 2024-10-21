export const openMRSMediatorConfig = {
  urn: 'urn:mediator:openmrs-mediator',
  version: '1.0.0',
  name: 'OpenMRS Mediator',
  description: 'A mediator to sync CHT data with OpenMRS',
  defaultChannelConfig: [
    {
      name: 'OpenMRS Mediator',
      urlPattern: '^/openmrs/.*$',
      routes: [
        {
          name: 'OpenMRS Mediator',
          host: 'mediator',
          pathTransform: 's/\\/openmrs/',
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
      name: 'OpenMRS Mediator',
      host: 'openmrs',
      path: '/',
      port: '6000',
      primary: true,
      type: 'http',
    },
  ],
};
