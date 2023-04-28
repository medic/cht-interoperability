import request from 'supertest';
const openhimMediatorUtils = require('openhim-mediator-utils');
let placeId: string;
let chwUserName: string;
let chwPassword: string;
let contactId: string;
let patientId: string;
let encounterUrl: String;

describe("LTFU flow - Mediator Configuration", () => {
  it("should install mediator channels", (done) => {
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

          expect(res.status).toBe(201);
          done();
        } catch (error) {
          return done(error);
        }
      }
    );
  });

  it("mediator status should be ok", async () => {
    await request('http://localhost:5001')
      .get("/mediator/")
      .auth('interop-client', 'interop-password')
      .expect({ "status": "success" })
      .expect(200);
  });
});

describe("LTFU flow - CHT Configuration", () => {
  it('should create a place in the CHT', async () => {
    const res = await request('http://localhost:5988')
      .post('/api/v1/places')
      .auth('admin', 'password')
      .send({ "name": "CHP Branch Two", "type": "district_hospital" });

    expect(res.status).toBe(200);
    expect(res.body.ok).toEqual(true);

    placeId = res.body.id;
  });

  it('should create a user in the CHT', async () => {
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
    const res = await request('http://localhost:5988')
      .post('/api/v2/users')
      .auth('admin', 'password')
      .send(user);

    contactId = res.body.contact.id;
    expect(res.status).toBe(200);
  });

  it('should create a patient in the CHT', async () => {
    const patient = {
      name: "John Test",
      phone: "+2548277217095",
      date_of_birth: "1980-06-06",
      sex: "male",
      type: "person",
      role: "patient",
      contact_type: "patient",
      place: placeId
    }

    const res = await request('http://localhost:5988')
      .post('/api/v1/people')
      .auth('admin', 'password')
      .send(patient);

    patientId = res.body.id;
    expect(res.status).toBe(200);
    expect(res.body.ok).toEqual(true);
  });
});

describe("LTFU flow", () => {
  it('should retrieve FHIR Patient ID', async () => {
    const res = await request('http://localhost:5001')
      .get('/fhir/Patient/?identifier=' + patientId)
      .auth('interop-client', 'interop-password');
    expect(res.status).toBe(200);
  });

  it('should send a service request to the Mediator', async () => {
    const res = await request('http://localhost:5001')
      .post('/mediator/service-request')
      .auth('interop-client', 'interop-password')
      .send({
        "patient_id": patientId,
        "callback_url": "https://interop.free.beeceptor.com/callback"
      });
    console.log(res.body)
    encounterUrl = res.body.criteria;
    expect(res.status).toBe(201);
  });

  it('should submit a task form to CHT', async () => {
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

    const res = await request('http://localhost:5988')
      .post('/medic/_bulk_docs')
      .auth(chwUserName, chwPassword)
      .send(taskForm);

    expect(res.status).toBe(201);
  });

  it('should retrieve the encounter from FHIR DB', async () => {
    const res = await request('http://localhost:5001')
      .get('/fhir/' + encounterUrl)
      .auth('interop-client', 'interop-password');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });
});
