import { generateFHIRPatientResource, generateFHIRSubscriptionResource, IPatient, isValidDate } from "../fhir";

describe("generateFHIRPatientResource", () => {
  const validChtPatient: IPatient = {
    _id: "456",
    name: "John Doe",
    sex: "male",
    date_of_birth: "2000-01-01",
  };

  it("creates a valid FHIR Patient resource when all the input are available", () => {
    const patient = generateFHIRPatientResource({ ...validChtPatient });

    expect(patient).toEqual({
      resourceType: "Patient",
      id: "456",
      identifier: [
        {
          system: "cht",
          value: "456",
        },
      ],
      name: [
        {
          use: "official",
          family: ["Doe"],
          given: ["John Doe"],
        },
      ],
      gender: "male",
      birthDate: "2000-01-01T00:00:00.000Z",
    });
  });

  it("throws an error if the 'date_of_birth' is 'undefined'", () => {
    const invalidChtPatient = { ...validChtPatient, date_of_birth: undefined } as any;

    expect(() =>
      generateFHIRPatientResource(invalidChtPatient)
    ).toThrowErrorMatchingSnapshot();
  });

  it("throws an error when 'date_of_birth' is an invalid date", () => {
    const invalidChtPatient = {
      ...validChtPatient,
      date_of_birth: "YYYY-MM-DD",
    };

    expect(() =>
      generateFHIRPatientResource(invalidChtPatient)
    ).toThrowErrorMatchingSnapshot();
  });

  it("throws an error when 'name' is an invalid name", () => {
    const invalidChtPatient: any = {
      ...validChtPatient,
      name: undefined,
    };

    expect(() =>
      generateFHIRPatientResource(invalidChtPatient)
    ).toThrowErrorMatchingSnapshot();
  });

  it("throws an error when '_id' is an invalid id", () => {
    const invalidChtPatient: any = {
      ...validChtPatient,
      _id: undefined,
    };

    expect(() =>
      generateFHIRPatientResource(invalidChtPatient)
    ).toThrowErrorMatchingSnapshot();
  });

  it("throws an error when 'sex' is an invalid sex", () => {
    const invalidChtPatient: any = {
      ...validChtPatient,
      sex: 'INVALID_GENDER',
    };

    expect(() =>
      generateFHIRPatientResource(invalidChtPatient)
    ).toThrowErrorMatchingSnapshot();
  });

  it("throws an error when 'sex' is undefined", () => {
    const invalidChtPatient: any = {
      ...validChtPatient,
      sex: undefined,
    };

    expect(() =>
      generateFHIRPatientResource(invalidChtPatient)
    ).toThrowErrorMatchingSnapshot();
  });
});

describe("generateFHIRSubscriptionResource", () => {
  const patientId = "PATIENT_ID"
  const callbackUrl = "CALLBACK_URL"

  it("generates a subscription resource when passed valid 'patientId' and 'callbackUrl'", () => {
    const resource = generateFHIRSubscriptionResource(patientId, callbackUrl);

    expect(resource).toEqual({
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
    })
  })

  it("fails to generate subscription when given an invalid 'patientId'", () => {
    expect(() => generateFHIRSubscriptionResource(undefined as any, callbackUrl))
      .toThrowErrorMatchingSnapshot()
  })

  it("fails to generate subscription when given an invalid 'callbackUrl'", () => {
    expect(() => generateFHIRSubscriptionResource(patientId, undefined as any))
      .toThrowErrorMatchingSnapshot()
  })
})

describe("isValidDate", () => {
  it("returns true for a valid date", () => {
    expect(isValidDate(new Date("01-01-2001"))).toBe(true);
  })

  it("return false for an invalid date", () => {
    expect(isValidDate(new Date(NaN))).toBe(false);
  })

  it("return false for a none date object", () => {
    expect(isValidDate({} as any)).toBe(false);
  })
})