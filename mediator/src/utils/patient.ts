function genereateFHIRPatientResource(patient: any) {
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

module.exports = {
  genereateFHIRPatientResource,
};
