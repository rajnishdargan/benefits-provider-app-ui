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
  const [formData, setFormData] = useState<object>({});
  const formRef = useRef<any>(null);
  const [docSchema, setDocSchema] = useState<any>(null);
  const [extraErrors, setExtraErrors] = useState<any>(null);

  useEffect(() => {
    const getApplicationSchemaData = async (
      receivedData: any,
      benefit: any
    ) => {
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
              // readOnly: true,
            };
          }
        });
        setFormData(receivedData);
        getEligibilitySchemaData(receivedData, benefit, {
          ...applicationFormSchema,
          properties: prop,
        });
      }
    };
    const getSchemaData = async () => {
      if (id) {
        const result = await getSchema(id);
        const targetTag =
          result?.responses?.[0]?.message?.order?.items?.[0]?.tags?.find(
            (tag: any) => tag?.descriptor?.code === "benefit_schema"
          );
        const resultItem = targetTag?.list?.[0]?.value;
        const cleanedSchema = resultItem?.replace(/\\/g, "");
        const benefit = JSON.parse(cleanedSchema) || {};
        const useData = window.name ? JSON.parse(window.name) : null;
        getApplicationSchemaData(useData, benefit);
      }
    };
    getSchemaData();
  }, [id]);

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
    const formDataNew: any = { ...formData };
    Object.keys(docSchema?.properties || {}).forEach((e: any) => {
      if (formDataNew[e]) {
        formDataNew[e] = encodeToBase64(formDataNew?.[e]);
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
  );
};

export default BenefitFormUI;

function encodeToBase64(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}
