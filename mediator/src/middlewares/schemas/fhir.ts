import { Fhir } from "fhir";

const fhir = new Fhir();

export function validateFhirResource(resourceType: string) {
  return function wrapper(data: any) {
    return fhir.validate({...data, resourceType})
  }
}
