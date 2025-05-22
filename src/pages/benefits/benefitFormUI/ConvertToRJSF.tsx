import { JSONSchema7 } from "json-schema";

// Define the structure for application form fields
interface ApplicationFormField {
  type: string;
  name: string;
  label: string;
  required: boolean;
  options?: { value: string; label: string }[];
  multiple?: boolean;
}

// Define the structure for document objects
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

// Define the structure for eligibility items
interface EligItem {
  allowedProofs: string[];
  criteria: { name: string };
  isRequired?: boolean;
}

// Add interface for required docs items
interface RequiredDoc {
  allowedProofs: string[];
  isRequired?: boolean;
  documentType: string; // Added to track document type
}

// Convert application form fields to RJSF schema
export const convertApplicationFormFields = (
  applicationForm: ApplicationFormField[]
) => {
  // Initialize the RJSF schema object
  const rjsfSchema: any = {
    title: "",
    type: "object",
    properties: {},
  };

  // Iterate over each application form field and build its schema
  applicationForm.forEach((field) => {
    // Build the schema for each field
    let fieldSchema: any = {
      type: "string",
      title: field.label,
    };

    // Handle specific field validations
    if (field.name === "bankAccountNumber") {
      fieldSchema.minLength = 9;
      fieldSchema.maxLength = 18;
      fieldSchema.pattern = "^[0-9]+$";
    } else if (field.name === "bankIfscCode") {
      fieldSchema.pattern = "^[A-Z]{4}0[A-Z0-9]{6}$";
      fieldSchema.title = field.label || "Enter valid IFSC code";
    }

    // Handle radio/select fields with options
    if (field.type === "radio" || field.type === "select") {
      fieldSchema.enum = field.options?.map((option) => option.value);
      fieldSchema.enumNames = field.options?.map((option) => option.label);
    }

    // Mark field as required if applicable
    if (field.required) {
      fieldSchema.required = true;
    }

    // Add the field schema to the properties
    rjsfSchema.properties[field.name] = fieldSchema;
  });

  return rjsfSchema;
};

// Helper function to create enum values and names from documents
const createDocumentEnums = (docs: Doc[]): [string[], string[]] => {
  if (!docs || docs.length === 0) return [[], []];

  return docs.reduce(
    ([values, names]: [string[], string[]], doc: Doc): [string[], string[]] => {
      values.push(doc.doc_data);
      names.push(doc.doc_subtype);
      return [values, names];
    },
    [[], []]
  );
};

// Helper function to create a document field schema
const createDocumentFieldSchema = (
  title: string,
  isRequired: boolean,
  enumValues: string[],
  enumNames: string[],
  proof?: string
): any => {
  // For income proof documents, ensure we label it clearly as income proof

  // Add document type to the title if provided
  if (proof) {
    proof = proof
      .split("/")
      .map((segment) =>
        segment
          .trim()
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      )
      .join(" / "); // Join back

    title = `${title} (${proof})`;
  }

  return {
    type: "string",
    title,
    required: isRequired,
    enum: enumValues.length > 0 ? enumValues : [""],
    enumNames: enumNames || [],
    default: enumValues[0] || "",
  };
};

// Helper function to filter documents by proof types
const filterDocsByProofs = (docs: Doc[], proofs: string[]): Doc[] => {
  return docs?.filter((doc: Doc) => proofs.includes(doc.doc_subtype)) || [];
};

