import request from 'supertest';
const openhimMediatorUtils = require('openhim-mediator-utils');
let placeId: string;
let chwUserName: string;
let chwPassword: string;
let contactId: string;
let patientId: string;
let encounterUrl: String;

let installMediatorConfiguration = new Promise(function (resolve, reject) {
  openhimMediatorUtils.authenticate(
    {
      apiURL: "https://localhost:8080",
      username: "interop@openhim.org",
      rejectUnauthorized: false,
    },
    async () => {
      const authHeaders = openhimMediatorUtils.genAuthHeaders({
        username: "interop@openhim.org",
        password: "interop-password",
      });

      try {
        const res = await request('https://localhost:8080')
          .post("/mediators/urn:mediator:ltfu-mediator/channels")
          .send(['Mediator'])
          .set('auth-username', authHeaders['auth-username'])
          .set('auth-ts', authHeaders['auth-ts'])
          .set('auth-salt', authHeaders['auth-salt'])
          .set('auth-token', authHeaders['auth-token']);

        if (res.status == 201) {
          resolve('Exito');
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
  const createPlaceResponse = await request('http://localhost:5988')
    .post('/api/v1/places')
    .auth('admin', 'password')
    .send({ "name": "CHP Branch Two", "type": "district_hospital" });
  if (createPlaceResponse.status == 200 && createPlaceResponse.body.ok == true) {
    placeId = createPlaceResponse.body.id;
  } else {
    throw new Error(`CHT place creation failed: Reason ${createPlaceResponse.status}`);
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
  const createUserResponse = await request('http://localhost:5988')
    .post('/api/v2/users')
    .auth('admin', 'password')
    .send(user);
  expect(createUserResponse.status).toBe(200);
  if (createUserResponse.status == 200) {
    contactId = createUserResponse.body.contact.id;
  } else {
    throw new Error(`CHT user creation failed: Reason ${createPlaceResponse.status}`);
  }
};

describe.only("Steps to follow the Loss To Follow-Up (LTFU) workflow", () => {
  beforeAll(async () => {
    await installMediatorConfiguration;
    await configureCHT();
  });

  it.only("Should follow the LTFU workflow", async () => {
    const checkMediatorResponse = await request('http://localhost:5001')
      .get("/mediator/")
      .auth('interop-client', 'interop-password');

    expect(checkMediatorResponse.status).toBe(200);
    expect(checkMediatorResponse.body.status).toBe("success");

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
    const createPatientResponse = await request('http://localhost:5988')
      .post('/api/v1/people')
      .auth('admin', 'password')
      .send(patient);

    expect(createPatientResponse.status).toBe(200);
    expect(createPatientResponse.body.ok).toEqual(true);
    patientId = createPatientResponse.body.id;

    const retrieveFhirPatientIdResponse = await request('http://localhost:5001')
      .get('/fhir/Patient/?identifier=' + patientId)
      .auth('interop-client', 'interop-password');

    expect(retrieveFhirPatientIdResponse.status).toBe(200);

    const sendMediatorServiceRequestResponse = await request('http://localhost:5001')
      .post('/mediator/service-request')
      .auth('interop-client', 'interop-password')
      .send({
        "patient_id": patientId,
        "callback_url": "https://interop.free.beeceptor.com/callback"
      });

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

    const submitChtTaskResponse = await request('http://localhost:5988')
      .post('/medic/_bulk_docs')
      .auth(chwUserName, chwPassword)
      .send(taskForm);

    expect(submitChtTaskResponse.status).toBe(201);

    const retrieveFhirDbEncounter = await request('http://localhost:5001')
      .get('/fhir/' + encounterUrl)
      .auth('interop-client', 'interop-password');

    expect(retrieveFhirDbEncounter.status).toBe(200);
    expect(retrieveFhirDbEncounter.body.total).toBe(1);
  });
});

