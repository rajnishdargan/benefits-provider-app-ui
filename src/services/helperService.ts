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

export const isBase64 = (str: string) => {
    const base64Pattern = /^([A-Za-z0-9+/=]|\r|\n)+$/;
    return base64Pattern.test(str);
  }