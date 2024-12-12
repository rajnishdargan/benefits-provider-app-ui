import { JSONSchema7 } from "json-schema";

interface ApplicationFormField {
  type: string;
  name: string;
  label: string;
  required: boolean;
  options?: { value: string; label: string }[];
  multiple?: boolean;
}

interface Doc {
  doc_data: string;
  doc_datatype: string;
  doc_id: string;
  doc_name: string;
  doc_path: string;
  doc_subtype: string;
  doc_type: string;
  doc_verified: boolean;
  imported_from: string;
  is_uploaded: boolean;
  uploaded_at: string;
  user_id: string;
}
export const convertApplicationFormFields = (
  applicationForm: ApplicationFormField[]
) => {
  const rjsfSchema: any = {
    title: "",
    type: "object",
    properties: {},
  };
  applicationForm.forEach((field) => {
    let fieldSchema: any = {
      type: "string",
      title: field.label,
    };
    if (field.name === "bankAccountNumber") {
      fieldSchema.minLength = 9;
      fieldSchema.maxLength = 18;
      fieldSchema.pattern = "^[0-9]+$";
    }

    if (field.name === "bankIfscCode") {
      fieldSchema.pattern = "^[A-Z]{4}0[A-Z0-9]{6}$";
      fieldSchema.title = field.label || "Enter valid IFSC code";
    }
    if (field.type === "radio" || field.type === "select") {
      fieldSchema.enum = field.options?.map((option) => option.value);
      fieldSchema.enumNames = field.options?.map((option) => option.label);
    }

    if (field.required) {
      fieldSchema.required = true;
    }

    rjsfSchema.properties[field.name] = fieldSchema;
  });
  return rjsfSchema;
};

export const convertDocumentFields = (
  schemaArr: any[],
  userDocs: Doc[]
): JSONSchema7 => {
  const schema: any = {
    type: "object",
    properties: {},
  };

  const groupedByAllowedProofs: any = {};

  schemaArr.forEach((item) => {
    item.allowedProofs.forEach((proof: any) => {
      if (!groupedByAllowedProofs[proof]) {
        groupedByAllowedProofs[proof] = {
          name: proof,
          isRequired: Boolean(item.isRequired || item?.criteria?.name || false),
          schema: [],
        };
      } else {
        groupedByAllowedProofs[proof] = {
          ...groupedByAllowedProofs[proof],
          isRequired: Boolean(
            item.isRequired ||
              item?.criteria?.name ||
              groupedByAllowedProofs[proof]?.isRequired
          ),
        };
      }
      groupedByAllowedProofs[proof].schema.push(item);
    });
  });

  const schemaDoc = Object.values(groupedByAllowedProofs);
  schemaDoc.forEach((field: any) => {
    const matchingDocs = userDocs?.filter((doc: Doc) =>
      field?.name?.includes(doc.doc_subtype)
    );

    const [enumValues, enumNames] = matchingDocs?.reduce(
      ([values, names]: any, doc: Doc) => {
        values.push(doc.doc_data);
        names.push(doc.doc_subtype);
        return [values, names];
      },
      [[], []]
    ) ?? [[], []];

    const fieldLabel = `Choose ${field.name} for ${field.schema
      .map((e: any) =>
        e.documentType ? e.documentType : e?.criteria?.name || ""
      )
      .join(", ")}`;
    let enumValuesToUse: string[] = [];
    if (enumValues.length > 0) {
      enumValuesToUse = enumValues as string[];
    } else if (field.isRequired) {
      enumValuesToUse = [];
    } else {
      enumValuesToUse = [""];
    }
    schema.properties![field?.name] = {
      type: "string",
      title: fieldLabel,
      required: field.isRequired,
      enum: enumValuesToUse,
      enumNames: (enumNames as string[]) || [],
      default: enumValues[0] || "",
    };
  });

  return schema;
};
