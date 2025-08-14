export interface CHTClaimsFeedback {
    care_rendered: string;
    payment_asked: string;
    drug_prescribed: string;
    drug_received: string;
    assessment_rating: string;
    claimUUID: string;
    insureeUUID: string;
}


export function convertChtClaimToFhirCommunication(
    claim: CHTClaimsFeedback,
    id?: string
): fhir4.Communication {
    const feedbackMapping: { [key: string]: string } = {
        care_rendered: "CareRendered",
        payment_asked: "PaymentAsked",
        drug_prescribed: "DrugPrescribed",
        drug_received: "DrugReceived",
        assessment_rating: "Asessment"
    };

    const payload: fhir4.Communication["payload"] = Object.entries(feedbackMapping).map(
        ([field, code]) => ({
            extension: [
                {
                    url: "https://openimis.github.io/openimis_fhir_r4_ig/StructureDefinition/communication-payload-type",
                    valueCodeableConcept: {
                        coding: [
                            {
                                system: "https://openimis.github.io/openimis_fhir_r4_ig/CodeSystem/feedback-payload",
                                code
                            }
                        ]
                    }
                }
            ],
            contentString: claim[field as keyof CHTClaimsFeedback]
        })
    );

    const communication: fhir4.Communication = {
        resourceType: "Communication",
        id: id || `Claim${claim.claimUUID}Communication`,
        meta: {
            profile: [
                "https://openimis.github.io/openimis_fhir_r4_ig/StructureDefinition/openimis-communication"
            ]
        },
        status: "completed",
        subject: {
            reference: `Patient/${claim.insureeUUID}`
        },
        about: [
            {
                reference: `Claim/${claim.claimUUID}`
            }
        ],
        payload
    };

    return communication;
}
