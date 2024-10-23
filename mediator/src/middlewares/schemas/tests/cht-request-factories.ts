import { randomUUID } from 'crypto';
import { Factory } from 'rosie';

export const ChtPatientFactory = Factory.define('chtPatient')
  .attr('doc', () => ChtPatientDoc.build())

export const ChtPatientDoc = Factory.define('chtPatientDoc')
  .attr('_id', randomUUID())
  .attr('name', 'John Doe')
  .attr('phone', '+9770000000')
  .attr('date_of_birth', '2000-01-01')
  .attr('sex', 'female')
  .attr('patient_id', randomUUID());

export const ChtSMSPatientFactory = Factory.define('chtPatient')
  .attr('doc', () => ChtSMSPatientDoc.build())

export const ChtSMSPatientDoc = Factory.define('chtPatientDoc')
  .attr('_id', randomUUID())
  .attr('name', 'John Doe')
  .attr('phone', '+9770000000')
  .attr('date_of_birth', '2000-01-01')
  .attr('sex', 'female')
  .attr('source_id', randomUUID());

export const ChtPatientIdsFactory = Factory.define('chtPatientIds')
  .attr('doc', () => ChtPatientIdsDoc.build())

export const ChtPatientIdsDoc = Factory.define('chtPatientIds')
  .attr('external_id', randomUUID())
  .attr('patient_uuid', randomUUID());

export const ChtPregnancyForm = Factory.define('chtPregnancyDoc')
  .attr('patient_uuid', randomUUID())
  .attr('reported_date', Date.now())
  .attr('observations', [
    {
      "code": "17a57368-5f59-42c8-aaab-f2774d21501e",
      "valueCode": "43221561-0600-410e-8932-945665533510"
    },
    {
      "code": "17a57368-5f59-42c8-aaab-f2774d21501e",
      "valueCode": "070dca86-c275-4369-b405-868904d78156"
    },
    {
      "code": "17a57368-5f59-42c8-aaab-f2774d21501e",
      "valueCode": "117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    {
      "code": "17a57368-5f59-42c8-aaab-f2774d21501e",
      "valueCode": "ea6a020e-05cd-4fea-b618-abd7494ac571"
    },
    {
      "code": "17a57368-5f59-42c8-aaab-f2774d21501e",
      "valueCode": false
    },
    {
      "code": "17a57368-5f59-42c8-aaab-f2774d21501e",
      "valueCode": "0d9e45d6-9288-494e-841c-80f3f9b8e126"
    },
    {
      "code": "17a57368-5f59-42c8-aaab-f2774d21501e",
      "valueCode": "73f56d98-207e-4e91-9a41-bc744e933cbd"
    },
    {
      "code": "17a57368-5f59-42c8-aaab-f2774d21501e",
      "valueCode": "121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    {
      "code": "1427AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "valueDateTime": "2023-11-20"
    },
    {
      "code": "5596AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "valueDateTime": "2024-08-26"
    },
    {
      "code": "13179cce-a424-43d7-9ad1-dce7861946e8",
      "valueString": ""
    }
  ]);
