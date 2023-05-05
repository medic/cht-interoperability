import request from 'supertest';
import { OPENHIM, CHT, FHIR } from '../config';
import {
  UserFactory, PatientFactory, TaskReportFactory
} from './cht-resource-factories';
import {
  EndpointFactory as EndpointFactoryBase,
  OrganizationFactory as OrganizationFactoryBase,
  ServiceRequestFactory as ServiceRequestFactoryBase
} from '../src/middlewares/schemas/tests/fhir-resource-factories';
const { generateAuthHeaders } = require('../../configurator/libs/authentication');

jest.setTimeout(10000);

const EndpointFactory = EndpointFactoryBase.attr('status', 'active')
  .attr('address', 'https://interop.free.beeceptor.com/callback')
  .attr('payloadType', [{ text: 'application/json' }]);

const OrganizationFactory = OrganizationFactoryBase.attr('identifier', [{ system: 'official', value: 'test-org' }]);

const ServiceRequestFactory = ServiceRequestFactoryBase.attr('status', 'active');

const installMediatorConfiguration = async () => {
  const authHeaders = await generateAuthHeaders({
    apiURL: OPENHIM.apiURL,
    username: OPENHIM.username,
    password: OPENHIM.password,
    rejectUnauthorized: false,
  });
  try {
    const res = await request(OPENHIM.apiURL)
      .post('/mediators/urn:mediator:ltfu-mediator/channels')
      .send(['Mediator'])
      .set('auth-username', authHeaders['auth-username'])
      .set('auth-ts', authHeaders['auth-ts'])
      .set('auth-salt', authHeaders['auth-salt'])
      .set('auth-token', authHeaders['auth-token']);

    if (res.status !== 201) {
      throw new Error(`Mediator channel installation failed: Reason ${res.status}`);
    }
  } catch (error) {
    throw new Error(`Mediator channel installation failed`);
  }
}
let placeId: string;
let chwUserName: string;
let chwPassword: string;
let contactId: string;

const configureCHT = async () => {
  const createPlaceResponse = await request(CHT.url)
    .post('/api/v1/places')
    .auth(CHT.username, CHT.password)
    .send({ 'name': 'CHP Branch Two', 'type': 'district_hospital' });

  if (createPlaceResponse.status === 200 && createPlaceResponse.body.ok === true) {
    placeId = createPlaceResponse.body.id;
  } else {
    throw new Error(`CHT place creation failed: Reason ${createPlaceResponse.body}`);
  }

  const user = UserFactory.build({}, { placeId: placeId });

  chwUserName = user.username;
  chwPassword = user.password;

  const createUserResponse = await request(CHT.url)
    .post('/api/v2/users')
    .auth(CHT.username, CHT.password)
    .send(user);
  if (createUserResponse.status === 200) {
    contactId = createUserResponse.body.contact.id;
  } else {
    throw new Error(`CHT user creation failed: Reason ${createUserResponse.status}`);
  }
};

describe('Steps to follow the Loss To Follow-Up (LTFU) workflow', () => {
  let patientId: string;
  let encounterUrl: string;
  let endpointId: string;

  beforeAll(async () => {
    await installMediatorConfiguration();
    await configureCHT();
  });

  it('Should follow the LTFU workflow', async () => {
    const checkMediatorResponse = await request(FHIR.url)
      .get('/mediator/')
      .auth(FHIR.username, FHIR.password);

    expect(checkMediatorResponse.status).toBe(200);
    expect(checkMediatorResponse.body.status).toBe('success');

    const identifier = [{ system: 'official', value: 'test-endpoint' }];
    const endpoint = EndpointFactory.build({ identifier: identifier });
    const createMediatorEndpointResponse = await request(FHIR.url)
      .post('/mediator/endpoint')
      .auth(FHIR.username, FHIR.password)
      .send(endpoint);

    expect(createMediatorEndpointResponse.status).toBe(201);
    endpointId = createMediatorEndpointResponse.body.id;

    /*TODO retreive endpoint*/
    const organization = OrganizationFactory.build();
    organization.endpoint[0].reference = `Endpoint/${endpointId}`;

    const createMediatorOrganizationResponse = await request(FHIR.url)
      .post('/mediator/organization')
      .auth(FHIR.username, FHIR.password)
      .send(organization);

    expect(createMediatorOrganizationResponse.status).toBe(201);

    /*TODO Retreive organization*/
    const patient = PatientFactory.build({}, { placeId: placeId });

    const createPatientResponse = await request(CHT.url)
      .post('/api/v1/people')
      .auth(chwUserName, chwPassword)
      .send(patient);

    expect(createPatientResponse.status).toBe(200);
    expect(createPatientResponse.body.ok).toEqual(true);
    patientId = createPatientResponse.body.id;

    const retrieveFhirPatientIdResponse = await request(FHIR.url)
      .get('/fhir/Patient/?identifier=' + patientId)
      .auth(FHIR.username, FHIR.password);

    expect(retrieveFhirPatientIdResponse.status).toBe(200);
    const serviceRequest = ServiceRequestFactory.build();
    serviceRequest.subject.reference = `Patient/${patientId}`;
    serviceRequest.requester.reference = 'Organization/test-org';

    const sendMediatorServiceRequestResponse = await request(FHIR.url)
      .post('/mediator/service-request')
      .auth(FHIR.username, FHIR.password)
      .send(serviceRequest);
    expect(sendMediatorServiceRequestResponse.status).toBe(201);
    encounterUrl = sendMediatorServiceRequestResponse.body.criteria;

    const taskReport = TaskReportFactory.build({}, { placeId, contactId, patientId });

    const submitChtTaskResponse = await request(CHT.url)
      .post('/medic/_bulk_docs')
      .auth(chwUserName, chwPassword)
      .send(taskReport);

    expect(submitChtTaskResponse.status).toBe(201);

    await new Promise((r) => setTimeout(r, 1000));

    const retrieveFhirDbEncounter = await request(FHIR.url)
      .get('/fhir/' + encounterUrl)
      .auth(FHIR.username, FHIR.password);

    expect(retrieveFhirDbEncounter.status).toBe(200);
    expect(retrieveFhirDbEncounter.body.total).toBe(1);
  });
});

