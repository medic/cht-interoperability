export const VALID_GENDERS = ['male', 'female', 'other', 'unknown'];

export function generateFHIRPatientResource(patient: any) {
  const patientLastName = patient.name.split(' ').slice(-1);
  const birthDate = new Date(patient.date_of_birth);

  if (!isValidDate(birthDate)) {
    throw new RangeError("Invalid 'date_of_birth' range: received " + patient.date_of_birth);
  } else if (!patient._id) {
    throw new Error(`Invalid '_id' epxted type of 'string' or 'number' but recieved '${typeof patient._id}' with value '${patient._id}'`);
  } else if (!patient.name) {
    throw new Error(`Invalid 'name' expected type of 'string' but recieved '${patient.name}'`);
  } else if (!patient.sex || !VALID_GENDERS.includes(patient.sex)) {
    throw new Error(`Invalid 'sex' expected 'male', 'female', 'other', 'unknown' but recieved '${patient.sex}'`);
  }

  const FHITPatientResource = {
    resourceType: 'Patient',
    id: patient._id,
    identifier: [
      {
        system: 'cht',
        value: patient._id
      }
    ],
    name: [
      {
        use: 'official',
        family: patientLastName,
        given: [patient.name]
      }
    ],
    gender: patient.sex,
    birthDate: birthDate.toISOString()
  };

  return FHITPatientResource;
}

export function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d as any);
}

export function generateFHIRSubscriptionResource(patientId: string, callbackUrl: string) {
  if (!patientId) {
    throw new Error(`Invalid patient id was expecting type of 'string' or 'number' but received '${typeof patientId}'`)
  } else if (!callbackUrl) {
    throw new Error(`Invalid 'callbackUrl' was expecting type of 'string' but recieved '${typeof callbackUrl}'`)
  }
  
  const FHIRSubscriptionResource = {
    resourceType: 'Subscription',
    id: patientId,
    status: 'requested',
    reason: 'Follow up request for patient',
    criteria: `Encounter?identifier=${patientId}`,
    channel: {
      type: 'rest-hook',
      endpoint: callbackUrl,
      payload: 'application/fhir+json',
      header: ['Content-Type: application/fhir+json']
    }
  };

  return FHIRSubscriptionResource;
}
