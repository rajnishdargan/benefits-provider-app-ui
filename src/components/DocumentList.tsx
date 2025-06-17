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
  isDateString,
  formatDate,
  convertKeysToTitleCase,
  formatTitle,
} from "../services/helperService";
import { omit } from "lodash";
import ImagePreview from "./ImagePreview";

export interface Document {
  id: number;
  type: string;
  title: string;
  content: any;
  status: string;
  verificationErrors: { raw: string; error: string }[];
  fileContent: string;
  newTitle?: string; // Added newTitle property
}

interface DocumentListProps {
  documents: Document[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();
  const toast = useToast();

  // Define a type for the selected document preview content
  type SelectedDocumentPreview = {
    content: Record<string, unknown>;
  } | null;

  const [selectedDocument, setSelectedDocument] =
    useState<SelectedDocumentPreview>(null);
  const [docList, setDocList] = useState<Document[]>([]);
  const [errorModalDoc, setErrorModalDoc] = useState<Document | null>(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string[] | null>(
    null
  );
  const [selectedImageTitle, setSelectedImageTitle] = useState<string | null>(
    null
  );
  const {
    isOpen: isZoomOpen,
    onOpen: onZoomOpen,
    onClose: onZoomClose,
  } = useDisclosure();

  useEffect(() => {
    if (documents && documents.length > 0) {
      // Process documents to extract newTitle and remove duplicates
      const processedDocs = documents.map((doc) => {
        let newTitle = "";

        if (doc.fileContent) {
          try {
            const decodedContent = decodeBase64ToJson(doc.fileContent);
            const fullTitle = decodedContent?.credentialSchema?.title ?? "";
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

    setSelectedDocument({ content: decodedContent ?? {} });
    onPreviewOpen();
  };

  const handleImagePreview = (_doc: Document) => {
    try {
      console.log("Handling image preview for document:", _doc);
      if (_doc.newTitle) {
        setSelectedImageTitle(_doc.newTitle);
      }
      const decodedData = decodeBase64ToJson(_doc.fileContent);
      const credentialSubject = decodedData?.credentialSubject;

      const images: string[] = [];

      if (credentialSubject && typeof credentialSubject === "object") {
        Object.values(credentialSubject).forEach((entry) => {
          if (
            typeof entry === "object" &&
            entry !== null &&
            "url" in entry &&
            typeof (entry as { url: unknown }).url === "string"
          ) {
            images.push((entry as { url: string }).url);
          }
        });
      }

      if (images.length > 0) {
        setSelectedImageSrc(images);
        onZoomOpen();
      } else {
        toast({
          title: "No images found in uploaded document",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: "Invalid JSON in document data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (

    <VStack spacing={6} align="center" p="20px" width="full">
      {selectedImageSrc && selectedImageTitle && (
        <ImagePreview
          imageSrc={selectedImageSrc}
          isOpen={isZoomOpen}
          docType={selectedImageTitle}
          onClose={() => {
            setSelectedImageSrc(null);
            setSelectedImageTitle(null);
            onZoomClose();
          }}
        />
      )}

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
                  {doc.newTitle} ({formatTitle(doc.title)})
                </Text>
              </Td>
              <Td>
                <Button
                  leftIcon={<ViewIcon />}
                  aria-label="Preview Details"
                  size="sm"
                  onClick={() => handlePreview(doc)}
                >
                  View Data
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
                      label="Click to view verification errors"
                      hasArrow
                      bg="red.500"
                      color="white"
                    >
                      <Button
                        leftIcon={<CloseIcon color="red.500" />}
                        size="sm"
                        variant="ghost"
                        color="red.500"
                        onClick={() => setErrorModalDoc(doc)}
                      >
                        Unverified
                      </Button>
                    </Tooltip>
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

      {/* Error Details Modal */}
      <Modal
        isOpen={!!errorModalDoc}
        onClose={() => setErrorModalDoc(null)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verification Errors</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {errorModalDoc?.verificationErrors &&
            errorModalDoc.verificationErrors.length > 0 ? (
              <VStack align="start" spacing={4}>
                {errorModalDoc.verificationErrors.map(
                  (err: { raw: string; error: string }) => (
                    <VStack
                      key={err.raw}
                      align="start"
                      spacing={1}
                      p={3}
                      borderBottom="1px solid #eee"
                      w="100%"
                    >
                      <Text fontWeight="bold" color="red.600" fontSize="md">
                        {err.raw}
                      </Text>
                      <Text color="gray.800" fontSize="sm">
                        {err.error}
                      </Text>
                    </VStack>
                  )
                )}
              </VStack>
            ) : (
              <Text>No errors found.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default DocumentList;
