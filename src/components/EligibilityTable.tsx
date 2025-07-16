import React from "react";
import { Table, DataType } from "ka-table";
import "ka-table/style.css";
import { Box, VStack, HStack, Text, Badge, Tooltip } from "@chakra-ui/react";
import { CheckIcon, WarningIcon } from "@chakra-ui/icons";

// TypeScript interfaces
interface Reason {
  reason: string;
}

interface CriteriaResult {
  ruleKey: string;
  description: string;
  passed: boolean;
  reasons?: Reason[];
}

interface Document {
  status: string;
  [key: string]: any;
}

interface EligibilityTableProps {
  criteriaResults?: CriteriaResult[];
  applicantData?: { [key: string]: any } | null;
  documents?: Document[];
}

interface TableRowData {
  id: number;
  parameter: string;
  setCriteria: string;
  profileValue: string;
  status: boolean;
  reasons: string;
}

// Define proper types for the props
interface CellContentProps {
  column: { key: string };
  rowKeyValue: number;
  value: string | number | boolean;
  tableData: TableRowData[];
}

// Status cell component to avoid TypeScript inference issues
const StatusCell = ({ rowData }: { rowData: TableRowData | undefined }) => {
  if (rowData?.status) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#22C55E", fontWeight: "600", fontSize: "14px" }}>
            Matched
          </span>
          <CheckIcon color="green.500" boxSize={3} />
        </div>
      </div>
    );
  } else {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Tooltip
          label={rowData?.reasons}
          bg="#1B2122"
          color="#E2E2E9"
          fontSize="sm"
          borderRadius="md"
          p={3}
          maxW="300px"
          placement="top"
          hasArrow
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <span style={{ color: "#EF4444", fontWeight: "600", fontSize: "14px" }}>
              Unmatched
            </span>
            <WarningIcon color="red.500" boxSize={3} />
          </div>
        </Tooltip>
      </div>
    );
  }
};