// Convert eligibility and document fields to RJSF schema
export const convertDocumentFields = (
  schemaArr: any[],
  userDocs: Doc[]
): JSONSchema7 => {
  // Initialize the RJSF schema object for documents
  const schema: any = {
    type: "object",
    properties: {},
  };

  // Track required fields for the root schema
  const requiredFields: string[] = [];

  // Separate eligibility and required-docs (mandatory/optional)
  const eligibilityArr = schemaArr.filter(
    (item) => item.criteria && item.allowedProofs
  );
  const requiredDocsArr = schemaArr.filter(
    (item) => !item.criteria && item.allowedProofs
  ) as RequiredDoc[];

  type ProofEntry = {
    documentType: string;
    proof: string;
  };

  // Build sets for optional-docs and mandatory-docs for quick lookup
  const optionalDocsProofs: ProofEntry[] = [];
  const mandatoryDocsProofs: ProofEntry[] = [];

  requiredDocsArr.forEach((doc) => {
    if (!Array.isArray(doc.allowedProofs)) return;

    const targetArray =
      doc.isRequired === true ? mandatoryDocsProofs : optionalDocsProofs;

    doc.allowedProofs.forEach((proof: string) => {
      const entry = { documentType: doc.documentType, proof };
      if (
        !targetArray.some(
          (e) =>
            e.documentType === entry.documentType && e.proof === entry.proof
        )
      ) {
        targetArray.push(entry);
      }
    });
  });

  // Group eligibility criteria by their allowedProofs set
  const eligProofGroups: Record<
    string,
    { criteriaNames: string[]; allowedProofs: string[]; eligs: EligItem[] }
  > = {};

  eligibilityArr.forEach((elig) => {
    const { allowedProofs, criteria } = elig;
    if (!Array.isArray(allowedProofs) || !criteria?.name) return;

    // Use sorted allowedProofs as key for grouping
    const key = JSON.stringify(
      [...allowedProofs].sort((a, b) => a.localeCompare(b))
    );

    if (!eligProofGroups[key]) {
      eligProofGroups[key] = { criteriaNames: [], allowedProofs, eligs: [] };
    }
    eligProofGroups[key].criteriaNames.push(criteria.name);
    eligProofGroups[key].eligs.push(elig);
  });

  // Debug: log the eligibility proof groups

  // Render grouped eligibility fields
  Object.values(eligProofGroups).forEach((group) => {
    const { criteriaNames, allowedProofs, eligs } = group;

    // Check if all allowedProofs are present as either optional-doc or mandatory-doc
    const matchedProofs: ProofEntry[] = [];

    const allPresent = allowedProofs.every((proof: string) => {
      const optionalMatch = optionalDocsProofs.find(
        (entry) => entry.proof === proof
      );
      if (optionalMatch) {
        matchedProofs.push(optionalMatch);
        return true;
      }

      const mandatoryMatch = mandatoryDocsProofs.find(
        (entry) => entry.proof === proof
      );
      if (mandatoryMatch) {
        matchedProofs.push(mandatoryMatch);
        return true;
      }

      return false; // not found in either
    });

    // Find matching documents for these proofs
    const matchingDocs = filterDocsByProofs(userDocs, allowedProofs);
    const [enumValues, enumNames] = createDocumentEnums(matchingDocs);

    // Use / as separator for allowedProofs in the label
    const allowedProofsLabel = allowedProofs.join(" / ");

    // If all allowedProofs are present in required-docs, render as required single select
    if (allPresent && criteriaNames.length > 0) {
      // If only one criterion in the group, use its name as the field name
      // If multiple, join names, and always use _doc suffix for document select fields
      const fieldName =
        (criteriaNames.length === 1
          ? criteriaNames[0]
          : criteriaNames.join("_")) + "_doc";

      // Look for document types from matchedProofs
      const documentTypes = matchedProofs
        .map((entry) => entry.documentType)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index); // unique values

      // Use document type if all proofs have the same type
      const documentType =
        documentTypes.length === 1 ? documentTypes[0] : undefined;

      let fieldLabel;
      if (documentType) {
        fieldLabel = `Choose document for ${criteriaNames.join(
          ", "
        )}, ${documentType}`;
      } else {
        fieldLabel = `Choose document for ${criteriaNames.join(", ")}`;
      }
      schema.properties![fieldName] = createDocumentFieldSchema(
        fieldLabel,
        true,
        enumValues,
        enumNames,
        allowedProofsLabel
      );

      requiredFields.push(fieldName);
    } else {
      // Fallback: for each eligibility criterion
      eligs.forEach((elig) => {
        const { allowedProofs, criteria } = elig;

        if (allowedProofs.length > 1) {
          // Render a single select for all allowedProofs for this criterion
          const matchingDocs = filterDocsByProofs(userDocs, allowedProofs);
          const [enumValues, enumNames] = createDocumentEnums(matchingDocs);
          const allowedProofsLabel = allowedProofs.join(" / ");

          // Find document type from required docs if available

          schema.properties![`${criteria.name}_doc`] =
            createDocumentFieldSchema(
              `Choose document for ${criteria.name}`,
              true,
              enumValues,
              enumNames,
              allowedProofsLabel
            );

          requiredFields.push(`${criteria.name}_doc`);
        } else {
          // Only one allowedProof, render as before
          allowedProofs.forEach((proof: string) => {
            const proofDocs = filterDocsByProofs(userDocs, [proof]);
            const [proofEnumValues, proofEnumNames] =
              createDocumentEnums(proofDocs);

            schema.properties![`${criteria.name}_${proof}_doc`] =
              createDocumentFieldSchema(
                `Choose document for ${criteria.name}`,
                true,
                proofEnumValues,
                proofEnumNames,
                proof
              );

            requiredFields.push(`${criteria.name}_${proof}_doc`);
          });
        }
      });
    }
  });

  // Add required-docs (mandatory/optional) that are not already handled
  const sortedRequiredDocsArr = [...requiredDocsArr].sort(
    (a, b) => Number(b.isRequired) - Number(a.isRequired)
  );

  sortedRequiredDocsArr.forEach((doc) => {
    if (!Array.isArray(doc.allowedProofs)) return;

    doc.allowedProofs.forEach((proof: string) => {
      // Check if this proof should be shown as a separate document field
      let showAsSeparateDocField = Object.values(eligProofGroups).some(
        (group) =>
          group.allowedProofs.length > 1 && group.allowedProofs.includes(proof)
      );

      // If not mandatory, or not in eligibility, skip if already handled
      if (!showAsSeparateDocField) {
        const alreadyHandled = Object.values(eligProofGroups).some((group) =>
          group.allowedProofs.includes(proof)
        );
        if (alreadyHandled) return;
      }

      // Prepare select options from userDocs for this proof
      const proofDocs = filterDocsByProofs(userDocs, [proof]);
      const [enumValues, enumNames] = createDocumentEnums(proofDocs);

      // Include the document type in the label for fields coming from requiredDocsArr
      schema.properties![proof] = createDocumentFieldSchema(
        `Choose document for ${doc.documentType}`,
        !!doc.isRequired,
        enumValues,
        enumNames,
        proof // Pass the document type to be included in the label
      );
      //Choose document for idProof (otrCertificate)
      if (doc.isRequired) requiredFields.push(proof);
    });
  });

  // Set the required fields at the root of the schema
  schema.required = requiredFields;

  return schema;
};

export const extractUserDataForSchema = (
  formData: Record<string, any>,
  properties: Record<string, any>
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const key of Object.keys(properties)) {
    if (Object.prototype.hasOwnProperty.call(formData, key)) {
      result[key] = String(formData[key]);
    }
  }

  return result;
};
