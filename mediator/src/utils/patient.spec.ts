import { generateFHIRPatientResource } from "./patient";

test("generateFHIRPatientResource produces the correct format", () => {
  const chtPatient = {
    id: "123",
    _id: "456",
    name: "John Doe",
    sex: "male",
    date_of_birth: "2000-01-01"
  };

  const FHIRPatient = generateFHIRPatientResource(chtPatient);
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
    birthDate: '2000-01-01T00:00:00.000Z'
  });
});
