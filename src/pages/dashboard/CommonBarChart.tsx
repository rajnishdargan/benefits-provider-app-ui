import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { HStack, VStack, Text } from "@chakra-ui/react";
import { visualRepresentation } from "../../utils/dataJSON/BenefitSummary";

const CommonBarChart = () => {
  const { t } = useTranslation();

  const data = [
    {
      title: "Disbursal Rate",
      count: "89%",
      type: "bar",
      options: {
        colors: [
          "#06164B",
          "#06164B",
          "#06164B",
          "#06164B",
          "#06164B",
          "#06164B",
        ],
        chart: {
          toolbar: {
            show: false,
          },
        },
        xaxis: {
          categories: visualRepresentation?.applicantsDisbursals?.map(
            (e) => e.label
          ),
          labels: {
            show: false,
          },
          title: {
            text: "Weeks",
          },
        },
        yaxis: {
          labels: {
            show: false,
          },
          title: {
            text: "Percentage",
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: any) {
            return val + "%";
          },
          style: {
            colors: ["#000"],
            fontSize: "10px",
          },
          offsetY: -20,
        },
        plotOptions: {
          bar: {
            dataLabels: {
              position: "top",
            },
          },
        },
      },

      series: [
        {
          name: "Percentage",
          data: visualRepresentation?.applicantsDisbursals?.map((e) => e.count),
        },
      ],
    },
    {
      title: "Breakdown by Gender",
      count:
        visualRepresentation?.gender?.length > 0
          ? visualRepresentation?.gender?.reduce(
              (acc, item) => acc + item.count,
              0
            )
          : 0,
      type: "pie",
      footerText: "Gender",
      options: {
        labels:
          visualRepresentation?.gender?.length > 0
            ? visualRepresentation?.gender?.map((e) => e.label)
            : [],
        colors: ["#867fa5", "#06164B", "#DDE1FF"],
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: false,
        },
        states: {
          hover: {
            filter: {
              type: "none",
            },
          },
        },
      },
      series:
        visualRepresentation?.gender?.length > 0
          ? visualRepresentation?.gender?.map((e) => e.count)
          : [],
    },
    {
      title: "Breakdown by Caste",
      count:
        visualRepresentation?.caste?.length > 0
          ? visualRepresentation?.caste?.reduce(
              (acc, item) => acc + item.count,
              0
            )
          : 0,
      footerText: "Caste",
      type: "pie",
      options: {
        labels:
          visualRepresentation?.caste?.length > 0
            ? visualRepresentation?.caste?.map((e) => e.label)
            : [],
        colors: ["#867fa5", "#06164B", "#DDE1FF"],
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: false,
        },
        states: {
          hover: {
            filter: {
              type: "none",
            },
          },
        },
      },
      series:
        visualRepresentation?.caste?.length > 0
          ? visualRepresentation?.caste?.map((e) => e.count)
          : [],
    },
    {
      title: "Breakdown by Level of Study",
      count:
        visualRepresentation?.standard?.length > 0
          ? visualRepresentation?.standard?.reduce(
              (acc, item) => acc + item.count,
              0
            )
          : 0,
      footerText: "Standard",
      type: "pie",
      options: {
        labels:
          visualRepresentation?.standard?.length > 0
            ? visualRepresentation?.standard?.map((e) => e.label)
            : [],
        colors: ["#867fa5", "#06164B", "#DDE1FF"],
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: false,
        },
        states: {
          hover: {
            filter: {
              type: "none",
            },
          },
        },
      },
      series:
        visualRepresentation?.standard?.length > 0
          ? visualRepresentation?.standard?.map((e) => e.count)
          : [],
    },
    {
      title: "Day Scholar / Hostler Ratio",
      count:
        visualRepresentation?.ratio?.length > 0
          ? visualRepresentation?.ratio.reduce(
              (acc, item) => acc + item.count,
              0
            )
          : 0,
      footerText: "Ratio",
      type: "pie",
      options: {
        states: {
          hover: {
            filter: {
              type: "none",
            },
          },
        },
        labels:
          visualRepresentation?.ratio?.length > 0
            ? visualRepresentation?.ratio?.map((e) => e.label)
            : [],
        colors: ["#867fa5", "#06164B", "#DDE1FF"],
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: false,
        },
      },
      series:
        visualRepresentation?.ratio?.length > 0
          ? visualRepresentation?.ratio?.map((e) => e.count)
          : [],
    },
  ];

  return (
    <VStack spacing="60px" align="stretch" px="170px" pb="60px">
      <HStack justify="space-between">
        <Text fontSize="36px" fontWeight="400" color="#06164B">
          {t("DASHBOARD_VISUAL_REPRESENTATION_TITLE")}
        </Text>

        {/* <Select
          w="175px"
          placeholder="November 2024"
          borderColor="gray.300"
          bg="white"
          _hover={{ borderColor: "gray.400" }}
          _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
        /> */}
      </HStack>
      <HStack align="stretch" spacing={"35px"}>
        {data?.length > 0 &&
          data?.map((chartItem) => (
            <VStack p="4" align="stretch" key={chartItem?.title}>
              <Text fontSize="22px" fontWeight="400">
                {chartItem?.title}
              </Text>
              <Text fontSize="16px" fontWeight="400">
                {chartItem?.count}
              </Text>
              <HStack minH="313px" align="stretch">
                {(chartItem && chartItem?.type === "bar") ||
                chartItem?.type === "pie" ? (
                  <Chart
                    options={chartItem?.options}
                    series={chartItem?.series}
                    type={chartItem?.type}
                    height="300px"
                    width="191px"
                  />
                ) : null}
              </HStack>
              {chartItem?.footerText && (
                <Text fontSize="16px" fontWeight="400">
                  {chartItem?.footerText}
                </Text>
              )}
            </VStack>
          ))}
      </HStack>
    </VStack>
  );
};

export default CommonBarChart;
