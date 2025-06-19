import React, { useEffect, useState } from "react";
import {
  VStack,
  HStack,
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
import Table from "./common/table/Table"; // Adjust path as needed
import { DataType } from "ka-table";
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
  newTitle?: string;
}
interface CellProps {
  column: { key: string; [key: string]: any };
  rowData: TableRowData;
}
interface DocumentListProps {
  documents: Document[];
}

// Define the table row data type
interface TableRowData {
  id: number;
  serialNumber: number;
  documentName: string;
  documentDetails: Document;
  originalDocument: Document;
  verificationStatus: string;
  doc: Document;
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
  // Extract cell renderers into separate functions
  const renderDocumentDetailsCell = (
    rowData: TableRowData,
    handlePreview: (doc: Document) => void
  ) => (
    <Button
      leftIcon={<ViewIcon />}
      aria-label="Preview Details"
      size="sm"
      onClick={() => handlePreview(rowData.doc)}
    >
      View Data
    </Button>
  );

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

  // Prepare data for ka-table
  const tableData: TableRowData[] = docList.map((doc, index) => ({
    id: doc.id,
    serialNumber: index + 1,
    documentName: `${doc.newTitle} (${formatTitle(doc.title)})`,
    documentDetails: doc,
    originalDocument: doc,
    verificationStatus: doc.status,
    doc: doc, // Keep reference to original doc for actions
  }));

  // Define columns for ka-table with proper typing
  const columns = [
    {
      key: "serialNumber",
      title: "Id",
      dataType: DataType.Number,
      style: { width: "80px", textAlign: "center" as const },
    },
    {
      key: "documentName",
      title: "Document Name",
      dataType: DataType.String,
      style: { width: "300px" },
    },
    {
      key: "documentDetails",
      title: "Document Details",
      dataType: DataType.Object,
      style: { width: "150px", textAlign: "center" as const },
    },
    {
      key: "originalDocument",
      title: "Original Document",
      dataType: DataType.Object,
      style: { width: "180px", textAlign: "center" as const },
    },
    {
      key: "verificationStatus",
      title: "Verification Status",
      dataType: DataType.String,
      style: { width: "200px" },
    },
  ];
  const renderOriginalDocumentCell = (
    rowData: TableRowData,
    handleImagePreview: (doc: Document) => void
  ) => (
    <Button
      leftIcon={<ViewIcon />}
      aria-label="Preview Original Document"
      size="sm"
      onClick={() => handleImagePreview(rowData.doc)}
    >
      View Original Document
    </Button>
  );

  const renderVerificationStatusCell = (
    rowData: TableRowData,
    setErrorModalDoc: (doc: Document) => void
  ) => {
    const doc = rowData.doc;
    console.log("Rendering verification status for document:", doc);

    if (doc.status === "Verified") {
      return (
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
      );
    }

    if (doc.status === "Unverified") {
      return (
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
      );
    }
    return (
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
    );
  };

  const renderDocumentNameCell = (rowData: TableRowData) => (
    <Text maxW="400px" whiteSpace="normal" wordBreak="break-word">
      {rowData.documentName}
    </Text>
  );

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

      <div style={{ width: "100%" }}>
        <Table
          rowKeyField="id"
          data={tableData}
          columns={columns}
          childComponents={{
            table: {
              elementAttributes: () => ({
                style: {
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #e2e8f0",
                },
              }),
            },
            cellText: {
              content: (props: CellProps) => {
                const { column, rowData } = props;

                switch (column.key) {
                  case "documentDetails":
                    return renderDocumentDetailsCell(rowData, handlePreview);
                  case "originalDocument":
                    return renderOriginalDocumentCell(
                      rowData,
                      handleImagePreview
                    );
                  case "verificationStatus":
                    return renderVerificationStatusCell(
                      rowData,
                      setErrorModalDoc
                    );
                  case "documentName":
                    return renderDocumentNameCell(rowData);
                  default:
                    return rowData[column.key as keyof TableRowData];
                }
              },
            },
          }}
        />

        {/* Custom styles for ka-table */}
        <style>
          {`
            .ka-thead-cell {
              font-weight: bold !important;
              background-color: #f7fafc !important;
              text-align: left !important;
              padding: 12px 8px !important;
              border: 1px solid #e2e8f0 !important;
              color: #2d3748 !important;
            }
            .ka-cell {
              padding: 12px 8px !important;
              text-align: left !important;
              border: 1px solid #e2e8f0 !important;
              vertical-align: middle !important;
            }
            .ka-row:hover {
              background-color: #f7fafc !important;
            }
            .ka-table {
              font-family: inherit !important;
            }
          `}
        </style>
      </div>

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
