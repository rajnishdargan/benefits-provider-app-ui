import { Text } from "@chakra-ui/react";
import Chart from "react-apexcharts";

interface ChartProps {
  options: {
    labels: string[];
  };
  series: number[];
}
const ChartWithErrorBoundary: React.FC<ChartProps> = ({ options, series }) => {
  if (!series?.length || !options?.labels?.length) {
    return <Text>No chart data available</Text>;
  }

  try {
    return <Chart options={options} series={series} type="pie" width="300" />;
  } catch (error) {
    console.error("Chart rendering error:", error);
    return <Text>Unable to display chart</Text>;
  }
};

export default ChartWithErrorBoundary;
