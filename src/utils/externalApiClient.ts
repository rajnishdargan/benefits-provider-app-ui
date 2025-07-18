import axios from "axios";

// Create an API client for external services that don't require authentication
const externalApiClient = axios.create({
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add a response interceptor for error handling (optional)
externalApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("External API Error:", error);
    return Promise.reject(error instanceof Error ? error : new Error(error));
  }
);

export default externalApiClient;
