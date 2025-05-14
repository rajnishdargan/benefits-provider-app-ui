import React, { useState, useEffect } from "react";
import { Text, VStack, Center, Button, HStack, Box } from "@chakra-ui/react";
import Layout from "../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import Table from "../../../components/common/table/Table";
// import { ICellTextProps } from "ka-table";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import ApplicationInfo from "../../../components/ApplicationInfo";
import DocumentList from "../../../components/DocumentList";
import { getApplicationDetails } from "../../../services/applicationService";

// Types

interface ApplicantData {
  id: number;
  name: string;
  applicationStatus: string;
  studentId: string;
  disabilityStatus: string;
}

interface Document {
  id: number;
  type: string;
  title: string;
  content: Record<string, any>;
  status: string;
  fileContent: string;
}

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicantData, setApplicantData] = useState<ApplicantData[]>([]);
  const [loading, setLoading] = useState(true); // Default to true to show loading initially
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applicant, setApplicant] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!id) return;

      try {
        setLoading(true); // Set loading to true before fetching data
        const applicationData = await getApplicationDetails(id);

        // Extract applicant details from the nested structure
        const applicantDetails = applicationData.applicationData;

        setApplicant(applicantDetails);

        setApplicantData([
          {
            id: 1,
            name: `${applicantDetails.firstName} ${applicantDetails.middleName} ${applicantDetails.lastName}`,
            applicationStatus: applicationData.status,
            studentId: applicantDetails.studentId,
            disabilityStatus: applicantDetails.disabilityType ? "Yes" : "No",
          },
        ]);

        // Map documents from applicationFiles
        const documents = applicationData.applicationFiles.map((file: any) => ({
          id: file.id,
          type: "Document", // You can adjust this if there's a specific type
          title: file.filePath.split("/").pop(), // Extract file name from path
          content: file,
          fileContent: file.fileContent,
          status: file?.verificationStatus?.status,
        }));

        setDocuments(documents);
      } catch (err) {
        console.error("Error fetching application data:", err);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching data
      }
    };

    fetchApplicationData();
  }, [id]);

  const applicantColumns = [
    { key: "name", title: "Name", dataType: "string" },
    {
      key: "applicationStatus",
      title: "Application Status",
      dataType: "string",
    },
    { key: "studentId", title: "Student ID", dataType: "string" },
    { key: "disabilityStatus", title: "Disability Status", dataType: "string" },
  ];

  const customCellText = (props: any) => {
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
                    content: (props: any) => customCellText(props),
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
                mb={0} // Removed margin-bottom to eliminate the gap
              >
                Applicant Info
              </Text>

              {/* Two Column Layout for ApplicationInfo and DocumentList */}
              <HStack
                align="flex-start"
                spacing={8}
                wrap="wrap"
                justify="space-between"
                width="full"
              >
                {/* Applicant Info - Full Width */}
                {applicant && (
                  <Box flex="1 1 100%" mb={0}> {/* Removed margin-bottom to eliminate the gap */}
                    <ApplicationInfo details={applicant} />
                  </Box>
                )}

                {/* Supporting Documents - Below Applicant Info */}
                <Box flex="1 1 100%">
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="gray.700"
                    textAlign="left"
                    mt={8}
                    mb={4} // Added margin-bottom for spacing
                  >
                    Supporting Documents
                  </Text>
                  <Box flex="1 1 100%">
                    <DocumentList documents={documents} />
                  </Box>
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
