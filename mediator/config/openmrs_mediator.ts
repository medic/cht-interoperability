export const openMRSMediatorConfig = {
  urn: 'urn:mediator:openmrs-mediator',
  version: '1.0.0',
  name: 'OpenMRS Mediator',
  description: 'A mediator to sync CHT data with OpenMRS',
  defaultChannelConfig: [
    {
      name: 'OpenMRS Sync',
      urlPattern: '^/trigger$',
      routes: [
        {
          name: 'OpenMRS polling Mediator',
          host: 'mediator',
          path: '/openmrs/sync',
          port: 6000,
          primary: true,
          type: 'http',
        },
      ],
      allow: ['interop'],
      type: 'polling',
      pollingSchedule: '1 minute'
    },
  ],
  endpoints: [
    {
      name: 'OpenMRS Mediator',
      host: 'mediator',
      path: '/openmrs/sync',
      port: '6000',
      primary: true,
      type: 'http',
    },
  ],
};
