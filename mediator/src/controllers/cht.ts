import {
    convertChtClaimToFhirCommunication
} from '../mappers/openIMIS-interop/claims_communication_mapper';




export async function createEncounter(chtClaimReport: any) {
    let fhirClaim = convertChtClaimToFhirCommunication(chtClaimReport);
    console.log(`FHIR Claim: ${JSON.stringify(fhirClaim, null, 2)}`);
}