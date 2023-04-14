import { randomUUID } from "crypto";
import { Factory } from "rosie";

export const HumanNameFactory = Factory.define("humanName")
  .attr("family", "Doe")
  .attr("given", "John");

export const PatientFactory = Factory.define("patient")
  .attr("id", () => randomUUID())
  .attr("identifier", () => [
    {
      system: "cht",
      value: randomUUID(),
    },
  ])
  .attr("name", () => [HumanNameFactory.build()])
  .attr("gender", ["gender"], (gender) => {
    if (!gender) {
      return "male";
    }

    return gender;
  })
  .attr("birthDate", "2000-01-01")
