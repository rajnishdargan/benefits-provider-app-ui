import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  VStack,
} from "@chakra-ui/react";
import { Theme as ChakraUITheme } from "@rjsf/chakra-ui";
import { withTheme } from "@rjsf/core";
import { JSONSchema7 } from "json-schema";
import React, { useState } from "react";
import validator from "@rjsf/validator-ajv6";
const Form = withTheme(ChakraUITheme);
interface UiSchema {
  [key: string]: any;
}
const stepsData = [
  {
    step: 1,
    title: "General Information",
    description: "Fill out the general information form.",
  },
  {
    step: 2,
    title: "Eligibility Criteria",
    description: "Provide the eligibility criteria details.",
  },
  {
    step: 3,
    title: "Financial Information",
    description: "Submit your financial details.",
  },
  {
    step: 4,
    title: "Review & Submit",
    description: "Review all information and submit the form.",
  },
];

interface StepItem {
  step: number;
  title: string;
  schema: JSONSchema7;
  uiSchema: UiSchema;
  isOpen: boolean;
}

interface MultiStepFormProps {
  items: StepItem[];
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onSubmit: () => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  items,
  formData,
  onChange,
  onSubmit,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const isLastStep = currentStep === items.length - 1;
  const handleSaveAndNext = () => {
    setCompletedSteps((prev) => [...prev, items[currentStep].step]);

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit();
    }
  };
  return (
    <Box p={5} mx="auto">
      <Accordion
        allowToggle
        index={currentStep >= 0 ? [currentStep] : undefined}
      >
        {items?.map((stepItem, index) => (
          <React.Fragment key={stepItem?.step}>
            <AccordionItem border="none">
              <HStack spacing={4} align="flex-start">
                <VStack
                  spacing={0}
                  align="center"
                  position="relative"
                  minH="60px"
                >
                  <Icon
                    as={
                      completedSteps.includes(stepItem?.step)
                        ? CheckCircleIcon
                        : WarningIcon
                    }
                    color={
                      completedSteps.includes(stepItem.step)
                        ? "#0B7B69"
                        : "#EDA145"
                    }
                    boxSize={5}
                    position="relative"
                    zIndex={1}
                    onClick={() => setCurrentStep(index)}
                    cursor="pointer"
                  />
                  {index < stepsData.length - 1 && (
                    <Divider
                      orientation="vertical"
                      borderWidth="2px"
                      borderStyle="dotted"
                      height="40px"
                      mt={2}
                    />
                  )}
                </VStack>

                <Box flex="1">
                  <AccordionButton
                    _focus={{ boxShadow: "none" }}
                    _hover={{ bg: "none" }}
                    _expanded={{ bg: "none" }}
                    px={0}
                  >
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      {stepItem.title}
                    </Box>
                  </AccordionButton>

                  <AccordionPanel pb={4}>
                    {stepItem?.schema && (
                      <Form
                        schema={stepItem?.schema}
                        formData={formData}
                        onChange={onChange}
                        uiSchema={stepItem?.uiSchema}
                        validator={validator}
                      />
                    )}
                    <HStack spacing={4} justifyContent="flex-end" mt={4}>
                      {!isLastStep && (
                        <Button onClick={handleSaveAndNext} colorScheme="blue">
                          Save & Next
                        </Button>
                      )}
                      {isLastStep && (
                        <Button onClick={onSubmit} colorScheme="green">
                          Submit
                        </Button>
                      )}
                    </HStack>
                  </AccordionPanel>
                </Box>
              </HStack>
            </AccordionItem>
          </React.Fragment>
        ))}
      </Accordion>
    </Box>
  );
};

export default MultiStepForm;
