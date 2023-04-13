# Workflow

## Steps
The following steps assume that you successfully logged in into OpenHIM and the CHT instances.

1. Create a Patient
   1. CHT - Login as `chw` user.
   1. CHT - Navigate to the `People` tab, select a `Facility` and create a `New Person`. For the purpose of this flow, the `Person`'s role should be `Patient`.
   1. CHT - Copy the newly created `Person`'s unique identifier from the browser's URL and keep it safely, you will needed it for the next steps.
   1. OpenHIM Admin Console - Verify that the Patient creation was successful in both OpenHIM Mediator & FHIR Resource. Navigate to the `Transaction Log` in the Admin Console. You should see two successful API calls, one to `/mediator/patient/` and one to `/fhir/Patient/`, as in the image below.
    ![](./images/instance-patient.png)
1. Request the LTFU for the Patient
   1. Postman - The LTFU is triggered by sending a `service-request` to the mediator for the newly created Patient. Create a `POST` request to `https://interoperability.dev.medicmobile.org:5001/mediator/service-request`. On the Postman's `Authorization` tab, select `Basic auth`. Input the mediator's credentials. The request body should contain:
       - The Patient unique identifier
       - A callback URL. For the purpose of the testing, you can use an online callback free provider.

        ```json
        { 
            "patient_id": "614c798a-cd61-48bd-8baf-9ce1a74c9ecc", 
            "callback_url": "https://interop.free.beeceptor.com/callback" 
        }
        ```
        Submit the request.
   1. OpenHIM Admin Console - Verify that the `service-request` was successful in both OpenHIM Mediator & FHIR Resource. Navigate to the `Transaction Log` in the Admin Console. You should see three successful API calls, as in the image below:
    ![](./images/instance-service-request.png)
1. Handle LTFU Task
   1. CHT - Navigate to the `Tasks` tab. There should be an automatically created `Task` for the Patient. If it is not the case, sync data via `Sync now` option. The `Task` should look like in the image below:
    
        <img src="./images/task.png" width="500">

   1. CHT - Select an option (Yes or No) and submit the `Tasks`.
   1. OpenHIM Admin Console - Verify that the Encounter creation was successful in both OpenHIM Mediator & FHIR Resource. Navigate to the `Transaction Log` in the Admin Console. You should see two successful API calls, one to `/mediator/encounter/` and one to `/fhir/Encounter/`, as in the image below.
    ![](./images/instance-encounter.png)
   1. If your callback URL test service was set up correctly, you should receive a notification from the mediator.


## Resources
The following [FHIR Resources](https://www.hl7.org/fhir/resource.html) are used to implement the flow above:
- [Patient](https://www.hl7.org/fhir/patient.html)
- [Encounter](https://build.fhir.org/encounter.html)
- [Subscription](https://build.fhir.org/subscription.html)
- [Organization](https://build.fhir.org/organization.html) - *Work in Progress*. This resource is used by the requesting system to send their callback URL information when they request for the LTFU for a patient.

### Service Request Resource

#### Endpoints

##### POST https://interoperability.dev.medicmobile.org:5001/mediator/service-request

### Patient Resource

### Encounter Resource

### Organisation Resource