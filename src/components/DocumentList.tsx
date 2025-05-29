import React, { useEffect, useState } from "react";
import {
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  useDisclosure,
  useToast,
  Image,
  Button,
} from "@chakra-ui/react";
import {
  CheckIcon,
  CloseIcon,
  InfoOutlineIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import PreviewTable from "./common/previewTable/previewTable";
import {
  decodeBase64ToJson,
  isBase64,
  isDateString,
  formatDate,
  convertKeysToTitleCase,
  formatTitle,
} from "../services/helperService";
import { omit } from "lodash";

export interface Document {
  id: number;
  type: string;
  title: string;
  content: any;
  status: string;
  verificationErrors: string[];
  fileContent: string;
  newTitle?: string; // Added newTitle property
}

interface DocumentListProps {
  documents: Document[];
  benefitName?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, benefitName }) => {
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();
  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();
  const toast = useToast();

  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [docList, setDocList] = useState<Document[]>([]);
  const [imageSrc, setImageSrc] = useState<string[] | null>(null);

  useEffect(() => {
    if (documents && documents.length > 0) {
      // Process documents to extract newTitle and remove duplicates
      const processedDocs = documents.map((doc) => {
        let newTitle = "";

        if (doc.fileContent) {
          try {
            const decodedContent = decodeBase64ToJson(doc.fileContent);
            const fullTitle = decodedContent?.credentialSchema?.title || "";
            // Extract string before colon (:)
            newTitle = fullTitle.includes(":")
              ? fullTitle.split(":")[0].trim()
              : fullTitle;
          } catch (error) {
            console.error(
              "Failed to decode fileContent for document:",
              doc.id,
              error
            );
            newTitle = "";
          }
        }

        return {
          ...doc,
          newTitle: newTitle,
        };
      });

      console.log("Processed documents with newTitle:", processedDocs);

      setDocList(processedDocs);
    } else {
      setDocList([]);
    }
  }, [documents]);

  const handlePreview = (doc: Document) => {
    let decodedContent;

    if (doc?.fileContent) {
      let decoded;
      try {
        decoded = decodeBase64ToJson(doc.fileContent);
        console.log("Decoded Document:", decoded);
      } catch (e) {
        console.error("Failed to decode base64 content:", e);
        toast({
          title: "Decoding Error",
          description: "Failed to decode document content.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (decoded?.credentialSubject) {
        const filteredData = omit(decoded.credentialSubject, [
          "@context",
          "original_vc",
          "originalvc",
          "original_vc1",
          "originalvc1",
          "issuingauthoritysignature",
          "id",
        ]);
        decodedContent = convertKeysToTitleCase(filteredData);
        console.log("Decoded Content:", decodedContent);
      } else {
        decodedContent = {};
      }
    }

    setSelectedDocument({ content: decodedContent });
    onPreviewOpen();
  };

  const handleImagePreview = (doc: Document) => {
    const decodedData = decodeBase64ToJson(doc.fileContent);
    console.log("Decoded Document for Image:", decodedData);

    const images: string[] = []; // Explicitly define the type as string[]
    const possibleKeys = [
      "originalvc",
      "original_vc",
      "originalvc1",
      "original_vc1",
    ];

    possibleKeys.forEach((key) => {
      const content = decodedData?.credentialSubject?.[key]?.content;
      const mimeType =
        decodedData?.credentialSubject?.[key]?.mimetype || "image/png";

      if (content && isBase64(content)) {
        images.push(`data:${mimeType};base64,${content}`);
      }
    });

    if (images.length > 0) {
      setImageSrc(images);
      onImageOpen();
    } else {
      toast({
        title: "Unable to Preview Images",
        description: "The image content is either missing or invalid.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={6} align="center" p="20px" width="full">
      <Table variant="simple" width="100%">
        <Thead>
          <Tr>
            <Th>Id</Th>
            <Th>Document Name</Th>

            <Th>Document Details</Th>
            <Th>Original Document</Th>
            <Th>Verification Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {docList.map((doc, index) => (
            <Tr key={doc.id}>
              <Td>{index + 1}</Td>
              <Td maxW="400px">
                <Text maxW="400px" whiteSpace="normal" wordBreak="break-word">
                  {benefitName?.includes("RVY-HQ")
                    ? doc.newTitle === "OTR Credential"
                      ? "Proof of Age & Identity"
                      : doc.newTitle === "BPL Card"
                      ? "Proof of Economic Need"
                      : doc.newTitle
                    : doc.newTitle}
                  {!benefitName?.includes("RVY-HQ") && ` (${formatTitle(doc.title)})`}
                </Text>
              </Td>
              <Td>
                <Button
                  leftIcon={<ViewIcon />}
                  aria-label="Preview Details"
                  size="sm"
                  onClick={() => handlePreview(doc)}
                >
                  View Details
                </Button>
              </Td>
              <Td>
                <Button
                  leftIcon={<ViewIcon />}
                  aria-label="Preview Original Document"
                  size="sm"
                  onClick={() => handleImagePreview(doc)}
                >
                  View Original Document
                </Button>
              </Td>
              <Td>
                {doc.status === "Verified" && (
                  <HStack align="center" spacing={2}>
                    <Tooltip
                      label="Document is verified"
                      hasArrow
                      bg="green.500"
                      color="white"
                    >
                      <CheckIcon color="green.500" />
                    </Tooltip>
                    <Text color="green.500" fontWeight="bold">
                      Verified
                    </Text>
                  </HStack>
                )}
                {doc.status === "Unverified" && (
                  <HStack align="center" spacing={2}>
                    <Tooltip
                      label={doc.verificationErrors.join(", ")}
                      hasArrow
                      bg="red.500"
                      color="white"
                    >
                      <CloseIcon color="red.500" />
                    </Tooltip>
                    <Text color="red.500" fontWeight="bold">
                      Unverified
                    </Text>
                  </HStack>
                )}
                {(doc.status === "Pending" || !doc.status) && (
                  <HStack align="center" spacing={2}>
                    <Tooltip
                      label="Document is not verified"
                      hasArrow
                      bg="yellow.500"
                      color="white"
                    >
                      <InfoOutlineIcon color="yellow.500" />
                    </Tooltip>
                    <Text color="yellow.500" fontWeight="bold">
                      Pending
                    </Text>
                  </HStack>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* JSON Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        size="xl"
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent maxHeight="80vh" overflowY="auto">
          <ModalHeader>Document Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {selectedDocument?.content &&
            Object.keys(selectedDocument.content).length > 0 ? (
              <PreviewTable
                rowKeyField="name"
                data={Object.entries(selectedDocument.content).map(
                  ([key, value]) => ({
                    name: key,
                    value: value,
                  })
                )}
                columns={[
                  {
                    key: "name",
                    title: "Field",
                    dataKey: "name",
                    render: (name: any) => <strong>{name}</strong>,
                  },
                  {
                    key: "value",
                    title: "Value",
                    dataKey: "value",
                    render: (value: any) => (
                      <span>
                        {isDateString(value)
                          ? formatDate(value)
                          : String(value)}
                      </span>
                    ),
                  },
                ]}
              />
            ) : (
              <Text>No content available for preview.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={isImageOpen}
        onClose={onImageClose}
        size="2xl"
        motionPreset="scale"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Document Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {imageSrc && imageSrc.length > 0 ? (
              <VStack spacing={4}>
                {imageSrc.map((src, index) => (
                  <Image
                    key={index}
                    src={src}
                    alt={`Document Image ${index + 1}`}
                    width="100%"
                    objectFit="contain"
                    style={{
                      imageRendering: "auto",
                      border: "2px solid #ccc", // Add a border
                      borderRadius: "8px", // Optional: Add rounded corners
                      padding: "4px", // Optional: Add padding inside the border
                    }}
                  />
                ))}
              </VStack>
            ) : (
              <Text>No images available.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default DocumentList;
