import {  generateFHIRSubscriptionResource, } from "../fhir";

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
