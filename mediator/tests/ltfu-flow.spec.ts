import request from 'supertest';
import { OPENHIM, CHT, FHIR } from '../config';
import { EndpointFactory as EndpointFactoryBase, OrganizationFactory, ServiceRequestFactory } from '../src/middlewares/schemas/tests/fhir-resource-factories';
const openhimMediatorUtils = require('openhim-mediator-utils');

jest.setTimeout(10000);

let placeId: string;
let chwUserName: string;
let chwPassword: string;
let contactId: string;
let patientId: string;
let encounterUrl: String;
let endpointId: String;

const EndpointFactory = EndpointFactoryBase.attr('status', 'active')
  .attr('address', 'https://interop.free.beeceptor.com/callback')
  .attr('payloadType', [{ text: 'application/json' }]);

let installMediatorConfiguration = new Promise(function (resolve, reject) {

  openhimMediatorUtils.authenticate(
    {
      apiURL: OPENHIM.apiURL,
      username: OPENHIM.username,
      rejectUnauthorized: false,
    },
    async () => {
      const authHeaders = openhimMediatorUtils.genAuthHeaders({
        username: OPENHIM.username,
        password: OPENHIM.password,
      });

      try {
        const res = await request(OPENHIM.apiURL)
          .post("/mediators/urn:mediator:ltfu-mediator/channels")
          .send(['Mediator'])
          .set('auth-username', authHeaders['auth-username'])
          .set('auth-ts', authHeaders['auth-ts'])
          .set('auth-salt', authHeaders['auth-salt'])
          .set('auth-token', authHeaders['auth-token']);

        if (res.status == 201) {
          resolve('Success');
        } else {
          throw new Error(`Mediator channel installation failed: Reason ${res.status}`);
        }
      } catch (error) {
        return reject(error);
      }
    }
  );
});

const configureCHT = async () => {
  console.log(CHT.url);
  const createPlaceResponse = await request(CHT.url)
    .post('/api/v1/places')
    .auth(CHT.username, CHT.password)
    .send({ "name": "CHP Branch Two", "type": "district_hospital" });
  if (createPlaceResponse.status === 200 && createPlaceResponse.body.ok === true) {
    placeId = createPlaceResponse.body.id;
  } else {
    throw new Error(`CHT place creation failed: Reason ${createPlaceResponse.body}`);
  }
  const user = {
    password: "Dakar1234",
    username: "maria",
    type: "chw",
    place: {
      name: "CHP Branch One",
      type: "district_hospital",
      parent: placeId
    },
    contact: {
      name: "Maria Blob",
      phone: "+2868917046"
    }
  };
  chwUserName = user.username;
  chwPassword = user.password;
  const createUserResponse = await request(CHT.url)
    .post('/api/v2/users')
    .auth(CHT.username, CHT.password)
    .send(user);
  if (createUserResponse.status === 200) {
    contactId = createUserResponse.body.contact.id;
  } else {
    throw new Error(`CHT user creation failed: Reason ${createPlaceResponse.status}`);
  }
};

describe("Steps to follow the Loss To Follow-Up (LTFU) workflow", () => {
  beforeAll(async () => {
    await installMediatorConfiguration;
    await configureCHT();
  });

  it("Should follow the LTFU workflow", async () => {
    const checkMediatorResponse = await request(FHIR.url)
      .get("/mediator/")
      .auth(FHIR.username, FHIR.password);

    expect(checkMediatorResponse.status).toBe(200);
    expect(checkMediatorResponse.body.status).toBe("success");

    let identifier = [{ system: 'official', value: 'test-endpoint' }];

    const endpoint = EndpointFactory.build({ identifier: identifier });
    const createMediatorEndpointResponse = await request(FHIR.url)
      .post('/mediator/endpoint')
      .auth(FHIR.username, FHIR.password)
      .send(endpoint);

    expect(createMediatorEndpointResponse.status).toBe(201);
    endpointId = createMediatorEndpointResponse.body.id;

    /*TODO retreive endpoint*/

    identifier[0].value = 'test-org';
    const organization = OrganizationFactory.build({ endpointId: endpointId }, { identifier: identifier });
    console.log(organization)
    const createMediatorOrganizationResponse = await request(FHIR.url)
      .post('/mediator/organization')
      .auth(FHIR.username, FHIR.password)
      .send(organization);

    expect(createMediatorOrganizationResponse.status).toBe(201);

    /*TODO Retreive organization*/

    const patient = {
      name: "John Test",
      phone: "+2548277217095",
      date_of_birth: "1980-06-06",
      sex: "male",
      type: "person",
      role: "patient",
      contact_type: "patient",
      place: placeId
    };

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
    const serviceRequest2 = ServiceRequestFactory.build({ patientId: patientId }, { organizationId: identifier[0].value });
    console.log(serviceRequest2)
    const serviceRequest = {
      intent: "order",
      subject: {
        reference: `Patient/${patientId}`,
      },
      requester: {
        reference: "Organization/test-org",
      },
      status: "active",
    };

    const sendMediatorServiceRequestResponse = await request(FHIR.url)
      .post('/mediator/service-request')
      .auth(FHIR.username, FHIR.password)
      .send(serviceRequest);
    expect(sendMediatorServiceRequestResponse.status).toBe(201);
    encounterUrl = sendMediatorServiceRequestResponse.body.criteria;

    const taskForm = {
      "docs": [
        {
          "form": "interop_follow_up",
          "type": "data_record",
          "contact": {
            "_id": contactId,
            "parent": {
              "_id": placeId
            }
          },
          "from": "",
          "hidden_fields": [
            "meta"
          ],
          "fields": {
            "inputs": {
              "meta": {
                "location": {
                  "lat": "",
                  "long": "",
                  "error": "",
                  "message": ""
                },
                "deprecatedID": ""
              },
              "source": "task",
              "is_covid_vaccine_referral": "",
              "contact": {
                "_id": patientId,
                "name": "John Test",
                "date_of_birth": "1980-06-06",
                "sex": "male",
                "parent": {
                  "parent": {
                    "contact": {
                      "name": "",
                      "phone": ""
                    }
                  }
                }
              }
            },
            "vaccination_details": {
              "interop_follow_up": "yes"
            },
            "meta": {
              "instanceID": "uuid:0fbe39f1-8aa5-477a-89ea-863831766766"
            }
          },
          "_id": "{{$guid}}",
          "_rev": "1-{{$guid}}"
        }
      ],
      "new_edits": false
    };

    const submitChtTaskResponse = await request(CHT.url)
      .post('/medic/_bulk_docs')
      .auth(chwUserName, chwPassword)
      .send(taskForm);

    expect(submitChtTaskResponse.status).toBe(201);

    await new Promise((r) => setTimeout(r, 1000));

    const retrieveFhirDbEncounter = await request(FHIR.url)
      .get('/fhir/' + encounterUrl)
      .auth(FHIR.username, FHIR.password);

    expect(retrieveFhirDbEncounter.status).toBe(200);
    expect(retrieveFhirDbEncounter.body.total).toBe(1);
  });
});

