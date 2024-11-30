import { Box, ChakraProvider } from "@chakra-ui/react";
import { Theme as ChakraTheme } from "@rjsf/chakra-ui";
import { withTheme } from "@rjsf/core";
import { SubmitButtonProps, getSubmitButtonOptions } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CommonButton from "../../../components/common/buttons/SubmitButton";
import { getSchema, submitForm } from "../../../services/benefits";
import {
  convertApplicationFormFields,
  convertDocumentFields,
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

const BenefitFormUI: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formSchema, setFormSchema] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const formRef = useRef<any>(null);
  const [docSchema, setDocSchema] = useState<any>(null);
  const [extraErrors, setExtraErrors] = useState<any>(null);
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      window.postMessage({ type: "FORM_SUBMIT", data: formData }, "*");

      if (event.origin !== `${import.meta.env.VITE_BENEFICIERY_IFRAME_URL}`) {
        return;
      }
      const prefillData = event.data;
      const receivedData = prefillData;
      if (id) {
        const result = await getSchema(id);

        const targetTag =
          result?.responses?.[0]?.message?.order?.items?.[0]?.tags?.find(
            (tag: any) => tag?.descriptor?.code === "benefit_schema"
          );
        const resultItem = targetTag?.list?.[0]?.value;
        const cleanedSchema = resultItem?.replace(/\\/g, "");
        const benefit = JSON.parse(cleanedSchema) || {};

        getApplicationSchemaData(receivedData, benefit);
      }
      if (prefillData) {
        setFormData(receivedData);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [id]);

  const getApplicationSchemaData = async (receivedData: any, benefit: any) => {
    if (benefit) {
      const applicationSchemaData = benefit?.en?.applicationForm;
      const applicationFormSchema = convertApplicationFormFields(
        applicationSchemaData
      );

      const prop = applicationFormSchema?.properties;
      Object.keys(prop).forEach((item: string) => {
        if (receivedData?.[item] && receivedData?.[item] !== "") {
          prop[item] = {
            ...prop[item],
            readOnly: true,
          };
        }
      });
      getEligibilitySchemaData(receivedData, benefit, {
        ...applicationFormSchema,
        properties: prop,
      });
    }
  };
  const getEligibilitySchemaData = (
    formData: any,
    benefit: any,
    applicationFormSchema: any
  ) => {
    const eligSchemaStatic = benefit.en.eligibility;
    const docSchemaStatic = benefit.en.documents;

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

    setFormSchema(allSchema);
  };

  const handleChange = ({ formData }: any) => {
    setFormData(formData);
  };
  const handleFormSubmit = async () => {
    let formDataNew = { ...formData };
    Object.keys(docSchema?.properties || {}).forEach((e: any) => {
      if (formDataNew[e]) {
        formDataNew[e] = btoa(formDataNew[e]);
      } else {
        console.log(`${e} is missing from formDataNew`);
      }
    });

    // API call for submit id and sent it to the post message
    const response = await submitForm(formDataNew);
    if (response) {
      window.parent.postMessage(
        {
          type: "FORM_SUBMIT",
          data: { submit: response, userData: formDataNew },
        },
        "*"
      );
    }
  };

  if (!formSchema) {
    return <Box>Loading...</Box>;
  }

  return (
    <ChakraProvider>
      <Box maxW="600px" mx="auto" p="4">
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
          // transformErrors={(errors) => transformErrors(errors, formSchema, t)}
          extraErrors={extraErrors}
        />
        <CommonButton
          label="Submit Form"
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
    </ChakraProvider>
  );
};

export default BenefitFormUI;
