function generateFHIRSubscriptionResource(patientId, callbackUrl) {
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

module.exports = {
  generateFHIRSubscriptionResource,
};
