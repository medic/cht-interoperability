export const openMRSMediatorConfig = {
  urn: 'urn:mediator:openmrs-mediator',
  version: '1.0.0',
  name: 'OpenMRS Mediator',
  description: 'A mediator to sync CHT data with OpenMRS',
  endpoints: [
    {
      name: 'OpenMRS Mediator',
      host: 'mediator',
      path: '/',
      port: '6000',
      primary: true,
      type: 'http',
    },
  ],
};
