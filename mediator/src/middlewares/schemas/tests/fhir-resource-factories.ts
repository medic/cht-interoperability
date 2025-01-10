import { randomUUID } from 'crypto';
import { Factory } from 'rosie';
import { VALID_CODE, VALID_SYSTEM } from '../endpoint';
import { chtDocumentIdentifierType } from '../../../mappers/cht';

const identifier = [
  {
    type: chtDocumentIdentifierType,
    system: 'cht',
    value: randomUUID(),
  },
];

export const HumanNameFactory = Factory.define('humanName')
  .attr('family', 'Doe')
  .attr('given', ['John']);

export const PatientFactory = Factory.define('patient')
  .attr('resourceType', 'Patient')
  .attr('id', randomUUID())
  .attr('identifier', identifier)
  .attr('name', () => [HumanNameFactory.build()])
  .attr('gender', 'male')
  .attr('birthDate', '2000-01-01');

export const EncounterFactory = Factory.define('encounter')
  .attr('resourceType', 'Encounter')
  .attr('id', randomUUID())
  .attr('identifier', identifier)
  .attr('status', 'finished')
  .attr('class', 'outpatient')
  .attr('type', [{ text: 'Community health worker visit' }])
  .attr('subject', { reference: 'Patient/3' })
  .attr('participant', [{ type: [{ text: 'Community health worker' }] }])
  .attr('period', {
    start: new Date(new Date().getTime() - 60 * 60 * 1000).toISOString(),
    end: new Date(new Date().getTime() - 50 * 60 * 1000).toISOString()
  })

export const EndpointFactory = Factory.define('endpoint')
  .attr('connectionType', { system: VALID_SYSTEM, code: VALID_CODE })
  .attr('identifier', identifier);

export const OrganizationFactory = Factory.define('organization')
  .attr('name', ['athena'])
  .attr('endpoint', [{ reference: 'Endpoint/' + randomUUID() }]);

const SubjectFactory = Factory.define('subject').attr(
  'reference',
  () => 'Patient/' + randomUUID()
);

const RequesterFactory = Factory.define('subject').attr(
  'reference',
  () => 'Organization/' + randomUUID()
);

export const ServiceRequestFactory = Factory.define('serviceRequest')
  .attr('intent', 'order')
  .attr('subject', SubjectFactory.build())
  .attr('requester', RequesterFactory.build());

export const ObservationFactory = Factory.define('Observation')
  .attr('resourceType', 'Observation')
  .attr('id', () => randomUUID())
  .attr('encounter', () => { reference: 'Encounter/' + randomUUID() })
  .attr('code', {
    coding: [{ code: 'DANGER_SIGNS' }],
  })
  .attr('valueCodeableConcept', {
    coding: [{ code: 'HIGH_BLOOD_PRESSURE' }]
  });
