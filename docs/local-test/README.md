## Local testing of LTFU flow with [Postman](https://www.postman.com/) or similar tools
This folder contains a collection of API calls to end-to-end test the CHT - Mediator - FHIR API calls that simulate an LTFU flow on local instances.

The following steps assume that you were successful in running locally OpenHIM and the CHT with the LTFU configuration.

1. Import the `dev.json` environment file under Postman > Environments. It contains the OpenHIM and CHT admin credentials of your local instances.
1. Import the `Interoperability PoC LTFU Flow.postman_collection.json` collection under Postman > Collections.
1. Run the collection! You can check the Patient & Encounter creation in both CHT and OpenHIM Admin Console. 
