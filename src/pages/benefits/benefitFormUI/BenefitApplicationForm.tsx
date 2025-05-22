import { Box } from "@chakra-ui/react";
import { Theme as ChakraTheme } from "@rjsf/chakra-ui";
import { withTheme } from "@rjsf/core";
import { SubmitButtonProps, getSubmitButtonOptions } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CommonButton from "../../../components/common/buttons/SubmitButton";
import Loading from "../../../components/common/Loading";
import { getSchema, submitForm } from "../../../services/benefits";
import {
  convertApplicationFormFields,
  convertDocumentFields,
  extractUserDataForSchema,
} from "./ConvertToRJSF";

const Form = withTheme(ChakraTheme);
const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const { uiSchema } = props;
  const { norender } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return <button type="submit" style={{ display: "none" }}></button>;
};

interface EligibilityItem {
  value: string;
  descriptor?: {
    code?: string;
    name?: string;
    short_desc?: string;
  };
  display?: boolean;
}
const BenefitApplicationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // State variables for form schema, data, refs, etc.
  const [formSchema, setFormSchema] = useState<any>(null);
  const [formData, setFormData] = useState<object>({});
  const formRef = useRef<any>(null);
  const [docSchema, setDocSchema] = useState<any>(null);
  const [extraErrors, setExtraErrors] = useState<any>(null);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [uiSchema, setUiSchema] = useState({});

  useEffect(() => {
    // Fetch and process schema data when id changes
    const getApplicationSchemaData = async (
      receivedData: any,
      benefit: any,
      documentTag: any,
      eligibilityTag: any
    ) => {
      if (benefit) {
        // Convert application form fields to RJSF schema
        const applicationFormSchema = convertApplicationFormFields(benefit);

        const prop = applicationFormSchema?.properties;

        // Pre-fill form data if available
        Object.keys(prop).forEach((item: string) => {
          if (receivedData?.[item] && receivedData?.[item] !== "") {
            prop[item] = {
              ...prop[item],
            };
          }
        });
        /// extract user data fields maching to scheme fields
        const userData = extractUserDataForSchema(receivedData, prop);
        /// send user data fields maching to scheme fields
        setFormData(userData);
        // Process eligibility and document schema
        getEligibilitySchemaData(receivedData, documentTag, eligibilityTag, {
          ...applicationFormSchema,
          properties: prop,
        });
      }
    };
    // Fetch schema from API
    const getSchemaData = async () => {
      if (id) {
        const result = await getSchema(id);
        // Extract relevant tags from the schema response
        const schemaTag =
          result?.responses?.[0]?.message?.catalog?.providers?.[0]?.items?.[0]?.tags?.find(
            (tag: any) => tag?.descriptor?.code === "applicationForm"
          );

        const documentTag =
          result?.responses?.[0]?.message?.catalog?.providers?.[0]?.items?.[0]?.tags?.find(
            (tag: any) => tag?.descriptor?.code === "required-docs"
          );

        const eligibilityTag =
          result?.responses?.[0]?.message?.catalog?.providers?.[0]?.items?.[0]?.tags?.find(
            (tag: any) => tag?.descriptor?.code === "eligibility"
          );

        // Parse application form fields
        const parsedValues = schemaTag.list.map((item: EligibilityItem) =>
          JSON.parse(item.value)
        );

        // Use window.name for pre-filled data if available
        const useData = window.name ? JSON.parse(window.name) : null;

        getApplicationSchemaData(
          useData,
          parsedValues,
          documentTag,
          eligibilityTag
        );
      }
    };
    getSchemaData();
  }, [id]);

  // Process eligibility and document schema, merge with application schema
  const getEligibilitySchemaData = (
    formData: any,
    documentTag: any,
    eligibilityTag: any,
    applicationFormSchema: any
  ) => {
    // Parse eligibility and document schema arrays
    const eligSchemaStatic = eligibilityTag.list.map((item: EligibilityItem) =>
      JSON.parse(item.value)
    );
    const docSchemaStatic =
      documentTag?.list
        ?.filter(
          (item: any) =>
            item?.descriptor?.code === "mandatory-doc" ||
            item?.descriptor?.code === "optional-doc"
        )
        ?.map((item: any) => JSON.parse(item.value)) || [];

    const docSchemaArr = [...eligSchemaStatic, ...docSchemaStatic];

    // Convert eligibility and document fields to RJSF schema
    const docSchemaData = convertDocumentFields(docSchemaArr, formData?.docs);
    console.log("docSchemaData", docSchemaData);
    setDocSchema(docSchemaData);

    // Merge application and document schemas
    const properties = {
      ...(applicationFormSchema?.properties || {}),
      ...(docSchemaData?.properties || {}),
    };
    console.log("properties", properties);

    // Collect required fields
    const required = Object.keys(properties).filter((key) => {
      const isRequired = properties[key].required;
      if (isRequired !== undefined) {
        delete properties[key].required;
      }
      return isRequired;
    });
    // Build the final schema
    const allSchema = {
      ...applicationFormSchema,
      required,
      properties,
    };
    console.log("allschema", allSchema);
    setFormSchema(allSchema);

    // --- ORDERING AND HEADING FOR DOCUMENT FIELDS ---
    // Get field names for application and document fields
    const appFieldNames = Object.keys(applicationFormSchema?.properties ?? {});
    const docFieldNames = Object.keys(docSchemaData?.properties ?? {});
    // Remove any app fields that are also document fields
    const appOnlyFields = appFieldNames.filter(
      (name) => !docFieldNames.includes(name)
    );
    // The final order: all app-only fields, then all document fields (including overlaps)
    let uiOrder: string[] = [...appOnlyFields];
    if (docFieldNames.length > 0) {
      uiOrder.push("__doc_section_heading__");
      uiOrder = uiOrder.concat(docFieldNames);
    }
    // Build the uiSchema with a heading/divider for document fields
    const uiSchema: any = {
      "ui:order": uiOrder,
    };

    setUiSchema(uiSchema);
    // --- END ORDERING ---
  };

  // Handle form data change
  const handleChange = ({ formData }: any) => {
    setFormData(formData);
  };

  // Handle form submit
  const handleFormSubmit = async () => {
    setDisableSubmit(true);

    const formDataNew: any = { ...formData };

    formDataNew.benefitId = id;
    delete formDataNew.docs;

    // Encode document fields to base64
    Object.keys(docSchema?.properties || {}).forEach((e: any) => {
      if (formDataNew[e]) {
        formDataNew[e] = encodeToBase64(formDataNew?.[e]);
      } else {
        console.log(`${e} is missing from formDataNew`);
      }
    });
    console.log("formDataNew", formDataNew);

    // Submit the form
    const response = await submitForm(formDataNew);
    if (response) {
      setDisableSubmit(true);
      const targetOrigin = import.meta.env.VITE_BENEFICIERY_IFRAME_URL;
      window.parent.postMessage(
        {
          type: "FORM_SUBMIT",
          data: { submit: response, userData: formDataNew },
        },
        targetOrigin
      );
    } else {
      setDisableSubmit(false);
    }
  };

  // Show loading spinner if schema is not ready
  if (!formSchema) {
    return <Loading />;
  }

  // Render the form
  return (
    <Box p={4}>
      <Form
        ref={formRef}
        showErrorList={false}
        focusOnFirstError
        noHtml5Validate
        schema={formSchema as JSONSchema7}
        validator={validator}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleFormSubmit}
        templates={{ ButtonTemplates: { SubmitButton } }}
        extraErrors={extraErrors}
        uiSchema={uiSchema}
      />
      <CommonButton
        label="Submit Form"
        isDisabled={disableSubmit}
        onClick={() => {
          let error: any = {};
          Object.keys(docSchema?.properties || {}).forEach((e: any) => {
            const field = docSchema?.properties[e];
            if (field?.enum && field.enum.length === 0) {
              error[e] = {
                __errors: [`${e} is not have document`],
              };
            }
          });
          if (Object.keys(error).length > 0) {
            setExtraErrors(error);
          } else if (formRef.current?.validateForm()) {
            formRef?.current?.submit();
          }
        }}
      />
    </Box>
  );
};

export default BenefitApplicationForm;

function encodeToBase64(str: string) {
  try {
    return `base64,${btoa(encodeURIComponent(str))}`;
  } catch (error) {
    console.error("Failed to encode string to base64:", error);
    throw new Error("Failed to encode string to base64");
  }
}
