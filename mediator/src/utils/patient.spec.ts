import { genereateFHIRPatientResource } from "./patient";

test("genereateFHIRPatientResource produces the correct format", () => {
  const chtPatient = {
    id: "123",
    _id: "456",
    name: "John Doe",
    sex: "male",
    date_of_birth: "200 0-01-01"
  };

  const FHIRPatient = genereateFHIRPatientResource(chtPatient);
  expect(FHIRPatient).toEqual({
    resourceType: "Patient",
    id: "123",
    identifier: [
      {
        system: 'cht',
        value: '456'
      }
    ],
    name: [
      {
        use: 'official',
        family: ['Doe'],
        given: ['John Doe']
      }
    ],
    gender: 'male',
    birthDate: '200 0-01-01'
  });
});
