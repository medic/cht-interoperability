import { randomUUID } from "crypto";
import { Factory } from "rosie";

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
