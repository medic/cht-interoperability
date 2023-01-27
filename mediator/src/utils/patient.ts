function genereateFHIRPatientResource(patient: any) {
  const patientLastName = patient.name.split(' ').slice(-1);
  const birthDate = new Date(patient.date_of_birth);

  if (!isValidDate(birthDate)) {
    throw new RangeError("Invalid 'date_of_birth' range: received " + patient.date_of_birth);
  }

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
    birthDate: birthDate.toISOString()
  };

  return FHITPatientResource;
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

module.exports = {
  genereateFHIRPatientResource,
};
