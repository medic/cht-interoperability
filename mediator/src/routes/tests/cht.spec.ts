import request from 'supertest';
import app from '../../..';
import { ChtPatientFactory, ChtPatientIdsFactory, ChtPregnancyForm } from '../../middlewares/schemas/tests/cht-request-factories';

describe('POST /cht/patient', () => {
  it('doesn\'t accept incoming request with invalid patient resource', async () => {
    const data = ChtPatientFactory.build();
    delete data.doc._id;

    const res = await request(app).post('/cht/patient').send(data);

    expect(res.status).toBe(400);
    expect(res.body.valid).toBe(false);
    expect(res.body.message).toMatchInlineSnapshot(
      `""doc._id" is required"`
    );
  });
});

describe('POST /cht/patient_ids', () => {
  it('doesn\'t accept incoming request with invalid patient resource', async () => {
    const data = ChtPatientIdsFactory.build();
    delete data.doc.patient_id;

    const res = await request(app).post('/cht/patient_ids').send(data);

    expect(res.status).toBe(400);
    expect(res.body.valid).toBe(false);
    expect(res.body.message).toMatchInlineSnapshot(
      `""doc.patient_id" is required"`
    );
  });
});

describe('POST /cht/encounter', () => {
  it('doesn\'t accept incoming request with invalid form', async () => {
    const data = ChtPregnancyForm.build();

    // push an invalid observation
    data.observations.push({
      "code": "17a57368-5f59-42c8-aaab-f2774d21501e",
      "valueDateTime": "This is not a valid date"
    })

    const res = await request(app).post('/cht/encounter').send(data);

    expect(res.status).toBe(400);
    expect(res.body.valid).toBe(false);
    expect(res.body.message).toMatchInlineSnapshot(
      `""observations[13].valueDateTime" must be in iso format"`
    );
  });
});
