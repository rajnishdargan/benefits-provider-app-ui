import apiClient from "../utils/apiClient";

export const getApplicationDetails = async (applicationId: string) => {
  try {
    const response = await apiClient.get(
      `/applications/${applicationId}`
    );
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