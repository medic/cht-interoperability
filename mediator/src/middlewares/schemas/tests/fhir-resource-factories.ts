import { randomUUID } from 'crypto';
import { Factory } from 'rosie';
import { VALID_CODE, VALID_SYSTEM } from '../endpoint';

const identifier = [
  {
    system: 'cht',
    value: randomUUID(),
  },
];

export const HumanNameFactory = Factory.define('humanName')
  .attr('family', 'Doe')
  .attr('given', ['John']);

export const PatientFactory = Factory.define('patient')
  .attr('identifier', identifier)
  .attr('name', () => [HumanNameFactory.build()])
  .attr('gender', 'male')
  .attr('birthDate', '2000-01-01');

export const EncounterFactory = Factory.define('encounter')
  .attr('identifier', identifier)
  .attr('status', 'planned')
  .attr('class', 'outpatient')
  .attr('type', [{ text: 'Community health worker visit' }])
  .attr('subject', { reference: 'Patient/3' })
  .attr('participant', [{ type: [{ text: 'Community health worker' }] }]);

export const EndpointFactory = Factory.define('endpoint')
  .attr('connectionType', { system: VALID_SYSTEM, code: VALID_CODE })
  .attr('identifier', identifier);

export const OrganizationFactory = Factory.define('organization')
  .attr('name', ['athena'])
  .attr('endpoint', [{ reference: 'Endpoint/' + randomUUID() }]);

const SubjectFactory = Factory.define('subject').option('patienId', randomUUID()).attr(
  'reference', ['patientId'], (patienId) => { 'Patient/' + patienId });

const RequesterFactory = Factory.define('subject').option('organizationId', randomUUID()).attr(
  'reference', ['organizationId'], (organizationId) => { 'Organization/' + organizationId }
);

export const ServiceRequestFactory = Factory.define('serviceRequest')
  .option('patienId', randomUUID())
  .option('organizationId', randomUUID())
  .attr('intent', 'order')
  .attr('subject', ['patientId'], (patienId) => { SubjectFactory.build({ patienId: patienId }) })
  .attr('requester', ['organizationId'], (organizationId) => { RequesterFactory.build({ organizationId: organizationId }) });
