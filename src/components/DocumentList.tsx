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
  HStack,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import Table from "./common/table/Table";

// Document interface
export interface Document {
  id: number;
  type: string;
  title: string;
  content: any;
  status: string;
}

interface DocumentListProps {
  documents: Document[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedDocument(null); // Clear the selected document
    onClose(); // Close the modal
  };

  return (
    <VStack
      spacing={6}
      align="center"
      p="20px"
      borderRadius="8px"
      marginTop="20px"
      boxShadow="md"
      width="full"
    >
      <SimpleGrid
        columns={{ base: 1, sm: 1, md: 2, lg: 1 }}
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
                {/* Icon based on document status */}
                {doc.status === "Accepted" && <CheckIcon color="green.500" />}
                {doc.status === "Rejected" && <CloseIcon color="red.500" />}
                {(doc.status === "Pending" || !doc.status) && (
                  <InfoOutlineIcon color="yellow.500" />
                )}

                {/* Document title */}
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => handlePreview(doc)}
                >
                  {doc.title}
                </Button>
              </HStack>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {/* Preview Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        size="xl"
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent maxHeight="80vh" overflowY="auto">
          <ModalHeader>Preview: {selectedDocument?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {/* Use ka-table to render the document content as a table */}
            {selectedDocument?.content && (
              <Table
                rowKeyField="name"
                data={Object.entries(selectedDocument.content).map(
                  ([key, value]) => ({
                    name: key,
                    value: value,
                  })
                )}
                columns={[
                  { key: "name", title: "Field" },
                  { key: "value", title: "Value" },
                ]}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default DocumentList;
