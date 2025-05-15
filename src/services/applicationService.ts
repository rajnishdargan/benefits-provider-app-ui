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