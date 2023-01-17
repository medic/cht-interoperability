const axios = require('axios');
const FHIR_ROOT_URL = 'http://openhim-core:5001/fhir';

function genereateFHITPatientResource(patient) {
  const patientLastName = patient.name.split(' ').slice(-1);
  const FHITPatientResource = {
    resourceType: 'Patient',
    id: patient.id,
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
    birthDate: patient.date_of_birth
  };

  return FHITPatientResource;
}

async function createPatient(req) {
  const FHITPatientResource = genereateFHITPatientResource(req.body);

  try {
    const res = await axios.post(`${FHIR_ROOT_URL}/Patient`, FHITPatientResource, { auth: {
      username: 'interop-client',
      password: 'interop-password'
    }});
    return {status: res.status, patient: res.data}
  } catch (error) {
    console.error(error);
    return {status: error.status, patient: error.data}
  }
}

module.exports = {
  createPatient
};
