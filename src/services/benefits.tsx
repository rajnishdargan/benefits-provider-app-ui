import apiClient from "../utils/apiClient";
import { generateUUID } from "../utils/dataJSON/helper/helper";

interface BenefitRequestInfo {
  apiId: string;
  ver?: string | null;
  ts?: string | null;
  action?: string | null;
  did?: string | null;
  key?: string | null;
  msgId: string;
  authToken: string;
  userInfo: {
    id: number;
    uuid: string;
    userName: string;
    name: string;
    mobileNumber: string;
    emailId: string;
    type: string;
    active: boolean;
    tenantId: string;
  };
}

interface SponsorData {
  id: string;
  benefitSponsor: string;
  sponsorEntity: string;
  sponsorShare: string;
  type: string;
}

interface Benefit {
  benefitName: string;
  benefitProvider: string;
  benefitDescription: string;
  sponsors: SponsorData[];
  status: string;
}
interface BenefitAmountCategory {
  beneficiaryCaste: string;
  beneficiaryType: string;
  beneficiaryCategory: string;
  beneficiaryAmount: number;
}
interface TermsAndCondition {
  academicYear?: boolean;
  failYear?: boolean;
  deadlineDate?: string;
  extendDeadlineDate: string;
  validDate: string;
  renewableApplicable: boolean;
}
interface BenefitPayload {
  RequestInfo: BenefitRequestInfo;
  Benefit: Benefit;
}

interface BenefitAmountCategoryPayload {
  RequestInfo: BenefitRequestInfo;
  Benefit: Benefit;
  BenefitAmountCategory: BenefitAmountCategory[];
}
interface BenefitTermsAndCondition {
  RequestInfo: BenefitRequestInfo;
  Benefit: Benefit;
  TermsAndCondition: TermsAndCondition;
}

interface ViewAllBenefits {
  name: string | null;
  valid_till: string | null;
  created_start: string | null;
  created_end: string | null;
  status: string;
  page_no: number;
  page_size: number;
  sort_by: string;
  sort_order: string;
}
interface PrefillData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  class: string;
  annualIncome: string;
  caste: string;
  disabled: string;
  state: string;
  student: string;
  identityProof: string | null;
}
export const createBenefitForm = async (payload: BenefitPayload) => {
  try {
    const response = await apiClient.post(`/benefits/v1/_create`, payload);
    console.log(response.data);
    return response?.data;
  } catch (error) {
    console.log(error);
  }
};
export const updateForm = async (
  payload:
    | BenefitPayload
    | BenefitAmountCategoryPayload
    | BenefitTermsAndCondition
) => {
  try {
    const response = await apiClient.post(`/benefits/v1/_update`, payload);
    console.log(response.data);
    return response?.data;
  } catch (error) {
    console.log(error);
  }
};

export const viewAllBenefitsData = async (payload: ViewAllBenefits) => {
  try {
    const response = await apiClient.post(`/benefits/v1/_search`, payload);
    return response?.data;
  } catch (error) {
    console.log(error);
  }
};

export const viewAllApplicationByBenefitId = async (id: string) => {
  try {
    const response = await apiClient.get(`/applications`, {
      params: { benefitId: id }, // Pass benefitId as a query parameter
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching applications by benefit ID:", error);
  }
};

export const viewApplicationByApplicationId = async (id: string) => {
  try {
    const payload = {
      applicationId: id,
    };
    const response = await apiClient.post(
      `/application/v1/getByApplicationId`,
      payload
    );
    return response?.data;
  } catch (error) {
    console.log(error);
  }
};

export const submitForm = async (payload: PrefillData) => {
  try {
    const response = await apiClient.post(`/applications`, payload);
    return response?.data;
  } catch (error) {
    console.log(error);
  }
};
export const getSchema = async (id: string) => {
  const payload = {
    context: {
      domain: "onest:financial-support",
      action: "select",
      timestamp: "2023-08-02T07:21:58.448Z",
      ttl: "PT10M",
      version: "1.1.0",
      bap_id: import.meta.env.VITE_BAP_ID,
      bap_uri: import.meta.env.VITE_BAP_URI,
      bpp_id: import.meta.env.VITE_BPP_ID,
      bpp_uri: import.meta.env.VITE_BPP_URI,
      transaction_id: generateUUID(),
      message_id: generateUUID(),
    },
    message: {
      order: {
        items: [
          {
            id: id,
          },
        ],
        provider: {
          id: id,
        },
      },
    },
  };
  try {
    const response = await apiClient.post(
      `${import.meta.env.VITE_BENEFIT_SCHEMA_API}/api/select`,
      payload
    );
    return response?.data;
  } catch (error) {
    console.log(error);
  }
};

export const getBenefitList = async () => {
  try {
    const payload = {};
    const response = await apiClient.post(`/benefits/search`, payload);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching benefits:", error);
    throw error;
  }
};

export const updateApplicationStatus = async (
  id: string | undefined,
  status: string,
  remark: string
) => {
  try {
    const response = await apiClient.patch(`/applications/${id}/status`, {
      status,
      remark,
    });
    return response?.data;
  } catch (error) {
    console.error("Failed to update application status:", error);
    throw error;
  }
};

interface ExportCsvParams {
  benefitId: string;
  type: string;
}

export const exportApplicationsCsv = async ({
  benefitId,
  type,
}: ExportCsvParams) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get("/applications/reports/csvexport", {
      params: {
        benefitId,
        type,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob", // important if you expect a CSV file as blob
    });

    return response.data; // this will be the CSV file blob
  } catch (error) {
    console.error("Failed to export applications CSV:", error);
    throw error;
  }
};

export const calculateBenefitAmount = async (applicationId: number) => {
  try {
    const response = await apiClient.get(
      `/applications/calculate-benefit/${applicationId}`,
      {} // empty body as per your cURL
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error calculating benefit:", error);
    throw error;
  }
};
