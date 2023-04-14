# Infrastructure for Community of Practice (CoP) Interoperability Project

## Overview
This project implements a Loss to Follow Up (LTFU) workflow system for CHIS based on [OpenHIE LTFU Guide](https://wiki.ohie.org/display/SUB/Use+Case+Summary:+Request+Community+Based+Follow-Up).

A first version of the project can be found in the [chis-interoperability](https://github.com/medic/chis-interoperability) repository.

### Interoperability 
Interoperability is the ability of health information systems to work together, even if they weren’t specifically designed to work together. With interoperability, patient information can be seen, exchanged, and used across different platforms. This is different from *integration* which requires custom development to connect two specific systems together.

Interoperability is the best practice for health systems because it allows information from one system to be shared with one or more other systems with no additional development.

#### Components
The components and reference information for interoperability used in this project are:

* [OpenHIE](https://ohie.org/) defines the architecture for an interoperability layer.
* [OpenHIM](http://openhim.org/) is a middleware component designed to ease interoperability between systems.
* [HL7 FHIR](https://www.hl7.org/fhir/index.html) is a messaging format to allow all systems to understand the format of the message.

#### CHT
The structure of documents in the CHT database reflect the configuration of the system, and therefore do not map directly to a FHIR message format. To achieve interoperability we used a middleware to convert the CHT data structure into a standardized form so the other systems can read it.

 ![](./docs/images/flow.png)

This project uses OpenHIM as the middleware component with [Mediators](http://openhim.org/docs/configuration/mediators/) to do the conversion. [Outbound Push](https://docs.communityhealthtoolkit.org/apps/reference/app-settings/outbound/) is configured to make a request to the middleware when relevant documents are created or modified in the CHT. A Mediator then creates a FHIR resource which is then routed to OpenHIM. OpenHIM routes the resource to any other configured systems.

Conversely to bring data into the CHT, OpenHIM is configured to route the updated resource to the Mediator, which then calls the relevant [CHT APIs](https://docs.communityhealthtoolkit.org/apps/reference/api/) to update the document in the CHT database. This will then be replicated to users’ devices as per usual.

### Services
Services are currently available at these URLs:

* **OpenHIM Admin Console** - [https://interoperability.dev.medicmobile.org](https://interoperability.dev.medicmobile.org).
* **OpenHIM Mediator** - [https://interoperability.dev.medicmobile.org:5001/mediator](https://interoperability.dev.medicmobile.org:5001/mediator). 
* **CHT with LTFU configuration** - [https://interop-cht-test.dev.medicmobile.org/](https://interop-cht-test.dev.medicmobile.org/). 

Credentials to the instances can be shared upon request.

[GitHub repository for the kubernetes configuration](https://github.com/medic/interoperability-kubernetes/).

### Workflow Sequence Diagram
![](./docs/sequence-diagram/diagram.png) 

### FHIR Resources
The following [FHIR Resources](https://www.hl7.org/fhir/resource.html) are used to implement the flow above:
- [Patient](https://www.hl7.org/fhir/patient.html)
- [Encounter](https://build.fhir.org/encounter.html)
- [Subscription](https://build.fhir.org/subscription.html)
- [Organization](https://build.fhir.org/organization.html) - *Work in Progress*. This resource is used by the requesting system to send their callback URL information when they request for the LTFU for a patient.

### Test LTFU via instances
The following steps assume that you successfully logged in into OpenHIM and the CHT instances.

1. Create a Patient
   1. CHT - Login as `chw` user.
   1. CHT - Navigate to the `People` tab, select a `Facility` and create a `New Person`. For the purpose of this flow, the `Person`'s role should be `Patient`.
   1. CHT - Copy the newly created `Person`'s unique identifier from the browser's URL and keep it safely, you will needed it for the next steps.
   1. OpenHIM Admin Console - Verify that the Patient creation was successful in both OpenHIM Mediator & FHIR Resource. Navigate to the `Transaction Log` in the Admin Console. You should see two successful API calls, one to `/mediator/patient/` and one to `/fhir/Patient/`, as in the image below.
    ![](./docs/images/instance-patient.png)
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
    ![](./docs/images/instance-service-request.png)
1. Handle LTFU Task
   1. CHT - Navigate to the `Tasks` tab. There should be an automatically created `Task` for the Patient. If it is not the case, sync data via `Sync now` option. The `Task` should look like in the image below:
    
        <img src="./docs/images/task.png" width="500">

   1. CHT - Select an option (Yes or No) and submit the `Tasks`.
   1. OpenHIM Admin Console - Verify that the Encounter creation was successful in both OpenHIM Mediator & FHIR Resource. Navigate to the `Transaction Log` in the Admin Console. You should see two successful API calls, one to `/mediator/encounter/` and one to `/fhir/Encounter/`, as in the image below.
    ![](./docs/images/instance-encounter.png)
   1. If your callback URL test service was set up correctly, you should receive a notification from the mediator.

## Get Started with Local Setup

### Prerequisites
- `docker`
- `Postman` or similar tool for API testing. This will play the role of the `Requesting System` from the sequence diagram above. 

### Troubleshooting
Users getting errors when running the following installation steps, please see the [Troubleshooting guide](/troubleshooting.md).

### Install & First Time Run

1. Run `./startup.sh init` to start-up the docker containers on the first run or after calling `./startup.sh destroy`. Use `./startup.sh up` for subsequent runs after calling `init` without calling `destroy`.

### OpenHIM Admin Console

1. Visit the OpenHIM Admin Console at http://localhost:9000 and login with the following credentials: email - `interop@openhim.org` and password - `interop-password`. The default User username for OpenHIM is `interop@openhim.org` and password is `interop-password`. The default Client username is `interop-client` and password is `interop-password`.

1. Once logged in, visit [http://localhost:9000/#!/mediators](http://localhost:9000/#!/mediators) and select the only mediator with the `Name` 'Loss to Follow Up Mediator'.

1. Select the green `+` button to the right of the default channel to add the mediator.

1. You can test the mediator by running: 

```bash
curl -X GET http://localhost:5001/mediator -H "Authorization: Basic $(echo -n interop-client:interop-password | base64)"
``` 

You should get as a response:
```json
{"status": "success" }
``` 

If everything is successful you should see this:

<img src="./docs/images/good-client-screen.png" width="600">

### CHT configuration with Docker
The following steps apply when running CHT via the Docker setup provided in this repository:

1. CHT can be accessed via `http://localhost:5988`, and the credentials are `admin`/`password`.
2. Create a new user in the CHT instance with the username `interop-client` using these [instructions](https://docs.communityhealthtoolkit.org/apps/tutorials/contact-and-users-1/#4-create-the-chw-user). For the role you can select `Data entry` and `Analytics` roles. Please note that you can use any username you prefer but you would have to update the config with the new username. You can do that by editing the `cht-config/app_settings.json` file and updating the `username` value in the `outbound` object e.g. on this [line](https://github.com/medic/interoperability/blob/main/cht-config/app_settings.json#L452).
3. Securely save the `interop-client` user's password to the database using the instructions [here](https://docs.communityhealthtoolkit.org/apps/reference/api/#credentials). Change the values `mykey` and `my pass` to `openhim1` and your user's password respectively. An example of the curls request is below:
```bash
curl -X PUT -H "Content-Type: text/plain" http://admin:password@localhost:5988/api/v1/credentials/openhim1 -d 'interop-password'
```

### Local setup of CHT Configuration
The following steps apply when running CHT locally in development mode and when making configuration changes locally:

#### CHT Development Environment
1. Set up a local CHT instance using [these instructions](https://docs.communityhealthtoolkit.org/apps/tutorials/local-setup/).
2. Create a new user in the CHT instance with the username `interop-client` using these [instructions](https://docs.communityhealthtoolkit.org/apps/tutorials/contact-and-users-1/#4-create-the-chw-user). For the role you can select `Data entry` and `Analytics` roles. Please note that you can use any username you prefer but you would have to update the config with the new username. You can do that by editing the `cht-config/app_settings.json` file and updating the `username` value in the `outbound` object e.g. on this [line](https://github.com/medic/interoperability/blob/main/cht-config/app_settings.json#L452).
3. Securely save the `interop-client` user's password to the database using the instructions [here](https://docs.communityhealthtoolkit.org/apps/reference/api/#credentials). Change the values `mykey` and `my pass` to `openhim1` and your user's password respectively. An example of the curls request is below:
``` bash
curl -X PUT -H "Content-Type: text/plain" http://admin:password@localhost:5988/api/v1/credentials/openhim1 -d 'interop-password'
```

#### CHT Configuration
1. Go into the `cht-config` directory by running `cd cht-config`.
1. Run `npm install` to install the dependencies.
2. Create a file named `.env` under `/mediator` folder, copy over the contents of `/mediator/.env.template` and update the `CHT_USERNAME` and `CHT_PASSWORD` values with the admin credentials of your CHT instance.
3. Set up a proxy to your local CHT instance by running using something like [nginx-local-ip](https://github.com/medic/nginx-local-ip) or [ngrok](https://ngrok.com/) and update the `CHT_URL` value in the `.env` file with the new URL.
4. Ensure you have [cht-conf](https://www.npmjs.com/package/cht-conf) installed and run `cht --local` to compile and upload the app settings configuration to your local CHT instance.
5. To verify if the configuration is loaded correctly is to create a `Patient` and to access a URL like `https://*****.my.local-ip.co/#/contacts/patientUUID/report/interop_follow_up`. This should retrieve correctly the follow up form.
6. To verify if the configuration in CouchDB, access `http://localhost:5984/_utils/#database/medic/settings`.
 
### Test the LTFU with the Local Setup
The following steps assume that you were successful in running locally OpenHIM and the CHT with the LTFU configuration.

1. Create a Patient
   1. CHT - Create an offline user, for example a Community Health Worker (CHW), via the `App Management`. 
   1. CHT - Login as this newly created offline user.
   1. CHT - Navigate to the `People` tab, select a `Facility` and create a `New Person`. For the purpose of this flow, the `Person`'s role should be `Patient`.
   1. CHT - Copy the newly created `Person`'s unique identifier from the browser's URL and keep it safely, you will needed it for the next steps.
   1. OpenHIM Admin Console - Verify that the Patient creation was successful in both OpenHIM Mediator & FHIR Resource. Navigate to the `Transaction Log` in the Admin Console. You should see two successful API calls, one to `/mediator/patient/` and one to `/fhir/Patient/`, as in the image below.
    ![](./docs/images/transaction-log-patient.png)
1. Request the LTFU for the Patient
   1. Postman - The LTFU is triggered by sending a `service-request` to the mediator for the newly created Patient. Create a `POST` request to `http://localhost:5001/mediator/service-request`. On the Postman's `Authorization` tab, select `Basic auth`. Input the following credentials: `interop-client` / `interop-password`. The request body should contain:
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
    ![](./docs/images/transaction-log-service-request.png)
1. Handle LTFU Task
   1. CHT - Navigate to the `Tasks` tab. There should be an automatically created `Task` for the Patient. If it is not the case, sync data via `Sync now` option. The `Task` should look like in the image below:
    
      <img src="./docs/images/task.png" width="500">

   1. CHT - Select an option (Yes or No) and submit the `Tasks`.
   1. OpenHIM Admin Console - Verify that the Encounter creation was successful in both OpenHIM Mediator & FHIR Resource. Navigate to the `Transaction Log` in the Admin Console. You should see two successful API calls, one to `/mediator/encounter/` and one to `/fhir/Encounter/`, as in the image below.
    ![](./docs/images/transaction-log-encounter.png)
   1. If your callback URL test service was set up correctly, you should receive a notification from the mediator.

### Shutdown the servers
- To shut-down the containers run `./startup.sh down` to stop the instances.
- To then restart the containers, run `./startup.sh up`. You do not need to run `init` again like you did in the initial install above.
- To shut-down and delete *everything*, run `./startup.sh destroy`. You will have to subsequently run `./startup.sh init` if you wish to start the containers.
