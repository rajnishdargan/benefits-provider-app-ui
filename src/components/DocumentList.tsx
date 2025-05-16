import React, { useEffect, useState } from "react";
import {
  VStack,
  Text,
  Button,
  SimpleGrid,
  Box,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  HStack,
  IconButton,
  Image,
  Tooltip,
  useToast,
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
} from "../services/helperService";
import { omit } from "lodash";
export interface Document {
  id: number;
  type: string;
  title: string;
  content: any;
  status: string;
  fileContent: string; // assuming this might be base64 image or structured content
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
  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();

  const toast = useToast();

  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [docList, setDocList] = useState<Document[]>(documents);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Update the document list whenever the documents prop changes
    setDocList(documents);
  }, [documents]);
  const handlePreview = (doc: Document) => {
    let decodedContent;

    if (doc?.fileContent) {
      const decoded = decodeBase64ToJson(doc.fileContent);
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
        decodedContent = filteredData;
        console.log("Decoded Content:", decodedContent);
      } else {
        decodedContent = {};
      }
    }

    setSelectedDocument({ content: decodedContent });
    onPreviewOpen();
  };

  const handleImagePreview = (doc: Document) => {
    // Decode the base64 content (if present) into a JSON object
    const decodedData = decodeBase64ToJson(doc.fileContent);
    console.log("Decoded Data:", decodedData);

    // Retrieve the base64 image content and mimetype from the decoded data
    const ImageBase64 = decodedData?.credentialSubject?.originalvc?.content;
    const mimeType =
      decodedData?.credentialSubject?.originalvc?.mimetype || "image/png"; // Default to PNG if mimetype is missing
    console.log("Image Base64:", ImageBase64);
    console.log("MIME Type:", mimeType);

    // Check if the content is a valid base64 string
    if (ImageBase64 && isBase64(ImageBase64)) {
      // If it's base64, create a data URI with the correct MIME type and set it as the image source
      setImageSrc(`data:${mimeType};base64,${ImageBase64}`);
      onImageOpen(); // Open the image preview
    } else {
      // Show a toast message if the content is invalid
      toast({
        title: "Unable to Preview Image",
        description: "The image content is either missing or invalid.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };


  return (
    <VStack spacing={6} align="center" p="20px" width="full">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="80%">
        {docList.map((doc) => (
          <Box
            key={doc.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="sm"
            overflow="hidden"
          >
            <Text fontWeight="bold" mb={2}>
              {doc.type}
            </Text>
            <HStack
              spacing={2}
              align="center"
              width="100%"
              justify="space-between"
            >
              {/* Status icon */}
              {doc.status === "Verified" && <CheckIcon color="green.500" />}
              {doc.status === "Unverified" && <CloseIcon color="red.500" />}
              {(doc.status === "Pending" || !doc.status) && (
                <InfoOutlineIcon color="yellow.500" />
              )}

              {/* Title with truncation from the right */}
              <Tooltip label={doc.title} hasArrow>
                <Box maxW="250px" isTruncated>
                  <Button
                    variant="link"
                    colorScheme="blue"
                    onClick={() => handlePreview(doc)}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {doc.title}
                  </Button>
                </Box>
              </Tooltip>

              {/* Eye icon to preview document image */}
              <IconButton
                icon={<ViewIcon />}
                aria-label="Preview image"
                size="sm"
                variant="ghost"
                onClick={() => handleImagePreview(doc)}
                ml="auto" // This pushes the button to the right
              />
            </HStack>
          </Box>
        ))}
      </SimpleGrid>

      {/* JSON Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        size="xl"
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent maxHeight="80vh" overflowY="auto">
          <ModalHeader>Preview Data</ModalHeader>
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
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt="Document Image"
                width="100%"
                objectFit="contain" // Ensure the image is not stretched
                style={{ imageRendering: "auto" }} // Prevent blurring
              />
            ) : (
              <Text>No image available.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default DocumentList;
