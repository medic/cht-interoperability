import { randomUUID } from 'crypto';

interface OpenMRSIdentifier extends fhir4.Identifier {
  id: string //uuid
}

interface OpenMRSHumanName extends fhir4.HumanName {
  id: string //uuid
}

const phoneIdentifierType: fhir4.CodeableConcept = {
  text: 'Phone Number'
}

const chtIdentifierType: fhir4.CodeableConcept = {
  text: 'CHT ID'
}

export function buildOpenMRSPatient(chtPatient: Record<string, any>): fhir4.Patient {
  const nameParts = chtPatient.name.split(" ");
  const familyName = nameParts.pop() || "";
  const givenNames = nameParts;

  const name: OpenMRSHumanName = {
    family: familyName,
    given: givenNames,
    id: randomUUID(),
  };

  const phoneIdentifier: OpenMRSIdentifier = {
    id: randomUUID(),
    type: phoneIdentifierType,
    value: chtPatient.phone,
    use: 'usual'
  };

  const chtIdentifier: OpenMRSIdentifier = {
    id: randomUUID(),
    type: chtIdentifierType,
    value: chtPatient.id,
    system: 'cht',
    use: 'official'
  };

  const patient: fhir4.Patient = {
    resourceType: 'Patient',
    name: [name],
    birthDate: chtPatient.birthDate,
    id: chtPatient.id,
    identifier: [phoneIdentifier, chtIdentifier],
    gender: chtPatient.gender
  };

  return patient;
}
