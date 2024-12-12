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
  array[6] = (array[6] & 0x0f) | 0x40;
  array[8] = (array[8] & 0x3f) | 0x80;
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

  function formatKey(key: any) {
    const spacedKey = key.replace(/([a-z])([A-Z])/g, "$1 $2");

    const normalizedKey = spacedKey.replace(/_/g, " ");

    return normalizedKey.replace(/\b\w/g, (char: any) => char.toUpperCase());
  }

  for (const key in applicationData) {
    const hiddenKey = [
      "age",
      "samagraId",
      "currentSchoolName",
      "currentSchoolAddress",
      "currentSchoolAddressDistrict",
    ];
    if (applicationData.hasOwnProperty(key)) {
      if (hiddenKey?.includes(key)) {
        continue;
      }
      result.push({
        id: idCounter++,
        label: formatKey(key),
        value: applicationData[key],
      });
    }
  }
  return result;
}
