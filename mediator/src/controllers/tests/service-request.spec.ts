import {
  mockGetFHIRPatientResource,
  mockGetFHIROrgEndpointResource,
  mockCreateFHIRSubscriptionResource,
  mockCreateChtRecord,
  mockDeleteFhirSubscription,
} from "./utils";
import axios from "axios";
import { createServiceRequest } from "../service-request";

jest.mock("axios");
jest.mock("../../../logger");

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("ServiceRequest controllers", () => {
  const reference: any = "Person/ID";
  const request: fhir5.ServiceRequest = {
    resourceType: "ServiceRequest",
    intent: "proposal",
    status: "draft",
    subject: { reference },
    requester: { reference },
  };

  describe("createServiceRequest", () => {
    it("creates a new subscriptions resource on fhir and cht record", async () => {
      const recordRes = { status: 201, data: { success: true } };
      const patientRes = { status: 201, data: { resourceType: "Patient" } };
      const endpointRes = { status: 201, data: { resourceType: "Endpoint" } };
      const subscriptionRes = {
        status: 201,
        data: { resourceType: "Subscription" },
      };

      mockGetFHIRPatientResource.mockResolvedValueOnce(patientRes as any);
      mockGetFHIROrgEndpointResource.mockResolvedValueOnce(endpointRes as any);
      mockCreateFHIRSubscriptionResource.mockResolvedValueOnce(
        subscriptionRes as any
      );
      mockCreateChtRecord.mockResolvedValueOnce(recordRes as any);
      mockDeleteFhirSubscription.mockResolvedValueOnce({} as any);

      const res = await createServiceRequest(request);

      expect(res.status).toBe(subscriptionRes.status);
      expect(res.data).toBe(subscriptionRes.data);
    });

    it("returns default status and data when not provided in error", async () => {
      const patientRes = { message: "message" };

      mockGetFHIRPatientResource.mockRejectedValueOnce(patientRes);

      const res = await createServiceRequest(request);

      expect(res.status).toBe(500);
      expect(res.data.message).toBe(patientRes.message);
    });


    it("returns status and data of any axios error", async () => {
      const patientRes = { status: 200, data: { resourceType: "Patient" } };

      mockGetFHIRPatientResource.mockRejectedValueOnce(patientRes);

      const res = await createServiceRequest(request);

      expect(res.status).toBe(patientRes.status);
      expect(res.data).toBe(patientRes.data);
    });

    it("deletes fhir subscription resource if cht record creation fails", async () => {
      const recordRes = { status: 200, data: { success: false } };
      const patientRes = { status: 200, data: { resourceType: "Patient" } };
      const endpointRes = { status: 200, data: { resourceType: "Endpoint" } };
      const subscriptionRes = {
        status: 201,
        data: { resourceType: "Subscription" },
      };

      mockGetFHIRPatientResource.mockResolvedValueOnce(patientRes as any);
      mockGetFHIROrgEndpointResource.mockResolvedValueOnce(endpointRes as any);
      mockCreateFHIRSubscriptionResource.mockResolvedValueOnce(
        subscriptionRes as any
      );
      mockCreateChtRecord.mockResolvedValueOnce(recordRes as any);
      mockDeleteFhirSubscription.mockResolvedValueOnce({} as any);

      const res = await createServiceRequest(request);

      expect(res.status).toBe(500);
      expect(res.data.message).toMatchInlineSnapshot(
        `"Unable to create the follow up task"`
      );
    });
  });
});
