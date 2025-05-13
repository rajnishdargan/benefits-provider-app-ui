import React, { useState, useEffect } from "react";
import { Text, VStack, Center, Button, HStack, Box } from "@chakra-ui/react";
import Layout from "../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import Table from "../../../components/common/table/Table";
import { ICellTextProps } from "ka-table";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import ApplicationInfo from "../../../components/ApplicationInfo";
import DocumentList from "../../../components/DocumentList";

// Types

interface ApplicantData {
  id: number;
  name: string;
  applicationStatus: string;
  applicationId: string;
  disabilityStatus: string;
}

interface Document {
  id: number;
  type: string;
  title: string;
  content: Record<string, any>;
  status: string;
}

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicantData, setApplicantData] = useState<ApplicantData[]>([]);
  const [loading, setLoading] = useState(true); // Default to true to show loading initially
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applicant, setApplicant] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchMockData = async () => {
      if (!id) return;

      try {
        setLoading(true); // Set loading to true before fetching data
        const mockResponse = {
          status: "Approved",
          applicant: {
            firstName: "Amit",
            middleName: "Kumar",
            lastName: "Sharma",
            nspOtr: "NSP123456789",
            phoneNumber: "9876543210",
            studentId: "STU2024A",
            aadhaar: "123412341234",
            udid: "UDID987654321",
            gender: "male",
            dob: "2010-08-15",
            annualIncome: "200000",
            class: "9",
            currentSchoolName: "Springfield Public School",
            previousYearMarks: "85",
            disabilityType: "blindness",
            disabilityRange: "45",
            studentType: "dayScholar",
            tutionAdminFeePaid: "5000",
            miscFeePaid: "1000",
            currentlyEnrolledInOtherGovtScheme: "no",
            haveTwoOfYourDifferentlyAbledSiblingsAvailedThisScholarship: "no",
            bankName: "State Bank of India",
            bankIfscCode: "SBIN0001234",
            branchCode: "001",
            bankAddress: "123 Main Street, New Delhi",
            bankAccountNumber: "123456789012",
            bankAccountHolderName: "Amit Sharma",
          },
          document: [
            {
              id: 1,
              type: "Income Certificate",
              title: "Income Proof 2024",
              content: { income: "5 LPA", verified: true },
              status: "Accepted",
            },
            {
              id: 2,
              type: "Caste Certificate",
              title: "SC Caste Certificate",
              content: { caste: "SC", issuedBy: "Govt", year: 2022 },
              status: "Pending",
            },
          ],
        };

        setApplicant(mockResponse.applicant);

        setApplicantData([
          {
            id: 1,
            name: `${mockResponse.applicant.firstName} ${mockResponse.applicant.middleName} ${mockResponse.applicant.lastName}`,
            applicationStatus: mockResponse.status,
            applicationId: mockResponse.applicant.studentId,
            disabilityStatus: mockResponse.applicant.disabilityType
              ? "Yes"
              : "No",
          },
        ]);

        setDocuments(mockResponse.document);
      } catch (err) {
        console.error("Error fetching application data:", err);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching data
      }
    };

    fetchMockData();
  }, [id]);

  const applicantColumns = [
    { key: "name", title: "Name", dataType: "string" },
    {
      key: "applicationStatus",
      title: "Application Status",
      dataType: "string",
    },
    { key: "applicationId", title: "Application ID", dataType: "string" },
    { key: "disabilityStatus", title: "Disability Status", dataType: "string" },
  ];

  const customCellText = (props: ICellTextProps) => {
    switch (props.column.key) {
      case "applicationStatus": {
        let statusColor =
          props.value === "Pending"
            ? "yellow.400"
            : props.value === "Rejected"
            ? "red.500"
            : props.value === "Accepted"
            ? "green.500"
            : "gray.500";

        return (
          <Text color={statusColor} fontWeight="bold">
            {props.value}
          </Text>
        );
      }

      case "disabilityStatus":
        return props.value === "Yes" ? (
          <CheckIcon color="green.500" />
        ) : (
          <CloseIcon color="red.500" />
        );

      default:
        return props.value || "N/A";
    }
  };

  const handleApplicationStatus = (status: string) => {
    console.log(`${status} application`);
    // Make API call if needed
  };

  if (loading) return <Loading />;

  return (
    <Layout
      _titleBar={{ title: `Application Detail : ${id}` }}
      showMenu={true}
      showSearchBar={true}
      showLanguage={false}
    >
      <Center p="20px">
        <VStack spacing="50px" align="stretch" width="full" maxWidth="1200px">
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="gray.700"
            textAlign="left"
          >
            Application Details
          </Text>

          {applicantData.length > 0 ? (
            <>
              <Table
                columns={applicantColumns}
                data={applicantData}
                rowKeyField="id"
                childComponents={{
                  cellText: {
                    content: (props: ICellTextProps) => customCellText(props),
                  },
                }}
                rowStyle={{ textAlign: "center" }}
                columnStyle={{ textAlign: "center" }}
              />

              <Text
                fontSize="2xl"
                fontWeight="bold"
                color="gray.700"
                textAlign="left"
              >
                Applicant Info & Supporting Documents
              </Text>

              {/* Two Column Layout for ApplicationInfo and DocumentList */}
              <HStack
                align="flex-start"
                spacing={8}
                wrap="wrap"
                justify="space-between"
                width="full"
              >
                {applicant && (
                  <Box flex={{ base: "1 1 100%", md: "1 1 48%" }}>
                    <ApplicationInfo details={applicant} />
                  </Box>
                )}

                <Box flex={{ base: "1 1 100%", md: "1 1 48%" }}>
                  <DocumentList documents={documents} />
                </Box>
              </HStack>
            </>
          ) : (
            <Text fontSize="lg" textAlign="center" color="gray.500">
              No applicant data available
            </Text>
          )}

          {/* Accept and Reject Buttons */}
          <HStack justify="center" spacing={4}>
            <Button
              colorScheme="red"
              variant="outline"
              leftIcon={<CloseIcon color="red.500" />}
              color="red.500"
              borderColor="red.500"
              borderRadius="50px"
              width="200px"
              _hover={{
                backgroundColor: "transparent",
                borderColor: "red.600",
              }}
              onClick={() => handleApplicationStatus("Rejected")}
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "0.1px",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              Reject
            </Button>

            <Button
              bg="#3C5FDD"
              color="white"
              width="200px"
              onClick={() => handleApplicationStatus("Accepted")}
              borderRadius="50px"
              _hover={{
                bg: "#3C5FDD",
                transform: "none",
                boxShadow: "none",
              }}
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "0.1px",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              Accept
            </Button>
          </HStack>
        </VStack>
      </Center>
    </Layout>
  );
};

export default ApplicationDetails;
