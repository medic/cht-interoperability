# Workflow

This document outlines the procedures for handling loss to follow up in addition to documenting the various endpoints available on the mediator. It provides a comprehensive guide on how to navigate the LTFU workflow and how to utilize the endpoints to facilitate the necessary actions.

## Environments

The document provided includes placeholders for URLs. To properly utilize the document, it is important to replace these placeholders with the appropriate endpoints for your specific environment. Below are the endpoints provided for each available environment. It is important to note that if your setup differs from the documentation provided, you may need to use different endpoints. By ensuring that the correct endpoints are used, you can be confident in the successful implementation and utilization of the LTFU workflow.

### Docker

- **MEDIATOR_ENDPOINT** - http://localhost:5001/mediator
- **OpenHIM Admin Console** - http://localhost:9000/
- **CHT with LTFU configuration** - https://localhost:80/

### Live Test Instance

- **MEDIATOR_ENDPOINT** - [https://interoperability.dev.medicmobile.org:5001/mediator](https://interoperability.dev.medicmobile.org:5001/mediator).
- **OpenHIM Admin Console** - [https://interoperability.dev.medicmobile.org](https://interoperability.dev.medicmobile.org).
- **CHT with LTFU configuration** - [https://interop-cht-test.dev.medicmobile.org/](https://interop-cht-test.dev.medicmobile.org/).

## Steps

The following steps assume that you successfully logged in into OpenHIM and the CHT instances.

1.  Create an Organization

    1. HTTP Request - First, make a request to create an Endpoint Resource in the mediator using Postman. You can view the API documentation for creating an endpoint [here](#endpoint-resource). Once you send the request, the mediator will return a JSON response containing the id of the newly created endpoint.

    1. HTTP Request - Next, create an Organization Resource in the mediator using the `endpoint.id` returned from the previous request in the `endpoint.reference` field, replacing `${ENDPOINT_ID}` with the actual id of the endpoint you created in the previous step. Once you send the request, the mediator will return a JSON response containing the `id` of the newly created organization. You can view the API documentation for creating an organization [here](#organisation-resource).

    1. It's important to note that you only need to create an organization once, which you can use for future requests. So, after creating the organization, you can save the `organization.identifier[0].value` value and use it for all future `ServiceRequest`.

1.  Create a Patient

    1. CHT - Log in to the CHT platform using the credentials for the `chw` user.
    1. CHT - Navigate to the `People` tab in the CHT dashboard. From there, select a Facility where you want to create a new `Person`. Click on the `New Person` button and fill in the required details for the Person. Make sure to select `Patient` as the `Person`'s role for this flow.
    1. CHT - Once you have created the new `Person`, you need to retrieve their unique identifier from the browser's URL. You can do this by copying the alphanumeric string that appears after `person/` in the URL. Keep this identifier safe as you will need it for the next steps.
    1. OpenHIM Admin Console - To verify that the `Patient` creation was successful, navigate to the `Transaction Log` in the OpenHIM Admin Console. You should see two successful API calls recorded in the log, one to `/mediator/patient/` and one to `/fhir/Patient/`.
       ![](./images/instance-patient.png)

1.  Request the LTFU for the Patient

    1. HTTP Request - To trigger the LTFU process for the newly created patient, you need to create a `ServiceRequest`. You can refer to the API documentation available [here](#service-request-resource) to learn how to create a `ServiceRequest`. Once the service-request is received by the mediator, it will initiate the LTFU workflow for the patient, which includes reminders for follow-up appointments and check-ins. Replace the `requester.reference` and the `subject.reference` with the `Organization` and `Patient` identifier respectively.

    1. HTTP Request - Verify that the `service-request` was successful in both OpenHIM Mediator & FHIR Resource. Navigate to the `Transaction Log` in the Admin Console. You should see three successful API calls, as in the image below:
       ![](./images/instance-service-request.png)

1.  Handle LTFU Task

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
- [Organization](https://build.fhir.org/organization.html)
- [Endpoint](https://build.fhir.org/endpoint.html)

The payload samples provided in the documentation contain placeholder values that you must replace with the actual content. To do so, replace the entire '${}' placeholder with the appropriate value. Be aware that some placeholder keys have the format '_\_IDENTIFIER' and refer to the value found in the 'Resource.identifier[0].value' field. These keys are different from the '_\_ID' placeholders used in the request, which refer to the 'Resource.id' field. It is important to make this distinction as using the wrong value may cause unexpected behavior in the system. Therefore, always ensure that you use the right value in the right context to avoid errors.

**Note:** The payload only contains the required fields or a subset of the possible options. To view all the available fields, please refer to the appropriate FHIR resource specifications.

### Service Request Resource

The FHIR ServiceRequest resource represents a request for a healthcare service to be performed, such as a diagnostic test or a treatment. It contains information about the requested service, including the type of service, the patient for whom the service is requested, the date/time the service is requested, and the healthcare provider or organization making the request. In the case of the LTFU workflow, we are using this resource to request a chw follow on cht.

#### `POST ${MEDIATOR_ENDPOINT}/service-request`

This endpoint triggers the creation of a `record` on `CHT` and a `Subscription` resource on FHIR. The endpoint associated with the `Organization` resource in the requester is used as the callback URL for the `Subscription` which gets called when FHIR receives an `Encounter` resource with matching `Patient` identifier. The callback endpoint receives a FHIR `Subscription` response as its payload whenever the request is fulfilled. To learn more about FHIR
subscriptions, you can visit the official documentation [here](https://build.fhir.org/subscription.html)

```http
POST ${OPENHIM_ENDPOINT}/service-request

{
    "intent": "order",
    "subject": {
        "reference": "Patient/${PATIENT_IDENTIFIER}"
    },
    "requester": {
        "reference": "Organization/${ORGANIZATION_IDENTIFIER}"
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
    "header": ["Content-Type: application/fhir+json"]
  }
}
```

### Endpoint Resource

In the FHIR specification, the Endpoint resource is used to describe the network address of a system or service where messages or payloads can be exchanged. It defines the communication characteristics for sending and receiving messages, such as the transport protocol, the payload format, and the messaging endpoint's address. The Endpoint resource can be used to specify where to send data for specific purposes, such as notifications, alerts, or reports. It can be used in various contexts, such as clinical care, public health, or research, where different systems or services need to exchange data seamlessly.

#### `POST ${OPENHIM_ENDPOINT}/endpoint`

In the LTFU workflow, the endpoint plays a crucial role in creating a `ServiceRequest`. It is obtained from the organization attached to the `ServiceRequest` as the requester. The endpoint represents the destination where the FHIR server sends notifications about matching encounter resources. Essentially, when the FHIR server receives a matching encounter resource, it sends a notification to the endpoint. The endpoint is used as a callback URL for the FHIR server to notify the requester about the status of the `ServiceRequest`. Therefore, it is important to ensure that the endpoint is accurate and valid for successful communication between the FHIR server and the requesting system.

```http
POST ${OPENHIM_ENDPOINT}/endpoint

{
    "id": "${ENDPOINT_ID}",
    "identifier": [
        {
            "system": "official",
            "value": "${ENDPOINT_IDENTIFIER}"
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
    "address": "${ORG_CALLBACK_URL}",
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

The Patient resource in FHIR represents an individual receiving or awaiting healthcare services. It includes information such as patient demographics, clinical observations, and medical history. It is a foundational resource in healthcare and can be used to track patient progress, manage care plans, and facilitate communication between healthcare providers.

#### `POST ${OPENHIM_ENDPOINT}/patient`

This endpoint is responsible for creating a patient in the LFTU workflow. Patients are created by CHT automatically whenever a new Patient is added to the the system.

```http
POST ${OPENHIM_ENDPOINT}/patient

{
    "identifier": [
        {
            "system": "official",
            "value": "${PATIENT_IDENTIFIER}"
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
      "given": ["John"]
    }
  ],
  "gender": "male",
  "birthDate": "2000-01-01"
}
```

### Encounter Resource

The FHIR Encounter resource is used to represent a clinical interaction between a patient and a healthcare provider. It contains information about the patient's visit, such as the location, reason for the visit, and any relevant procedures or diagnoses.

#### `POST ${OPENHIM_ENDPOINT}/encounter`

The Endpoint resource is an essential part of the LTFU workflow, which is automatically created by the CHT system after a CHW completes the workflow. It triggers FHIR to send a Subscription response to the requesting system when there is a match with the Encounter resource. This allows for efficient monitoring and follow-up care of patients in the LTFU workflow.

```http
POST ${OPENHIM_ENDPOINT}/encounter

{
    "resourceType": "Encounter",
    "identifier": [
        {
            "system": "cht",
            "value": "${ENCOUNTER_IDENTIFIER}"
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
        "reference": "Patient/${PATIENT_IDENTIFIER}"
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

The FHIR Organization resource represents a group of people or entities that share a common purpose or focus. It contains information such as the organization's name, type, and contact details. This resource is often used in healthcare settings to represent healthcare providers, hospitals, clinics, and other organizations involved in patient care. In the LTFU system it represents the requesting system and it points to the callback url of the requesting system.

#### `POST ${OPENHIM_ENDPOINT}/organization`

The `Organization` resource in the LTFU workflow represents the requesting system. Prior to creating an `Organization`, an `Endpoint` must be created.

```http
POST ${OPENHIM_ENDPOINT}/encounter

{
    "identifier": [
        {
            "system": "official",
            "value": "${ORGANIZATION_IDENTIFIER}"
        }
    ],
    "name": [
        "Athena"
    ],
    "endpoint": [
        {
            "reference": "Endpoint/${ENDPOINT_ID}"
        }
    ]
}
```

```json
{
  "resourceType": "Organization",
  "id": "2",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2023-04-19T04:40:48.663+00:00"
  },
  "identifier": [
    {
      "system": "official",
      "value": "003b24b5-2396-4d95-bcbc-5a4c63f43ff0"
    }
  ],
  "name": "Athena",
  "endpoint": [
    {
      "reference": "Endpoint/1"
    }
  ]
}
```