import _ from "lodash";

export const decodeBase64ToJson = (input: string) => {
  try {
    // Step 1: Base64 decode
    const base64Decoded = atob(input);

    // Step 2: URL decode
    const jsonString = decodeURIComponent(base64Decoded);

    // Step 3: Parse JSON
    const jsonData = JSON.parse(jsonString);

    return jsonData;
  } catch (error) {
    console.error("Error decoding and parsing JSON:", error);
    return null;
  }
};

export const isBase64 = (str: string): boolean => {
  if (!str || typeof str !== "string") return false;

  // Basic check for only base64-allowed characters
  const basicBase64Pattern = /^[A-Za-z0-9+/=\r\n]+$/;

  return basicBase64Pattern.test(str.trim());
};


export const isDateString = (value: any): boolean => {
  if (!_.isString(value)) return false;

  const date = new Date(value);
  return !isNaN(date.getTime()) && value.includes('GMT');
};

export const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const convertKeysToTitleCase = (obj: Record<string, any>): Record<string, any> => {
  if (!obj || typeof obj !== "object") return obj;

  const customKeyMappings: Record<string, string> = {
    issuedby: "Attested By",
    issuerauthority: "Attestor Authority",
    issueddate: "Date of Attestation",
    issued_date: "Date of Attestation",
  };

  const toTitleCase = (str: string): string =>
    str
      .replace(/_/g, " ") // Replace underscores with spaces
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const normalizedKey = key.toLowerCase();
    const titleCaseKey = customKeyMappings[normalizedKey] || customKeyMappings[key] || toTitleCase(key);
    acc[titleCaseKey] = value;
    return acc;
  }, {} as Record<string, any>);
};


export const formatTitle = (title: string): string => {
  if (!title) return "";
  // Remove numbers, underscores, and .json
  const cleanedTitle = title.replace(/[\d_]+|\.json/g, "");
  // Convert to capital case
  const formattedTitle = cleanedTitle
    .split(/(?=[A-Z])|(?=[a-z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  // Add space before "CERTIFICATE" and capitalize it
  return formattedTitle.replace(/Certificate/i, " CERTIFICATE");
};

