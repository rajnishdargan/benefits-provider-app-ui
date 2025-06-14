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
import { CheckIcon, CloseIcon, ArrowBackIcon } from "@chakra-ui/icons";
import Layout from "../../../components/layout/Layout";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import Table from "../../../components/common/table/Table";
import ApplicationInfo from "../../../components/ApplicationInfo";
import DocumentList from "../../../components/DocumentList";
import {
  getApplicationDetails,
  verifyAllDocuments,
  verifySelectedDocuments,
} from "../../../services/applicationService";
import { updateApplicationStatus, getBenefitById } from "../../../services/benefits";
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
  verificationErrors: { raw: string; error: string }[];
  fileContent: string;
}

const ApplicationDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [applicantData, setApplicantData] = useState<ApplicantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applicant, setApplicant] = useState<Record<string, any> | null>(null);
  const [benefitName, setBenefitName] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [showActionButtons, setShowActionButtons] = useState<boolean>(true);
  const [isVerifyButtonVisible, setIsVerifyButtonVisible] = useState(true);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isReverifyButtonVisible, setIsReverifyButtonVisible] = useState(false);
  const [isReverifyLoading, setIsReverifyLoading] = useState(false);
  const [amountDetail, setAmountDetail] = useState<Record<string, any> | null>(null);
  const [applicationForm, setApplicationForm] = useState<any>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedStatus, setSelectedStatus] = useState<"approved" | "rejected">();

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
        onClose();
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
      console.error("Error updating application status:", error);
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

  const showVerificationToast = (
    toast: ReturnType<typeof useToast>,
    status: string,
    context: "verify" | "reverify"
  ) => {
    if (status === "partially_verified") {
      toast({
        title: "Partially Verified",
        description:
          context === "verify"
            ? "Some documents could not be verified."
            : "Some failed documents could not be re-verified.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } else if (status === "unverified") {
      toast({
        title: "Unverified",
        description:
          context === "verify"
            ? "All documents are unverified."
            : "Document(s) still unverified.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else if (status === "verified") {
      toast({
        title: "Verified",
        description:
          context === "verify"
            ? "All documents are verified."
            : "All failed documents are now verified.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: context === "verify" ? "Verification Completed" : "Re-verification Completed",
        description:
          context === "verify"
            ? "All documents verification have been completed."
            : "Failed documents have been re-verified.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
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

      setIsVerifyLoading(true);
      const response = await verifyAllDocuments(id);

      if (response?.response) {
        setIsVerifyButtonVisible(false);
        showVerificationToast(toast, response.response.status, "verify");
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
      setIsVerifyLoading(false);
    }
  };

  const handleReverifyFailed = async () => {
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
      setIsReverifyLoading(true);

      const failedDocIds = documents
        .filter((doc) => doc.status === "Unverified")
        .map((doc) => doc.id);

      if (failedDocIds.length === 0) {
        toast({
          title: "No Failed Documents",
          description: "There are no failed documents to re-verify.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        setIsReverifyLoading(false);
        return;
      }

      const response = await verifySelectedDocuments(id, failedDocIds);

      if (response?.response) {
        setIsReverifyButtonVisible(false);
        showVerificationToast(toast, response.response.status, "reverify");
        fetchApplicationData();
      }
    } catch (error) {
      console.log('Error occured during re-verification', error);
      toast({
        title: "Re-verification Failed",
        description: "An error occurred while re-verifying the documents.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsReverifyLoading(false);
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
      if (applicationData?.calculatedAmount) {
        const { ["totalPayout"]: totalPayout, ...rest } =
          applicationData.calculatedAmount;

        const reorderedAmount =
          totalPayout !== undefined
            ? { ...rest, "Total Payout": totalPayout }
            : { ...rest };

        setAmountDetail(reorderedAmount);
      }

      setApplicant(applicantDetails);
      if (applicationData.status !== "pending") {
        setShowActionButtons(false);
      }
      setApplicantData([
        {
          id: 1,
          name: `${applicantDetails.firstName ?? ""} ${
            applicantDetails.middleName ? applicantDetails.middleName + " " : ""
          }${applicantDetails.lastName ?? ""}`.trim(),
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
        verificationErrors: file?.verificationStatus?.verificationErrors ?? [
          "Some error occurred in verification",
        ],
      }));

      setDocuments(documents);

      // Button visibility logic
      const allDocsUnverified = documents.length > 0 && documents.every((doc: any) => doc.status == null);
      const anyDocFailed = documents.length > 0 && documents.some((doc: any) => doc.status === "Unverified");

      setIsVerifyButtonVisible(allDocsUnverified);
      setIsReverifyButtonVisible(!allDocsUnverified && anyDocFailed);

      // Fetch applicationForm using benefitId
      if (applicationData?.benefitId) {
        const benefitResponse = await getBenefitById(applicationData.benefitId);
        // You may need to adjust this depending on the API response structure
        setApplicationForm(benefitResponse?.data?.applicationForm ?? []);
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
        let statusColor = "gray.500";
        if (props.value === "pending") {
          statusColor = "orange.500";
        } else if (props.value === "rejected") {
          statusColor = "red.500";
        } else if (props.value === "approved") {
          statusColor = "green.500";
        }

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
        return props.value ?? "-";
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout
      _titleBar={{
        title: (
          <HStack spacing={4}>
            <ArrowBackIcon
              w={6}
              h={6}
              cursor="pointer"
              onClick={() => navigate(-1)}
              color="white"
              fontWeight="bold"
            />
            <Text fontWeight="bold">Application Detail For: {benefitName}</Text>
          </HStack>
        ),
      }}
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
                    <ApplicationInfo data={applicant} mapping={applicationForm} columnsLayout="two" />
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
                  {showActionButtons && (
                    <HStack justify="center" spacing={4} mt={4}>
                      {isVerifyButtonVisible && (
                        <Button
                          bg="teal.500"
                          color="white"
                          width="200px"
                          onClick={handleVerifyAll}
                          borderRadius="50px"
                          isLoading={isVerifyLoading}
                          loadingText="Verifying..."
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
                      )}
                      {isReverifyButtonVisible && (
                        <Button
                          bg="orange.400"
                          color="white"
                          width="260px"
                          onClick={handleReverifyFailed}
                          borderRadius="50px"
                          isLoading={isReverifyLoading}
                          loadingText="Re-verifying..."
                          _hover={{
                            bg: "orange.500",
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
                          Re-verify Failed Documents
                        </Button>
                      )}
                    </HStack>
                  )}
                </Box>
                {amountDetail && (
                  <Box flex="1 1 100%" mb={0}>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color="gray.700"
                      textAlign="left"
                      mt={8}
                      mb={4}
                    >
                      Amount
                    </Text>
                    <ApplicationInfo data={amountDetail} columnsLayout="one" />
                  </Box>
                )}
              </HStack>
            </>
          ) : (
            <Text fontSize="lg" textAlign="center" color="gray.500">
              No applicant data available
            </Text>
          )}

          {!showActionButtons && (() => {
            let statusColor = "gray.500";
            if (applicantData[0]?.applicationStatus === "pending") {
              statusColor = "orange.500";
            } else if (applicantData[0]?.applicationStatus === "rejected") {
              statusColor = "red.500";
            } else if (applicantData[0]?.applicationStatus === "approved") {
              statusColor = "green.500";
            }
            return (
              <Text
                fontSize="s"
                fontWeight="bold"
                color={statusColor}
                textAlign="center"
              >
                Application is {applicantData[0]?.applicationStatus}!
              </Text>
            );
          })()}

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
