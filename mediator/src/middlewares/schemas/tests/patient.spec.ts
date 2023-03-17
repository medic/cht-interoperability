import { createPatientSchema } from "../patient";

describe("createPatientSchema", () => {
  it("accepts when all values are present", async () => {
    const data = {
      name: "John Doe",
      _id: "JOHN_DOE_ID",
      id: "OPTIONAL",
      sex: "male",
      date_of_birth: "2000-01-01",
      parent: "OPTIONAL",
      type: "OPTIONAL",
    };

    const res = await createPatientSchema.validateAsync(data);
    expect(res).toMatchSnapshot();
  });

  it("accepts when only required values are present", async () => {
    const data = {
      name: "John Doe",
      _id: "JOHN_DOE_ID",
      sex: "male",
      date_of_birth: "2000-01-01",
    };

    const res = await createPatientSchema.validateAsync(data);
    expect(res).toMatchSnapshot();
  });

  it("accepts only valid right genders", async () => {
    const data = {
      name: "John Doe",
      _id: "JOHN_DOE_ID",
      id: "OPTIONAL",
      sex: "dangled beef",
      date_of_birth: "2000-01-01",
      parent: "OPTIONAL",
      type: "OPTIONAL",
    };

    expect(createPatientSchema.validateAsync(data)).rejects.toMatchSnapshot();

    expect(
      await createPatientSchema.validateAsync({ ...data, sex: "female" })
    ).toMatchSnapshot();
    expect(
      await createPatientSchema.validateAsync({ ...data, sex: "unknown" })
    ).toMatchSnapshot();
    expect(
      await createPatientSchema.validateAsync({ ...data, sex: "other" })
    ).toMatchSnapshot();
  });

  it("accepts only dates in the format of YYYY-MM-DD", () => {
    const data = {
      name: "John Doe",
      _id: "JOHN_DOE_ID",
      id: "OPTIONAL",
      sex: "male",
      date_of_birth: "01-2000-01",
      parent: "OPTIONAL",
      type: "OPTIONAL",
    };

    expect(
      createPatientSchema.validateAsync(data)
    ).rejects.toThrowErrorMatchingSnapshot();
    expect(
      createPatientSchema.validateAsync({
        ...data,
        date_of_birth: "01-01-2000",
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
