import { VStack } from "@chakra-ui/react";
import CommonBarChart from "./CommonBarChart";
import Layout from "../../components/layout/Layout";
import BenefitSummary from "./BenefitSummary";
import KeyMatrics from "./KeyMatrics";
import React from "react";
import {
  applicationOverviewDigit,
  benefitSummaryDigit,
  financialOverviewDigit,
  popularBenefitDigit,
} from "../../services/dashboard";
import Loading from "../../components/common/Loading";
import AlertMessage from "../../components/common/modal/AlertMessage";
function Dashboard() {
  const [applicationData, setApplicationData] = React.useState<any>(null);
  const [financialData, setFinancialData] = React.useState<any>(null);
  const [popularData, setPopularData] = React.useState<any>(null);
  const [benefitSummaryData, setBenefitSummaryData] = React.useState<any>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const userId = localStorage.getItem("user"); // Retrieve the user data from localStorage
    const fetchData = async () => {
      try {
        if (userId) {
          setIsLoading(true);
          const digitApplicantResponse = await applicationOverviewDigit();
          const digitFinancialResponse = await financialOverviewDigit();
          const digitPopularResponse = await popularBenefitDigit();
          const benefitSummaryResponse = await benefitSummaryDigit();

          if (digitApplicantResponse) {
            setApplicationData(digitApplicantResponse);
          }
          if (digitFinancialResponse) {
            setFinancialData(digitFinancialResponse);
          }
          if (digitPopularResponse) {
            setPopularData(digitPopularResponse);
          }
          if (benefitSummaryResponse) {
            setBenefitSummaryData({ benefit_summary: benefitSummaryResponse });
          }
          setIsLoading(false);
        } else {
          setIsLoading(false);
          // setMessage("No user data found!");
          // setShowAlert(true);
        }
      } catch (err) {
        console.log(err);
        setIsLoading(false);
        setMessage(err as string);
        setShowAlert(true);
      }
    };

    fetchData();
  }, []);
  const handleCloseAlertModal = () => {
    setShowAlert(false);
  };

  return (
    <Layout
      _titleBar={{ title: "Welcome back!" }}
      showMenu={true}
      showSearchBar={true}
      showLanguage={false}
    >
      {isLoading && <Loading />}
      <VStack gap="60px" py="60px" overflowX={"hidden"}>
        <KeyMatrics
          applicationData={applicationData}
          financialData={financialData}
          popularBenefit={popularData}
        />
        <BenefitSummary tableData={benefitSummaryData} />
        <CommonBarChart />
      </VStack>
      {showAlert && (
        <AlertMessage
          message={message}
          show={showAlert}
          close={handleCloseAlertModal}
        />
      )}
    </Layout>
  );
}

export default Dashboard;
