import { Fhir, Validator } from "fhir";

const fhir = new Fhir();

console.log(fhir.validate({"resourceType" : "Patient", "identifier": "Donald"}));