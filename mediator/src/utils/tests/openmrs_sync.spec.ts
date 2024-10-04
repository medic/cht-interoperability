import { compare, syncPatients, syncEncounters } from '../openmrs_sync';
import * as fhir from '../fhir';
import * as openmrs from '../openmrs';
import * as cht from '../cht';

import { PatientFactory } from '../../middlewares/schemas/tests/fhir-resource-factories';

import axios from 'axios';
jest.mock('axios');

describe('OpenMRS Sync', () => {
  it('compares resources with the gvien key', async () => {
    const lastUpdated = new Date();
    lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);

    const constants = {
      resourceType: 'Patient',
      meta: { lastUpdated: lastUpdated }
    }

    jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
      data: [
        { id: 'outgoing', ...constants },
        { id: 'toupdate', ...constants }
      ],
      status: 200,
    });
    jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
      data: [
        { id: 'incoming', ...constants },
        { id: 'toupdate', ...constants }
      ],
      status: 200,
    });

    const getKey = (obj: any) => { return obj.id };
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1);
    const comparison = await compare(getKey, 'Patient', startTime)

    expect(comparison.incoming).toEqual([{id: 'incoming', ...constants }]);
    expect(comparison.outgoing).toEqual([{id: 'outgoing', ...constants }]);
    expect(comparison.toupdate).toEqual([{id: 'toupdate', ...constants }]);

    expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
    expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();
  });

  it('loads references for related resources', async () => {
    const lastUpdated = new Date();
    lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);
    const reference = {
       id: 'reference0',
       resourceType: 'Patient',
       meta: { lastUpdated: lastUpdated }
    };
    const resource = {
       id: 'resource0',
       resourceType: 'Encounter',
       meta: { lastUpdated: lastUpdated }
    };

    jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
      data: [ resource, reference ],
      status: 200,
    });
    jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
      data: [ resource ],
      status: 200,
    });

    const getKey = (obj: any) => { return obj.id };
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1);
    const comparison = await compare(getKey, 'Encounter', startTime)

    expect(comparison.references).toContainEqual(reference);
    expect(comparison.toupdate).toEqual([resource]);

    expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
    expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();
  });

  it('sends incoming Patients to FHIR and CHT', async () => {
    const lastUpdated = new Date();
    lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);

    const openMRSPatient = PatientFactory.build();
    openMRSPatient.meta = { lastUpdated: lastUpdated };
    jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
      data: [],
      status: 200,
    });
    jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
      data: [openMRSPatient],
      status: 200,
    });
    jest.spyOn(fhir, 'updateFhirResource').mockResolvedValueOnce({
      data: openMRSPatient,
      status: 200
    });
    jest.spyOn(cht, 'createChtPatient')

    const getKey = (obj: any) => { return obj.id };
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1);
    const comparison = await syncPatients(startTime);

    expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
    expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();

    expect(fhir.updateFhirResource).toHaveBeenCalledWith(openMRSPatient);
    expect(cht.createChtPatient).toHaveBeenCalledWith(openMRSPatient);
  });

  it('sends outgoing Patients to OpenMRS', async () => {
    const lastUpdated = new Date();
    lastUpdated.setMinutes(lastUpdated.getMinutes() - 30);

    const fhirPatient = PatientFactory.build();
    fhirPatient.meta = { lastUpdated: lastUpdated };

    jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
      data: [fhirPatient],
      status: 200,
    });
    jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
      data: [],
      status: 200,
    });
    jest.spyOn(openmrs, 'createOpenMRSResource').mockResolvedValueOnce({
      data: fhirPatient,
      status: 200
    });
    //jest.spyOn(fhir, 'updateFhirResource')

    const getKey = (obj: any) => { return obj.id };
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1);
    const comparison = await syncPatients(startTime);

    expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
    expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();

    expect(openmrs.createOpenMRSResource).toHaveBeenCalledWith(fhirPatient);
    // updating with openmrs id
    //expect(fhir.updateFhirResource).toHaveBeenCalledWith(fhirPatient);
  });
});
