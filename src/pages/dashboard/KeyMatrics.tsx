// src/components/KeyMetrics.tsx
import { HStack, Select, Text, VStack } from "@chakra-ui/react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import CommonCard from "../../components/common/card/CommonCard";
import StatBox from "../../components/common/widget/StatBox"; // Reusing StatBox
import Chart from "react-apexcharts";

interface ApplicationData {
  id: number;
  number: number;
  label: string;
}
interface FinancialData {
  id: number;
  count: number;
  label: string;
  sponsorCount: number;
}
interface PopularBenefitData {
  id: number;
  totalDisbursed: string;
  title: string;
  totalApplications: number;
}

interface KeyMetricsProps {
  applicationData: ApplicationData[];
  financialData: FinancialData[];
  popularBenefit: PopularBenefitData[];
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({
  applicationData,
  financialData,
  popularBenefit,
}) => {
  const { t } = useTranslation();
  const pieChartOptions = {
    labels: financialData ? financialData.map((e) => e.label) : [],
    colors: ["#06164B", "#DDE1FF"],
    dataLabels: {
      enabled: true,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "left",
    },
    plotOptions: { pie: { startAngle: 45 } },
  };
  const pieChartSeries = financialData ? financialData.map((e) => e.count) : [];
  return (
    <VStack spacing="60px" align="stretch">
      <HStack justify="space-between">
        {/* Key Metrics Heading */}
        <Text fontSize="36px" fontWeight="400" color="#06164B">
          {t("DASHBOARD_KEY_METRICS_TITLE")}
        </Text>

        {/* October 2024 Dropdown */}
        <Select
          w="175px"
          placeholder="November 2024"
          borderColor="gray.300"
          bg="white"
          _hover={{ borderColor: "gray.400" }}
          _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
        />
      </HStack>

      <HStack align="stretch" spacing={"60px"}>
        <VStack spacing={"60px"} align="start">
          <Text fontSize="22px" fontWeight="400" color={"#2F3036"}>
            {t("DASHBOARD_APPLICANT_OVERVIEW_TITLE")}
          </Text>
          <VStack spacing={4}>
            {applicationData?.length > 0 ? (
              applicationData?.map((item) => (
                <StatBox
                  key={item.id}
                  number={item.number}
                  label={item.label}
                />
              ))
            ) : (
              <Text>No application data available!</Text>
            )}
          </VStack>
        </VStack>
        <VStack spacing={"60px"} align="start">
          <Text fontSize="22px" fontWeight="400" color={"#2F3036"}>
            {t("DASHBOARD_FINANCIAL_OVERVIEW_TITLE")}
          </Text>
          <VStack bg="#F8F8F8" p="5" align="stretch" flex="1">
            <Text fontSize="16px" fontWeight="400">
              Total Budget:{" "}
              <b>
                ₹{" "}
                {financialData
                  ? financialData.reduce((acc, curr) => acc + curr.count, 0)
                  : 0}
              </b>
            </Text>
            <Text fontSize="16px" fontWeight="400">
              Number of Sponsors:{" "}
              <b>
                {financialData
                  ? financialData.reduce(
                      (acc, curr) => acc + curr.sponsorCount,
                      0
                    )
                  : 0}
              </b>
            </Text>
            <Chart
              options={pieChartOptions as any}
              series={pieChartSeries}
              type="pie"
              width="300"
            />
          </VStack>
        </VStack>
        <VStack spacing={"60px"} align="start">
          {popularBenefit?.length > 0 && (
            <Text fontSize="22px" fontWeight="400" color={"#2F3036"}>
              {t("DASHBOARD_POPULAR_BENEFITS_TITLE")}
            </Text>
          )}

          <VStack spacing={"35px"} align="stretch">
            {popularBenefit?.map((item, index) => (
              <CommonCard key={item?.id || index} {...(item || {})} />
            ))}
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  );
};

export default memo(KeyMetrics);
