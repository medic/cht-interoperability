import { randomUUID } from 'crypto';
import { Factory } from 'rosie';
import { visitNoteType, visitType } from '../../../mappers/openmrs';

// creates an openmrs patient with the special address extension
export const OpenMRSPatientFactory = Factory.define('openMRSFhirPatient')
  .attr('resourceType', 'Patient')
  .attr('id', () => randomUUID()) // Assign a random UUID for the patient
  .attr('address', ['addressKey', 'addressValue'], (addressKey, addressValue) => [
    {
      extension: [{
        extension: [
          {
            url: `http://fhir.openmrs.org/ext/address#${addressKey}`,
            valueString: addressValue
          }
        ]
      }]
    }
  ]);

// creates an openmrs encounter with visit type
export const OpenMRSVisitFactory = Factory.define('openMRSVisit')
  .attr('resourceType', 'Encounter')
  .attr('id', () => randomUUID()) // Assign a random UUID for the patient
  .attr('type', visitType);

// creates an openmrs encounter with visit note type
export const OpenMRSVisitNoteFactory = Factory.define('openMRSVisit')
  .attr('resourceType', 'Encounter')
  .attr('id', () => randomUUID()) // Assign a random UUID for the patient
  .attr('type', visitNoteType);
