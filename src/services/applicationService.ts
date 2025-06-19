import apiClient from "../utils/apiClient";

export const getApplicationDetails = async (applicationId: string) => {
  try {
    const response = await apiClient.get(`/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching application details:", error);
    throw error;
  }
};

export const verifyAllDocuments = async (applicationId: string) => {
  try {
    const response = await apiClient.post("/verification/verify-vcs", {
      applicationId,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying all documents:", error);
    throw error;
  }
};

export const verifySelectedDocuments = async (
  applicationId: string,
  applicationFileIds: number[]
) => {
  try {
    const response = await apiClient.post("/verification/verify-vcs", {
      applicationId,
      applicationFileIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying selected documents:", error);
    throw error;
  }
};
export const checkEligibility = async (
  applicationId: string | number,
  strictCheck: boolean = true
) => {
  try {
    const response = await apiClient.get(
      `/applications/check-eligibility/${applicationId}`,
      {
        params: {
          strictCheck,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking eligibility:", error);
    throw error;
  }
};