// Helper function to get profile value dynamically from applicant data
const formatLabel = (value: unknown): string => {
  if (typeof value !== "string") return value?.toString?.() ?? "Not provided";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getProfileValueFromApplicant = (
  ruleKey: string,
  applicantData: { [key: string]: any } | null
): string => {
  if (!applicantData) return "Not available";

  // Try to find value based on ruleKey
  const value =
    applicantData[ruleKey] ??
    applicantData[ruleKey.toLowerCase()] ??
    applicantData[ruleKey.toUpperCase()];

  if (value === undefined || value === null) return "Not provided";

  // Format the value into a readable label
  return formatLabel(value);
};

// Helper function to extract criteria from description
const extractCriteriaFromDescription = (description: string): string => {
  // Return the description as criteria since it contains the requirement
  return description || "Criteria not specified";
};

// Helper function to format parameter name
const formatParameterName = (ruleKey: string): string => {
  // Convert camelCase to readable format
  return ruleKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Custom cell content component extracted to prevent re-renders
const CellContent = ({ column, rowKeyValue, value, tableData }: CellContentProps) => {
  // Custom rendering for status column
  if (column.key === "status") {
    const rowData = tableData.find((row) => row.id === rowKeyValue);
    return <StatusCell rowData={rowData} />;
  }
  // Default text rendering for other columns
  let displayValue: string;
  if (typeof value === 'string') {
    displayValue = value;
  } else if (typeof value === 'number') {
    displayValue = value.toString();
  } else if (typeof value === 'boolean') {
    displayValue = value.toString();
  } else {
    displayValue = 'N/A';
  }

  return (
    <Text
      fontSize="sm"
      whiteSpace="normal"
      wordBreak="break-word"
    >
      {displayValue}
    </Text>
  );
};

// Custom cell content renderer function
const createCellContentRenderer = (tableData: TableRowData[]) => (props: {
  column: { key: string };
  rowKeyValue: number;
  value: string | number | boolean;
}) => (
  <CellContent
    column={props.column}
    rowKeyValue={props.rowKeyValue}
    value={props.value}
    tableData={tableData}
  />
);

const EligibilityTable: React.FC<EligibilityTableProps> = ({
  criteriaResults = [],
  applicantData = null,
  documents = [],
}) => {
  const tableData: TableRowData[] = criteriaResults.map((criteria, index) => {
    const parameter = formatParameterName(criteria.ruleKey);
    const setCriteria = extractCriteriaFromDescription(criteria.description);

    // Get profile value dynamically
    let profileValue = getProfileValueFromApplicant(
      criteria.ruleKey,
      applicantData
    );

    // Special handling for documentVerificationStatus
    if (
      criteria.ruleKey === "documentVerificationStatus" &&
      documents.length > 0
    ) {
      const verifiedDocs = documents.filter(
        (doc) => doc.status === "Verified"
      ).length;
      const totalDocs = documents.length;
      profileValue = `${verifiedDocs}/${totalDocs} verified`;
    }

    const reasons = criteria.reasons
      ? criteria.reasons.map((r) => r.reason).join("; ")
      : "No specific reason provided";

    return {
      id: index, // Add unique id for ka-table
      parameter,
      setCriteria,
      profileValue,
      status: criteria.passed,
      reasons,
    };
  });

  const getStatusCount = () => {
    const passed = criteriaResults.filter((c) => c.passed).length;
    const failed = criteriaResults.filter((c) => !c.passed).length;
    return { passed, failed, total: criteriaResults.length };
  };

  const statusCount = getStatusCount();

  // Define columns for ka-table
  const columns = [
    {
      key: "parameter",
      title: "Eligibility Parameter",
      dataType: DataType.String,
      style: { fontWeight: "600", width: "25%" },
    },
    {
      key: "setCriteria",
      title: "Set Criteria",
      dataType: DataType.String,
      style: { width: "30%", paddingRight: "24px" },
    },
    {
      key: "profileValue",
      title: "Profile Value",
      dataType: DataType.String,
      style: { fontWeight: "500", width: "25%", paddingLeft: "24px" },
    },
    {
      key: "status",
      title: "Eligibility Status",
      dataType: DataType.String,
      style: { width: "20%" },
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="flex-end" width="100%">
        {criteriaResults.length > 0 && (
          <HStack spacing={2}>
            <Badge colorScheme="green" size="md">
              Passed: {statusCount.passed}
            </Badge>
            <Badge colorScheme="red" size="md">
              Failed: {statusCount.failed}
            </Badge>
          </HStack>
        )}
      </HStack>

      {criteriaResults.length > 0 ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%" }}>
            <Table
              rowKeyField="id"
              data={tableData}
              columns={columns}
              childComponents={{
                table: {
                  elementAttributes: () => ({
                    style: { width: "100%", borderCollapse: "collapse" },
                  }),
                },
                cellText: {
                  content: createCellContentRenderer(tableData),
                },
              }}
            />
            {/* Inline styles for table header and cells - consistent with ApplicationInfo */}
            <style>
              {`
                .ka-thead-cell {
                  font-weight: bold;
                  background-color: #f5f5f5;
                  text-align: left !important;
                  padding: 12px 8px;
                  color: #2D3748;
                }
                .ka-cell {
                  padding: 12px 8px;
                  text-align: left !important;
                  vertical-align: top;
                  border-bottom: 1px solid #E2E8F0;
                }
                .ka-table:hover .ka-row {
                  background-color: #F7FAFC;
                }
                /* Center align the status column specifically */
                .ka-cell:nth-child(4) {
                  text-align: center !important;
                }
                .ka-thead-cell:nth-child(4) {
                  text-align: center !important;
                }
                /* Add extra spacing between 2nd and 3rd columns */
                .ka-cell:nth-child(2) {
                  padding-right: 24px !important;
                }
                .ka-thead-cell:nth-child(2) {
                  padding-right: 24px !important;
                }
                .ka-cell:nth-child(3) {
                  padding-left: 24px !important;
             
                }
                .ka-thead-cell:nth-child(3) {
                  padding-left: 24px !important;
                }
              `}
            </style>
          </div>
        </div>
      ) : (
        <Box
          p={8}
          textAlign="center"
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="lg"
          bg="gray.50"
        >
          <Text fontSize="lg" color="gray.500">
            No eligibility criteria results available
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default EligibilityTable;
