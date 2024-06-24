import { compare, syncPatients, syncEncounters } from '../openmrs_sync';
import * as fhir from '../fhir';
import * as openmrs from '../openmrs';
import * as cht from '../cht';

import { PatientFactory } from '../../middlewares/schemas/tests/fhir-resource-factories';

import axios from 'axios';
jest.mock('axios');

describe('OpenMRS Sync', () => {
  it('compares resources with the gvien key', async () => {
    jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
      data: [
        { id: 'outgoing', resourceType: 'Patient'},
        { id: 'toupdate', resourceType: 'Patient'}
      ],
      status: 200,
    });
    jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
      data: [
        { id: 'incoming', resourceType: 'Patient'},
        { id: 'toupdate', resourceType: 'Patient'}
      ],
      status: 200,
    });

    const getKey = (obj: any) => { return obj.id };
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1);
    const comparison = await compare(getKey, 'Patient', startTime)

    expect(comparison.incoming).toEqual([{id: 'incoming', resourceType: 'Patient'}]);
    expect(comparison.outgoing).toEqual([{id: 'outgoing', resourceType: 'Patient'}]);
    expect(comparison.toupdate).toEqual([{id: 'toupdate', resourceType: 'Patient'}]);

    expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
    expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();
  });

  it('loads references for related resources', async () => {
    jest.spyOn(fhir, 'getFhirResourcesSince').mockResolvedValueOnce({
      data: [
        { id: 'resource0', resourceType: 'Encounter'},
        { id: 'reference0', resourceType: 'Patient'}
      ],
      status: 200,
    });
    jest.spyOn(openmrs, 'getOpenMRSResourcesSince').mockResolvedValueOnce({
      data: [ {id: 'resource0', resourceType: 'Encounter'} ],
      status: 200,
    });

    const getKey = (obj: any) => { return obj.id };
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1);
    const comparison = await compare(getKey, 'Encounter', startTime)

    expect(comparison.references).toContainEqual({id: 'reference0', resourceType: 'Patient'});
    expect(comparison.toupdate).toEqual([{id: 'resource0', resourceType: 'Encounter'}]);

    expect(fhir.getFhirResourcesSince).toHaveBeenCalled();
    expect(openmrs.getOpenMRSResourcesSince).toHaveBeenCalled();
  });

  it('sends incoming Patients to FHIR and CHT', async () => {
    const openMRSPatient = PatientFactory.build();
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
    const fhirPatient = PatientFactory.build();
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
