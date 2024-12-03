// trans form erros in i18 lang translate

interface UserData {
  id: number;
  label: string;
  value: string;
  length?: number;
}
export const transformErrors = (errors: any, schema: any, t: any) => {
  console.log(errors);
  const getTitle = (schemaItem: any) =>
    schemaItem?.label || schemaItem?.title || "";

  const getMessage = (error: any) => {
    // if (error?.stack) {
    //   return { stack: error?.stack };
    // }
    const schemaItem = schema?.properties?.[error?.property?.replace(".", "")];
    const title = getTitle(schemaItem);
    let returnData = {};

    const getErrorObj = (message: any) => {
      returnData = { ...returnData, message };
    };

    switch (error.name) {
      case "required":
        getErrorObj(
          `${t(
            schemaItem?.format === "FileUpload"
              ? "REQUIRED_MESSAGE_UPLOAD"
              : "REQUIRED_MESSAGE"
          )} "${t(title)}"`
        );
        break;
      case "minItems":
        getErrorObj(
          t("SELECT_MINIMUM")
            .replace("{0}", error?.params?.limit)
            .replace("{1}", t(title))
        );
        break;
      case "maxItems":
        getErrorObj(
          t("SELECT_MAXIMUM")
            .replace("{0}", error?.params?.limit)
            .replace("{1}", t(title))
        );
        break;
      case "enum":
        getErrorObj(t("SELECT_MESSAGE"));

        break;
      default:
        getErrorObj(error.message);
        break;
    }
    console.log(returnData);
    return returnData;
  };

  return errors.map((error: any) => ({ ...error, ...getMessage(error) }));
};
export function generateUUID(): string {
  if (typeof crypto === "undefined") {
    throw new Error("Crypto API is not available");
  }
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  array[6] = (array[6] & 0x0f) | 0x40; // Version 4 +
  array[8] = (array[8] & 0x3f) | 0x80; // Variant 10xxxxxxVariant 10xxxxxx +
  // Convert array to UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return [
    array
      .slice(0, 4)
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), ""),
    array
      .slice(4, 6)
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), ""),
    array
      .slice(6, 8)
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), ""),
    array
      .slice(8, 10)
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), ""),
    array
      .slice(10)
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), ""),
  ].join("-");
}
export function getPreviewDetails(applicationData: any) {
  let idCounter = 1;
  const result: UserData[] = [];
  // documents.push("docs", "domicileCertificate");

  function formatKey(key: any) {
    const spacedKey = key.replace(/([a-z])([A-Z])/g, "$1 $2");

    const normalizedKey = spacedKey.replace(/_/g, " ");

    return normalizedKey.replace(/\b\w/g, (char: any) => char.toUpperCase());
  }

  for (const key in applicationData) {
    if (applicationData.hasOwnProperty(key)) {
      // Skip keys listed in the `arr`

      result.push({
        id: idCounter++,
        label: formatKey(key),
        value: applicationData[key],
      });
    }
  }

  return result;
}
