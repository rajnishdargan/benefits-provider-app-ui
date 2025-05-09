import { Box } from "@chakra-ui/react";
import { Theme as ChakraTheme } from "@rjsf/chakra-ui";
import { withTheme } from "@rjsf/core";
import { SubmitButtonProps, getSubmitButtonOptions } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
import CommonButton from "../../../components/common/buttons/SubmitButton";
import Loading from "../../../components/common/Loading";
import { getSchema, submitForm } from "../../../services/benefits";
import {
  convertApplicationFormFields,
  convertDocumentFields,
} from "./ConvertToRJSF";
import { useLocation } from "react-router-dom";
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
const BenefitFormUI: React.FC = () => {
  // const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id"); // this will be your `id` string or null
  const [formSchema, setFormSchema] = useState<any>(null);
  const [formData, setFormData] = useState<object>({});
  const formRef = useRef<any>(null);
  const [docSchema, setDocSchema] = useState<any>(null);
  const [extraErrors, setExtraErrors] = useState<any>(null);
  const [disableSubmit, setDisableSubmit] = useState(false);
  useEffect(() => {
    const getApplicationSchemaData = async (
      receivedData: any,
      benefit: any,
      documentTag: any,
      eligibilityTag: any
    ) => {
      if (benefit) {
        // const applicationSchemaData = benefit?.en?.applicationForm;
        const applicationFormSchema = convertApplicationFormFields(benefit);

        const prop = applicationFormSchema?.properties;

        Object.keys(prop).forEach((item: string) => {
          if (receivedData?.[item] && receivedData?.[item] !== "") {
            prop[item] = {
              ...prop[item],
            };
          }
        });

        setFormData(receivedData);
        getEligibilitySchemaData(receivedData, documentTag, eligibilityTag, {
          ...applicationFormSchema,
          properties: prop,
        });
      }
    };
    const getSchemaData = async () => {
      if (id) {
        const result = await getSchema(id);
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

        const parsedValues = schemaTag.list.map((item: EligibilityItem) =>
          JSON.parse(item.value)
        );

        const useData = window.name ? JSON.parse(window.name) : null;
        // const useData = userInfo;
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

  const getEligibilitySchemaData = (
    formData: any,
    documentTag: any,
    eligibilityTag: any,
    applicationFormSchema: any
  ) => {
    const eligSchemaStatic = eligibilityTag.list.map((item: EligibilityItem) =>
      JSON.parse(item.value)
    );
    const docSchemaStatic =
      documentTag?.list
        ?.filter((item: any) => item?.descriptor?.code === "mandatory-doc")
        ?.map((item: any) => JSON.parse(item.value)) || [];

    const docSchemaArr = [...eligSchemaStatic, ...docSchemaStatic];

    const docSchemaData = convertDocumentFields(docSchemaArr, formData?.docs);
    setDocSchema(docSchemaData);
    const properties = {
      ...(applicationFormSchema?.properties || {}),
      ...(docSchemaData?.properties || {}),
    };
    const required = Object.keys(properties).filter((key) => {
      const isRequired = properties[key].required;
      if (isRequired !== undefined) {
        delete properties[key].required;
      }

      return isRequired;
    });
    const allSchema = {
      ...applicationFormSchema,
      required,
      properties,
    };
    console.log("allschema", allSchema);
    setFormSchema(allSchema);
  };

  const handleChange = ({ formData }: any) => {
    setFormData(formData);
  };
  const handleFormSubmit = async () => {
    setDisableSubmit(true);

    const formDataNew: any = { ...formData };

    formDataNew.benefitId = id;
    delete formDataNew.docs;

    Object.keys(docSchema?.properties || {}).forEach((e: any) => {
      if (formDataNew[e]) {
        formDataNew[e] = encodeToBase64(formDataNew?.[e]);
      } else {
        console.log(`${e} is missing from formDataNew`);
      }
    });
    console.log("formDataNew", formDataNew);

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

  if (!formSchema) {
    return <Loading />;
  }

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

export default BenefitFormUI;

function encodeToBase64(str: string) {
  try {
    return `base64,${btoa(encodeURIComponent(str))}`;
  } catch (error) {
    console.error("Failed to encode string to base64:", error);
    throw new Error("Failed to encode string to base64");
  }
}
