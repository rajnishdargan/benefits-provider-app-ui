import { Button, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import BenefitsList from "../benefits/List";
import { useNavigate } from "react-router-dom";

interface BenefitSummaryProps {
  tableData: {
    benefit_summary: {
      id: number;
      name: string;
      applicants: number;
      approved: number;
      rejected: number;
      disbursalPending: number;
      deadline: string;
      status: string;
    }[];
  };
}

const BenefitSummary: React.FC<BenefitSummaryProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <VStack spacing="60px" align="stretch" px="28px">
      <Text fontSize="36px" fontWeight="400" color={"#2F3036"} px="170px">
        {t("DASHBOARD_ALL_BENEFITS_SUMMARY_TITLE")}
      </Text>
      <VStack spacing="35px" align="stretch">
        <BenefitsList
          _vstack={{
            px: "28px",
            pt: "10",
            boxShadow: "0px 2px 6px 2px #00000026",
          }}
        />
      </VStack>
      <Button
        colorScheme={"blue"}
        bg="#0037B9"
        variant={"solid"}
        borderRadius={"100px"}
        w="494px"
        alignSelf="center"
        onClick={() => {
          navigate("/benefit_list");
        }}
      >
        {t("BENEFIT_SUMMARY_VIEW_BENEFIT_BUTTON")}
      </Button>
    </VStack>
  );
};

export default BenefitSummary;
