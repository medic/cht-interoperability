# Infrastructure for Community of Practice (CoP) Interoperability Project

## Overview
This project implements a Loss to Follow Up (LTFU) workflow system for CHIS based on [OpenHIE LTFU Guide](https://wiki.ohie.org/display/SUB/Use+Case+Summary:+Request+Community+Based+Follow-Up).

A first version of the project can be found in the [chis-interoperability](https://github.com/medic/chis-interoperability) repository.

### Services
Services are currently available at these URLs:

* **OpenHIM Admin Console** - [https://interoperability.dev.medicmobile.org](https://interoperability.dev.medicmobile.org). Credentials: `interop@openhim.org`/`interop-password`.
* **OpenHIM Mediator** - TODO 
* **HAPI FHIR** - TODO
* **CHT with LTFU configuration** - TODO

[GitHub repository for the kubernetes configuration](https://github.com/medic/interoperability-kubernetes/).

### Workflow Diagram
![](./docs/sequence-diagram/diagram.png) 

## Get Started

### Prerequisites
- `docker`

### Troubleshooting
Users getting errors when running the following installation steps, please see the [Troubleshooting guide](/troubleshooting.md).

### Install & First Time Run

1. Run `./startup.sh init` to start-up the docker containers on the first run or after calling `./startup.sh destroy`. Use `./startup.sh up` for subsequent runs after calling `init` without calling `destroy`.

### OpenHIM Admin Console

1. Visit the OpenHIM Admin Console at http://localhost:9000 and login with the following credentials: email - `interop@openhim.org` and password - `interop-password`. The default User username for OpenHIM is `interop@openhim.org` and password is `interop-password`. The default Client username is `interop-client` and password is `interop-password`.

1. Once logged in, visit http://localhost:9000/#!/mediators and select the only mediator with the `Name` 'Loss to Follow Up Mediator'.

1. Select the green `+` button to the right of the default channel to add the mediator.

1. You can test the mediator by running: 

```
curl -X GET http://localhost:5001/mediator -H "Authorization: Basic $(echo -n interop-client:interop-password | base64)"
``` 

You should get as a response:
```json
{"status": "success" }
``` 

If everything is successful you should see this:
 ![](./docs/images/good-client-screen.png)

### CHT configuration with Docker
The following steps apply when running CHT via the Docker setup provided in this repository:

1. CHT can be accessed via `http://localhost:5988`, and the credentials are `admin`/`password`.
2. Create a new user in the CHT instance with the username `interop-client` using these [instructions](https://docs.communityhealthtoolkit.org/apps/tutorials/contact-and-users-1/#4-create-the-chw-user). For the role you can select `Data entry` and `Analytics` roles. Please note that you can use any username you prefer but you would have to update the config with the new username. You can do that by editing the `cht-config/app_settings.json` file and updating the `username` value in the `outbound` object e.g. on this [line](https://github.com/medic/interoperability/blob/main/cht-config/app_settings.json#L452).
3. Securely save the `interop-client` user's password to the database using the instructions [here](https://docs.communityhealthtoolkit.org/apps/reference/api/#credentials). Change the values `mykey` and `my pass` to `openhim1` and your user's password respectively. An example of the curls request is below:
```
curl -X PUT -H "Content-Type: text/plain" http://admin:password@localhost:5988/api/v1/credentials/openhim1 -d 'interop-password'
```

### Local setup of CHT Configuration
The following steps apply when running CHT locally in development mode and when making configuration changes locally:

#### CHT Development Environment
1. Set up a local CHT instance using [these instructions](https://docs.communityhealthtoolkit.org/apps/tutorials/local-setup/).
2. Create a new user in the CHT instance with the username `interop-client` using these [instructions](https://docs.communityhealthtoolkit.org/apps/tutorials/contact-and-users-1/#4-create-the-chw-user). For the role you can select `Data entry` and `Analytics` roles. Please note that you can use any username you prefer but you would have to update the config with the new username. You can do that by editing the `cht-config/app_settings.json` file and updating the `username` value in the `outbound` object e.g. on this [line](https://github.com/medic/interoperability/blob/main/cht-config/app_settings.json#L452).
3. Securely save the `interop-client` user's password to the database using the instructions [here](https://docs.communityhealthtoolkit.org/apps/reference/api/#credentials). Change the values `mykey` and `my pass` to `openhim1` and your user's password respectively. An example of the curls request is below:
```
curl -X PUT -H "Content-Type: text/plain" http://admin:password@localhost:5988/api/v1/credentials/openhim1 -d 'interop-password'
```

#### CHT Configuration
1. Go into the `cht-config` directory by running `cd cht-config`.
1. Run `npm install` to install the dependencies.
2. Create a file named `.env` under `/mediator` folder, copy over the contents of `/mediator/.env.template` and update the `CHT_USERNAME` and `CHT_PASSWORD` values with the admin credentials of your CHT instance.
3. Set up a proxy to your local CHT instance by running using something like [nginx-local-ip](https://github.com/medic/nginx-local-ip) or [ngrok](https://ngrok.com/) and update the `CHT_URL` value in the `.env` file with the new URL.
4. Ensure you have [cht-conf](https://www.npmjs.com/package/cht-conf) installed and run `cht --local` to compile and upload the app settings configuration to your local CHT instance.
5. To verify if the configuration is loaded correctly is to create a `Patient` and to access a URL like https://*****.my.local-ip.co/#/contacts/patientUUID/report/interop_follow_up. This should retrieve correctly the follow up form.
6. To verify if the configuration in CouchDB, access `http://localhost:5984/_utils/#database/medic/settings`.
 
### Test the Loss to Follow-Up (LTFU) Flow
TODO

#### Postman collection
TODO

### Shutdown the servers
- To shut-down the containers run `./startup.sh down` to stop the instances.
- To then restart the containers, run `./startup.sh up`. You do not need to run `init` again like you did in the initial install above.
- To shut-down and delete *everything*, run `./startup.sh destroy`. You will have to subsequently run `./startup.sh init` if you wish to start the containers.
