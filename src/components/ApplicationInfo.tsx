import React from "react";
import { VStack } from "@chakra-ui/react";
import { Table } from "ka-table"; // Importing ka-table directly
import { DataType } from "ka-table/enums";
interface ApplicationInfoProps {
  details: { [key: string]: string | number | boolean | null | undefined };
}

const ApplicationInfo: React.FC<ApplicationInfoProps> = ({ details }) => {
  // Prepare the data for the table
  const entries = Object.entries(details).map(([key, value]) => ({
    name: key
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (c) => c.toUpperCase()), // Capitalize first letter
    value: value || "N/A",
  }));

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
      {/* Table component with entries */}
      <Table
        rowKeyField="name"
        data={entries}
        columns={[
          { key: "name", title: "Field", dataType: DataType.String },
          { key: "value", title: "Value", dataType: DataType.String },
        ]}
      />
    </VStack>
  );
};

export default ApplicationInfo;
