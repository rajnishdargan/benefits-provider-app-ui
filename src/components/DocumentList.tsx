import React, { useState } from "react";
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
  Code,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

export interface Document {
  id: number;
  type: string;
  title: string;
  content: any;
  status: "Pending" | "Accepted" | "Rejected";
}

interface DocumentListProps {
  documents: Document[];
  onUpdateStatus: (id: number, status: "Accepted" | "Rejected") => void;
  title?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onUpdateStatus,
  title = "Required Documents",
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    onOpen();
  };

  return (
    <VStack
      spacing={6} // Increased space between rows
      align="center" // Center the content horizontally
      p="20px"
      borderRadius="8px"
      marginTop="20px"
      boxShadow="md"
      width="full"
    >
      <SimpleGrid
        columns={{ base: 1, sm: 1, md: 2, lg: 2 }}
        spacingY={{ base: 6, sm: 8, md: 10 }}
        width="80%"
        paddingLeft="100px"
      >
        {documents.map((doc) => (
          <Box key={doc.id}>
            <Text
              fontFamily="Poppins"
              fontWeight="600"
              fontSize="14px"
              lineHeight="20px"
              letterSpacing="0.25px"
              verticalAlign="middle"
            >
              {doc.type}:
            </Text>
            <Box pl={4}>
              <HStack spacing={2}>
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => handlePreview(doc)}
                >
                  {doc.title}
                </Button>
                <IconButton
                  aria-label="Accept"
                  icon={<CheckIcon />}
                  bg="green.100"
                  color="green.700"
                  size="sm"
                  onClick={() => onUpdateStatus(doc.id, "Accepted")}
                  isDisabled={doc.status !== "Pending"}
                />
                <IconButton
                  aria-label="Reject"
                  icon={<CloseIcon />}
                  bg="red.100"
                  color="red.700"
                  size="sm"
                  onClick={() => onUpdateStatus(doc.id, "Rejected")}
                  isDisabled={doc.status !== "Pending"}
                />
              </HStack>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {/* Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview: {selectedDocument?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Code
              whiteSpace="pre-wrap"
              display="block"
              p={4}
              children={JSON.stringify(selectedDocument?.content, null, 2)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default DocumentList;
