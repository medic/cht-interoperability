import { randomUUID } from "crypto";
import { Factory } from "rosie";
import { VALID_CODE, VALID_SYSTEM } from "../endpoint";

const identifier = [
  {
    system: "cht",
    value: randomUUID(),
  },
];

export const HumanNameFactory = Factory.define("humanName")
  .attr("family", "Doe")
  .attr("given", ["John"]);

export const PatientFactory = Factory.define("patient")
  .attr("identifier", identifier)
  .attr("name", () => [HumanNameFactory.build()])
  .attr("gender", "male")
  .attr("birthDate", "2000-01-01");

export const EncounterFactory = Factory.define("encounter")
  .attr("identifier", identifier)
  .attr("status", {})
  .attr("class", [{}])
  .attr("type", [{}])
  .attr("subject", [{}])
  .attr("participant", [{}]);

export const EndpointFactory = Factory.define("endpoint").attr(
  "connectionType",
  [{ coding: [{ system: VALID_SYSTEM, code: VALID_CODE }] }]
);

export const OrganizationFactory = Factory.define("organization")
  .attr("name", ["athena"])
  .attr("endpoint", [{ type: "Endpoint", identifier: randomUUID() }]);

const SubjectFactory = Factory.define("subject")
  .attr("type", "Patient")
  .attr("identifier", () => randomUUID());

const RequesterFactory = Factory.define("subject")
  .attr("type", "Organization")
  .attr("identifier", () => randomUUID());

export const ServiceRequestFactory = Factory.define("serviceRequest")
  .attr("intent", "order")
  .attr("subject", SubjectFactory.build())
  .attr("requester", [RequesterFactory.build()]);
