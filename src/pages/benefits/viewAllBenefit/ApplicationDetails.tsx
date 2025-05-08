import React, { useState, useEffect } from "react";
import { Text, VStack, Center, Button, HStack } from "@chakra-ui/react";
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
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchMockData = async () => {
      if (!id) return;

      setLoading(true);
      await new Promise((res) => setTimeout(res, 1000)); // simulate delay

      try {
        const mockResponse = {
          status: "Approved",
          applicant: {
            name: "Jane Doe",
            applicationStatus: "Approved",
            applicationId: "123456",
            disabilityStatus: "Yes",
            age: 30,
            gender: "Female",
            class: "12th Grade",
            marks: "90%",
            financialDetails: "Family Income: 5 Lakh per annum",
          },
          document: [
            {
              id: 1,
              type: "Income Certificate",
              title: "Income Proof 2024",
              content: { income: "5 LPA", verified: true },
              status: "Pending",
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

        setApplicantData([
          {
            id: 1,
            name: mockResponse.applicant.name,
            applicationStatus: mockResponse.applicant.applicationStatus,
            applicationId: mockResponse.applicant.applicationId,
            disabilityStatus: mockResponse.applicant.disabilityStatus,
          },
        ]);

        setDocuments(mockResponse.document);
      } catch (err) {
        console.error("Error fetching application data:", err);
      } finally {
        setLoading(false);
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
          props.value === "Submitted"
            ? "yellow.400"
            : props.value === "Rejected"
            ? "red.500"
            : props.value === "Approved"
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

  const handleDocumentStatus = (
    documentId: number,
    status: "Accepted" | "Rejected"
  ) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => (doc.id === documentId ? { ...doc, status } : doc))
    );
  };
  // Handle application status (approve/reject)
  const handleApplicationStatus = (status: string) => {
    console.log(`${status} application`);
    // You can replace the console.log with an API call here
    // Example:
    // axios.post('/api/approve-reject', { status })
    // .then(response => { ... })
    // .catch(error => { ... });
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

              {/* Display Application Info Always */}
              <ApplicationInfo details={applicantData[0]} />
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color="gray.700"
                textAlign="left"
              >
                Supporting Document
              </Text>

              {/* Display Document List */}
              <DocumentList
                documents={documents}
                onUpdateStatus={handleDocumentStatus}
              />
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
              width="200px" // Increased width
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
              bg="#3C5FDD" // Replace with your background color
              color="white"
              width="200px" // Adjusted width
              onClick={() => handleApplicationStatus("Accepted")}
              borderRadius="50px"
              _hover={{
                bg: "#3C5FDD", // Keep the same background on hover (no change)
                transform: "none", // Prevent scaling on hover
                boxShadow: "none", // Remove any box shadow on hover
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
