import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { viewApplicationByApplicationId } from "../../../services/benefits";
import Loading from "../../../components/common/Loading";
interface ApplicantData {
  applicationId: string;
  studentName: string;
  gender: string;
  age: number | string;
  currentClass: string;
  marks?: number | string; // Optional
}
interface DocumentData {
  id: string;
  documentType: string;
  fileStoreId: string;
}

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any[]>([]);
  const [documentData, setDocumentData] = useState<DocumentData[]>([]);

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (id) {
        setLoading(true);
        try {
          const applicantionDataResponse = await viewApplicationByApplicationId(
            id
          );
          setLoading(false);
          setStatus(applicantionDataResponse?.status || "N/A");
          setApplicantData(applicantionDataResponse?.applicant || null);
          setDocumentData(applicantionDataResponse?.documents || []);
        } catch (error) {
          setLoading(false);
          console.error(error);
        }
      } else {
        setLoading(false);
        console.error("id is undefined");
      }
    };
    fetchApplicationData();
  }, [id]);

  if (!applicantData) {
    return <Loading />;
  }
  return (
    <Layout
      _titleBar={{
        title: `Applicant Details : ${applicantData?.applicationId || id}`,
      }}
      showMenu={true}
      showSearchBar={true}
      showLanguage={false}
    >
      {loading && <Loading />}
      <VStack spacing="50px" p={"20px"} align="stretch">
        <VStack align="start" spacing={4} p={4} bg="gray.50">
          <HStack
            spacing={8}
            w="100%"
            boxShadow="0px 4px 4px 0px #00000040"
            p="4"
            borderRadius="md"
            bg="white"
          >
            <FormControl>
              <FormLabel>Application ID </FormLabel>
              <Input
                value={applicantData.applicationId ?? "N/A"}
                isReadOnly
                variant="unstyled"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Status </FormLabel>
              <Input value={status ?? "N/A"} isReadOnly variant="unstyled" />
            </FormControl>
          </HStack>
          <HStack
            spacing={8}
            w="100%"
            boxShadow="0px 4px 4px 0px #00000040"
            p="4"
            borderRadius="md"
            bg="white"
          >
            <VStack align="start" spacing={2} w="20%">
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <InputGroup size="md">
                  <Input
                    value={applicantData.studentName}
                    isReadOnly
                    variant="unstyled"
                  />
                  <InputRightElement>
                    <CheckIcon color="green.500" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
            <VStack align="start" spacing={2} w="20%">
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <InputGroup size="md">
                  <Input
                    value={applicantData.gender}
                    isReadOnly
                    variant="unstyled"
                  />
                  <InputRightElement>
                    <CheckIcon color="green.500" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
            <VStack align="start" spacing={2} w="20%">
              <FormControl>
                <FormLabel>Age</FormLabel>
                <InputGroup size="md">
                  <Input
                    value={applicantData.age}
                    isReadOnly
                    variant="unstyled"
                  />
                  <InputRightElement>
                    <CheckIcon color="green.500" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
            <VStack align="start" spacing={2} w="20%">
              <FormControl>
                <FormLabel>Class</FormLabel>
                <InputGroup size="md">
                  <Input
                    value={applicantData.currentClass}
                    isReadOnly
                    variant="unstyled"
                  />
                  <InputRightElement>
                    <CheckIcon color="green.500" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
            <VStack align="start" spacing={2} w="20%">
              <FormControl>
                <FormLabel>Marks</FormLabel>
                <InputGroup size="md">
                  <Input
                    value={applicantData.marks || "N/A"}
                    isReadOnly
                    variant="unstyled"
                  />
                  <InputRightElement>
                    <CheckIcon color="green.500" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
          </HStack>
          <Text fontWeight="bold" fontSize={"24px"}>
            Supporting Documents
          </Text>
          <HStack
            spacing={4}
            w="100%"
            boxShadow="0px 4px 4px 0px #00000040"
            p="4"
            borderRadius="md"
            bg="white"
          >
            {documentData.map((doc) => (
              <FormControl key={doc.id}>
                <FormLabel>{doc.documentType.replace(/_/g, " ")}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <CheckIcon color="#0037B9" />
                  </InputLeftElement>
                  <Input
                    color={"#0037B9"}
                    value={`File: ${doc.fileStoreId}`} // Use documentType for display
                    isReadOnly
                    variant="unstyled"
                    pl="2.5rem"
                  />
                </InputGroup>
              </FormControl>
            ))}
          </HStack>
          <HStack spacing={4} justifyContent={"center"} w="100%">
            <Button
              leftIcon={<CheckIcon />}
              colorScheme="#3C5FDD"
              bgColor={"#3C5FDD"}
              variant="solid"
              borderRadius={"100px"}
              alignSelf="center"
            >
              <Text fontSize={"14px"}>Approve</Text>
            </Button>

            <Button
              leftIcon={<CloseIcon color={"#C03744"} />}
              colorScheme="#C03744"
              variant="outline"
              borderRadius={"100px"}
              borderColor={"#C03744"}
              alignSelf="center"
              fontSize={"14px"}
            >
              <Text color={"#C03744"} fontSize={"14px"}>
                Reject
              </Text>
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Layout>
  );
};

export default ApplicationDetails;
