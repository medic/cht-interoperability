import { compare, syncPatients, syncEncountersAndObservations  } from '../openmrs_sync';
import * as fhir from '../fhir';
import * as openmrs from '../openmrs';
import * as cht from '../cht';

import { PatientFactory } from '../../middlewares/schemas/tests/fhir-resource-factories';

import axios from 'axios';
jest.mock('axios');

describe('OpenMRS Sync', () => {
  it('compares resources with the gvien key', async () => {
    jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
      data: { entry: [
        { resource: {id: 'outgoing'}},
        { resource: {id: 'toupdate'}}
      ] },
      status: 200,
    });
    jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
      data: { entry: [
        { resource: {id: 'incoming'}},
        { resource: {id: 'toupdate'}}
      ] },
      status: 200,
    });

    const getKey = (obj: any) => { return obj.id };
    const comparison = await compare(getKey, 'Patient')

    expect(comparison.incoming).toEqual([{id: 'incoming'}]);
    expect(comparison.outgoing).toEqual([{id: 'outgoing'}]);
    expect(comparison.toupdate).toEqual([{id: 'toupdate'}]);

    expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
    expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();
  });

  it('sends incoming Patients to FHIR and CHT', async () => {
    const openMRSPatient = PatientFactory.build();
    jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
      data: { entry: [] },
      status: 200,
    });
    jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
      data: { entry: [ { resource: openMRSPatient } ] },
      status: 200,
    });
    jest.spyOn(fhir, 'updateFhirResource').mockResolvedValueOnce({
      data: openMRSPatient,
      status: 200
    });
    jest.spyOn(cht, 'createChtPatient')

    const getKey = (obj: any) => { return obj.id };
    const comparison = await syncPatients();

    expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
    expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();

    expect(fhir.updateFhirResource).toHaveBeenCalledWith(openMRSPatient);
    expect(cht.createChtPatient).toHaveBeenCalledWith(openMRSPatient);
  });

  it('sends outgoing Patients to OpenMRS', async () => {
    const fhirPatient = PatientFactory.build();
    jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
      data: { entry: [ { resource: fhirPatient } ] },
      status: 200,
    });
    jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
      data: { entry: [] },
      status: 200,
    });
    jest.spyOn(openmrs, 'createOpenMRSResource').mockResolvedValueOnce({
      data: fhirPatient,
      status: 200
    });
    //jest.spyOn(fhir, 'updateFhirResource')

    const getKey = (obj: any) => { return obj.id };
    const comparison = await syncPatients();

    expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
    expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();

    expect(openmrs.createOpenMRSResource).toHaveBeenCalledWith(fhirPatient);
    // updating with openmrs id
    //expect(fhir.updateFhirResource).toHaveBeenCalledWith(fhirPatient);
  });
});
