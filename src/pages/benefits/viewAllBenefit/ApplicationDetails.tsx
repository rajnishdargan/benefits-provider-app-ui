import {
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { viewApplicationByApplicationId } from "../../../services/benefits";
import Loading from "../../../components/common/Loading";
import { getPreviewDetails } from "../../../utils/dataJSON/helper/helper";
interface ApplicantData {
  id: number;
  label: string;
  value: string;
  length?: number;
}
interface DocumentData {
  id: string;
  documentType: string;
  fileStoreId: string;
}

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicantData, setApplicantData] = useState<ApplicantData[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentData[]>([]);
  const [status, setStatus] = useState<any[]>([]);
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (id) {
        setLoading(true);
        try {
          const applicantionDataResponse = await viewApplicationByApplicationId(
            id
          );
          setStatus(applicantionDataResponse?.status || "N/A");
          setLoading(false);

          const data = getPreviewDetails(applicantionDataResponse?.applicant);
          if (Array.isArray(data) && data.length > 0) {
            setApplicantData(data as ApplicantData[]);
          } else {
            setApplicantData(null);
          }
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
        title: `Applicant Details : ${id}`,
      }}
      showMenu={true}
      showSearchBar={true}
      showLanguage={false}
    >
      {loading && <Loading />}
      <VStack spacing="50px" p={"20px"} align="stretch">
        <VStack align="start" spacing={4} p={2} bg="gray.50">
          <HStack
            spacing={8}
            w="100%"
            // boxShadow="0px 4px 4px 0px #00000040"
            p="2"
            borderRadius="md"
            bg="white"
          >
            <Text fontWeight="bold" w="30%">
              Status:
            </Text>
            <Text w="70%">{status ? status.toString() : "N/A"}</Text>
          </HStack>
          {applicantData?.map((item) => (
            <HStack
              key={item?.id}
              spacing={8}
              w="100%"
              // boxShadow="0px 4px 4px 0px #00000040"
              p="2"
              borderRadius="md"
              bg="white"
            >
              <Text fontWeight="bold" w="30%">
                {item.label}:
              </Text>
              <Text w="70%">
                {item.value !== null ? item.value.toString() : "N/A"}
              </Text>
            </HStack>
          ))}
          <Text fontWeight="bold" fontSize={"24px"}>
            Supporting Documents
          </Text>
          {documentData.map((doc) => (
            <VStack
              key={doc.id}
              spacing={4}
              w="100%"
              p="2"
              borderRadius="md"
              bg="white"
            >
              <FormControl key={doc.id}>
                <FormLabel>{doc?.documentType?.replace(/_/g, " ")}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none"></InputLeftElement>
                  <Input
                    color={"#0037B9"}
                    value={`File: ${doc.fileStoreId}`} // Use documentType for display
                    isReadOnly
                    variant="unstyled"
                    pl="2.5rem"
                  />
                </InputGroup>
              </FormControl>
            </VStack>
          ))}
        </VStack>
      </VStack>
    </Layout>
  );
};

export default ApplicationDetails;
