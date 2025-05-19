import { useState, useEffect } from "react";
import {
  Text,
  VStack,
  Center,
  Button,
  HStack,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import Layout from "../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import Table from "../../../components/common/table/Table";
import ApplicationInfo from "../../../components/ApplicationInfo";
import DocumentList from "../../../components/DocumentList";
import {
  getApplicationDetails,
  verifyAllDocuments,
} from "../../../services/applicationService";
import { updateApplicationStatus } from "../../../services/benefits";
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
  verificationErrors: string[];
  fileContent: string;
}

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicantData, setApplicantData] = useState<ApplicantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applicant, setApplicant] = useState<Record<string, any> | null>(null);
  const [benefitName, setBenefitName] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [showActionButtons, setShowActionButtons] = useState<boolean>(true); // To hide action buttons after
  const [isVerifyButtonVisible, setIsVerifyButtonVisible] = useState(true); // State to control button visibility
  const [isVerifyLoading, setIsVerifyLoading] = useState(false); // Add a state for button loading
  //confirmation
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedStatus, setSelectedStatus] = useState<
    "approved" | "rejected"
  >();

  const openConfirmationModal = (status: "approved" | "rejected") => {
    setSelectedStatus(status);
    onOpen();
  };

  const confirmStatusChange = async () => {
    if (!selectedStatus) {
      toast({
        title: "Missing status ",
        description: "Please select a status before submitting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!id) {
      toast({
        title: "Invalid action",
        description: "Application ID is missing.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      setLoading(true);

      const response = await updateApplicationStatus(
        id,
        selectedStatus,
        comment
      );

      if (response.status === "success") {
        toast({
          title: "Success",
          description: "Status updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchApplicationData();
        setComment("");
        onClose(); // or navigate away
      } else {
        toast({
          title: "Update failed",
          description: "Could not update status. Try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: `${error}` || "Something went wrong.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAll = async () => {
    try {
      if (!id) {
        toast({
          title: "Invalid action",
          description: "Application ID is missing.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsVerifyLoading(true); // Show loader
      const response = await verifyAllDocuments(id);
      console.log("Response from verifyAllDocuments:", response);

      if (response?.response) {
        setIsVerifyButtonVisible(false);
        toast({
          title: "Verification Completed",
          description: "All documents verification have been completed.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchApplicationData();
      }
    } catch (error) {
      console.error("Error verifying documents:", error);
      toast({
        title: "Verification Failed",
        description: "An error occurred while verifying the documents.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsVerifyLoading(false); // Hide loader
    }
  };

  const fetchApplicationData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const applicationData = await getApplicationDetails(id);
      if (applicationData?.benefitDetails?.title) {
        setBenefitName(applicationData?.benefitDetails?.title);
      }
      const applicantDetails = applicationData.applicationData;

      setApplicant(applicantDetails);
      if (applicationData.status !== "pending") {
        setShowActionButtons(false); // Hide action buttons if status is not pending
      }
      setApplicantData([
        {
          id: 1,
          name: `${applicantDetails.firstName || ""} ${
            applicantDetails.middleName ? applicantDetails.middleName + " " : ""
          }${applicantDetails.lastName || ""}`.trim(),
          applicationStatus: applicationData.status,
          studentId: applicantDetails.studentId,
          disabilityStatus: applicantDetails.disabilityType ? "Yes" : "No",
        },
      ]);

      const documents = applicationData.applicationFiles.map((file: any) => ({
        id: file.id,
        type: "Document",
        title: file.filePath.split("/").pop(),
        content: file,
        fileContent: file.fileContent,
        status: file?.verificationStatus?.status,
        verificationErrors: file?.verificationStatus?.verificationErrors || [
          "Some error occurred in verification",
        ],
      }));

      setDocuments(documents);
      if (documents.length > 0 && documents[0].status) {
        setIsVerifyButtonVisible(false);
      }
    } catch (err) {
      console.error("Error fetching application data:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
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
          props.value === "pending"
            ? "yellow.400"
            : props.value === "rejected"
            ? "red.500"
            : props.value === "approved"
            ? "green.500"
            : "gray.500";

        return (
          <Text
            color={statusColor}
            fontWeight="bold"
            textTransform="capitalize"
          >
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
        return props.value || "-";
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout
      _titleBar={{ title: `Application Detail For : ${benefitName}` }}
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
                mb={0}
              >
                Applicant Info
              </Text>

              <HStack
                align="flex-start"
                spacing={8}
                wrap="wrap"
                justify="space-between"
                width="full"
              >
                {applicant && (
                  <Box flex="1 1 100%" mb={0}>
                    <ApplicationInfo details={applicant} />
                  </Box>
                )}

                <Box flex="1 1 100%">
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="gray.700"
                    textAlign="left"
                    mt={8}
                    mb={4}
                  >
                    Supporting Documents
                  </Text>
                  <Box flex="1 1 100%">
                    <DocumentList
                      documents={documents.map((doc) => ({
                        ...doc,
                        verificationErrors: doc?.verificationErrors || [],
                      }))}
                    />
                  </Box>
                </Box>
              </HStack>
            </>
          ) : (
            <Text fontSize="lg" textAlign="center" color="gray.500">
              No applicant data available
            </Text>
          )}

          {/* Add the Verify All Documents button */}
          {showActionButtons && isVerifyButtonVisible && (
            <HStack justify="center" spacing={4}>
              <Button
                bg="teal.500"
                color="white"
                width="200px"
                onClick={handleVerifyAll}
                borderRadius="50px"
                isLoading={isVerifyLoading} // Add this to show the spinner
                loadingText="Verifying..." // Optional: Text to show while loading
                _hover={{
                  bg: "teal.600",
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
                Verify All Documents
              </Button>
            </HStack>
          )}

          {/* Display the status message after confirmation */}
          {!showActionButtons && (
            <Text
              fontSize="s"
              fontWeight="bold"
              color={
                applicantData[0]?.applicationStatus === "pending"
                  ? "orange.500"
                  : applicantData[0]?.applicationStatus === "rejected"
                  ? "red.500"
                  : applicantData[0]?.applicationStatus === "approved"
                  ? "green.500"
                  : "gray.500" // Default color
              }
              textAlign="center"
            >
              Application is {applicantData[0]?.applicationStatus}!
            </Text>
          )}

          {/* Show action buttons only if no status has been set */}
          {showActionButtons && (
            <HStack justify="center" spacing={4}>
              <Button
                colorScheme="red"
                variant="outline"
                leftIcon={<CloseIcon color="red.500" />}
                color="red.500"
                borderColor="red.500"
                borderRadius="50px"
                width="200px"
                onClick={() => openConfirmationModal("rejected")}
              >
                Reject
              </Button>

              <Button
                bg="#3C5FDD"
                color="white"
                width="200px"
                onClick={() => openConfirmationModal("approved")}
                borderRadius="50px"
                _hover={{
                  bg: "#3C5FDD",
                  transform: "none",
                  boxShadow: "none",
                }}
              >
                Approve
              </Button>
            </HStack>
          )}
        </VStack>
      </Center>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            You want to procees with changing status for this application?
            <Text mt={3}>Please provide a comment:</Text>
            <Textarea
              placeholder="Enter Comment for Status Change: "
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              mt={3}
              size="sm"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              No
            </Button>
            <Button colorScheme="blue" onClick={confirmStatusChange}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default ApplicationDetails;
