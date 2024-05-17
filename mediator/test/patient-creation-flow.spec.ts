import request from 'supertest';
import { OPENHIM, CHT, FHIR } from '../config';
import {
  UserFactory, PatientFactory
} from './cht-resource-factories';

const { generateAuthHeaders } = require('../../configurator/libs/authentication');

jest.setTimeout(10000);

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
    throw new Error(`Mediator channel installation failed ${error}`);
  }
};
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
    throw new Error(`CHT place creation failed: Reason ${createPlaceResponse.status}`);
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

describe('Gandaki workflows', () => {
  let patientId: string;

  beforeAll(async () => {
    await installMediatorConfiguration();
    await configureCHT();
  });

  it('Should follow the CHT Patient to OpenMRS workflow', async () => {
    const checkMediatorResponse = await request(FHIR.url)
      .get('/mediator/')
      .auth(FHIR.username, FHIR.password);

    expect(checkMediatorResponse.status).toBe(200);
    expect(checkMediatorResponse.body.status).toBe('success');

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

  });

  it('Should follow the OpenMRS Patient to CHT workflow', async () => {

  });
});

