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
   1. OpenHIM Admin Console - Verify that the Encounter creation was successful in both OpenHIM Mediator & FHIR Resource. Navigate to the `Transaction Log` in the Admin Console. `You should see two successful API calls, one to `/mediator/encounter/` and one to `/fhir/Encounter/`, as in the image below.
    ![](./images/instance-encounter.png)
   1. If your callback URL test service was set up correctly, you should receive a notification from the mediator.


## Resources
The following [FHIR Resources](https://www.hl7.org/fhir/resource.html) are used to implement the flow above:
- [Patient](https://www.hl7.org/fhir/patient.html)
- [Encounter](https://build.fhir.org/encounter.html)
- [Subscription](https://build.fhir.org/subscription.html)
- [Organization](https://build.fhir.org/organization.html)
- [Endpoint](https://build.fhir.org/endpoint.html)

### Service Request Resource

#### POST ${OPENHIM_ENDPOINT}/mediator/service-request

```http
POST ${OPENHIM_ENDPOINT}/mediator/service-request

{
    "intent": "order",
    "subject": {
        "reference": "Patient/28e1f81b-88ee-4edd-887a-7922c6175926"
    },
    "requester": 
        {
            "reference": "Organization/003b24b5-2396-4d95-bcbc-5a4c63f43ff0"
        }
    ,
    "status": "active"
}
```

```json
{
    "resourceType": "Subscription",
    "id": "4",
    "meta": {
        "versionId": "1",
        "lastUpdated": "2023-04-19T04:41:17.656+00:00",
        "tag": [
            {
                "system": "http://hapifhir.io/fhir/StructureDefinition/subscription-matching-strategy",
                "code": "IN_MEMORY",
                "display": "In-memory"
            }
        ]
    },
    "status": "requested",
    "reason": "Follow up request for patient",
    "criteria": "Encounter?identifier=003b24b5-2396-4d95-bcbc-5a4c63f43ff0",
    "channel": {
        "type": "rest-hook",
        "endpoint": "https://callback.com",
        "payload": "application/fhir+json",
        "header": [
            "Content-Type: application/fhir+json"
        ]
    }
}
```



### Endpoint Resource

#### POST ${OPENHIM_ENDPOINT}/mediator/endpoint

```http
POST ${OPENHIM_ENDPOINT}/mediator/endpoint

{
    "id": "ENDPOINT_ID",
    "identifier": [
        {
            "system": "official",
            "value": "ENDPOINT_ID"
        }
    ],
    "connectionType": {
        "system": "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
        "code": "hl7-fhir-rest"
    },
    "payloadType": [
        {
            "text": "application/json"
        }
    ],
    "address": "https://callback.com",
    "status": "active"
}
```

```json
{
    "resourceType": "Endpoint",
    "id": "1",
    "meta": {
        "versionId": "1",
        "lastUpdated": "2023-04-19T04:40:44.401+00:00"
    },
    "identifier": [
        {
            "system": "official",
            "value": "ENDPOINT_ID"
        }
    ],
    "status": "active",
    "connectionType": {
        "system": "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
        "code": "hl7-fhir-rest"
    },
    "payloadType": [
        {
            "text": "application/json"
        }
    ],
    "address": "https://callback.com"
}
```

### Patient Resource

#### POST ${OPENHIM_ENDPOINT}/mediator/patient

```http
POST ${OPENHIM_ENDPOINT}/mediator/patient

{
    "identifier": [
        {
            "system": "official",
            "value": "003b24b5-2396-4d95-bcbc-5a4c63f43ff0"
        }
    ],
    "name": [
        {
            "family": "Doe",
            "given": [
                "John"
            ]
        }
    ],
    "gender": "male",
    "birthDate": "2000-01-01"
}
```

```json
{
    "resourceType": "Patient",
    "id": "3",
    "meta": {
        "versionId": "1",
        "lastUpdated": "2023-04-19T04:41:01.217+00:00"
    },
    "text": {
        "status": "generated",
        "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><div class=\"hapiHeaderText\">John <b>DOE </b></div><table class=\"hapiPropertyTable\"><tbody><tr><td>Identifier</td><td>003b24b5-2396-4d95-bcbc-5a4c63f43ff0</td></tr><tr><td>Date of birth</td><td><span>01 January 2000</span></td></tr></tbody></table></div>"
    },
    "identifier": [
        {
            "system": "official",
            "value": "003b24b5-2396-4d95-bcbc-5a4c63f43ff0"
        }
    ],
    "name": [
        {
            "family": "Doe",
            "given": [
                "John"
            ]
        }
    ],
    "gender": "male",
    "birthDate": "2000-01-01"
}
```

### Encounter Resource

#### POST ${OPENHIM_ENDPOINT}/mediator/encounter

```http
POST ${OPENHIM_ENDPOINT}/mediator/encounter

{
    "resourceType": "Encounter",
    "identifier": [
        {
            "system": "cht",
            "value": "003b24b5-2396-4d95-bcbc-5a4c63f43ff0"
        }
    ],
    "status": "finished",
    "class": "outpatient",
    "type": [
        {
            "text": "Community health worker visit"
        }
    ],
    "subject": {
        "reference": "Patient/3"
    },
    "participant": [
        {
            "type": [
                {
                    "text": "Community health worker"
                }
            ]
        }
    ]
}
```

```json
{
    "resourceType": "Encounter",
    "id": "5",
    "meta": {
        "versionId": "1",
        "lastUpdated": "2023-04-19T05:00:18.031+00:00"
    },
    "identifier": [
        {
            "system": "cht",
            "value": "003b24b5-2396-4d95-bcbc-5a4c63f43ff0"
        }
    ],
    "status": "finished",
    "type": [
        {
            "text": "Community health worker visit"
        }
    ],
    "subject": {
        "reference": "Patient/3"
    },
    "participant": [
        {
            "type": [
                {
                    "text": "Community health worker"
                }
            ]
        }
    ]
}
```

### Organisation Resource

#### POST ${OPENHIM_ENDPOINT}/mediator/encounter

```http
POST ${OPENHIM_ENDPOINT}/mediator/encounter

{
    "resourceType": "Encounter",
    "identifier": [
        {
            "system": "cht",
            "value": "003b24b5-2396-4d95-bcbc-5a4c63f43ff0"
        }
    ],
    "status": "finished",
    "class": "outpatient",
    "type": [
        {
            "text": "Community health worker visit"
        }
    ],
    "subject": {
        "reference": "Patient/3"
    },
    "participant": [
        {
            "type": [
                {
                    "text": "Community health worker"
                }
            ]
        }
    ]
}
```

```json
{
    "resourceType": "Encounter",
    "id": "5",
    "meta": {
        "versionId": "1",
        "lastUpdated": "2023-04-19T05:00:18.031+00:00"
    },
    "identifier": [
        {
            "system": "cht",
            "value": "003b24b5-2396-4d95-bcbc-5a4c63f43ff0"
        }
    ],
    "status": "finished",
    "type": [
        {
            "text": "Community health worker visit"
        }
    ],
    "subject": {
        "reference": "Patient/3"
    },
    "participant": [
        {
            "type": [
                {
                    "text": "Community health worker"
                }
            ]
        }
    ]
}
```