import React from "react";
import { Table, DataType } from "ka-table";
import "ka-table/style.css";

interface ApplicationInfoProps {
  details: { [key: string]: any };
}

interface DoubleEntryRow {
  name1: string;
  value1: string;
  name2?: string;
  value2?: string;
}

const ApplicationInfo: React.FC<ApplicationInfoProps> = ({ details }) => {
  // Prepare the data for the table
  const entries = Object.entries(details).map(([key, value]) => ({
    name: key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase()),
    value: value?.toString() || "N/A",
  }));

  const groupedEntries: DoubleEntryRow[] = [];
  for (let i = 0; i < entries.length; i += 2) {
    groupedEntries.push({
      name1: entries[i].name,
      value1: entries[i].value,
      name2: entries[i + 1]?.name,
      value2: entries[i + 1]?.value,
    });
  }

  return (
    <div>
      <Table
        rowKeyField="name1"
        data={groupedEntries}
        columns={[
          {
            key: "name1",
            title: "Field",
            dataType: DataType.String,
            style: { fontWeight: "bold" },
          },
          {
            key: "value1",
            title: "Value",
            dataType: DataType.String,
          },
          {
            key: "name2",
            title: "Field",
            dataType: DataType.String,
            style: { fontWeight: "bold" },
          },
          {
            key: "value2",
            title: "Value",
            dataType: DataType.String,
          },
        ]}
        childComponents={{
          table: {
            elementAttributes: () => ({
              style: { width: "100%", borderCollapse: "collapse" },
            }),
          },
          cellText: {
            content: ({ column, value }) => {
              if (column.key?.toString().startsWith("name")) {
                return <strong>{value}</strong>;
              }
              return value;
            },
          },
        }}
      />

      {/* Inline styles */}
      <style>
        {`
          .ka-thead-cell {
            font-weight: bold;
            background-color: #f5f5f5;
          }

          .ka-cell {
            padding: 8px;
          }
        `}
      </style>
    </div>
  );
};

export default ApplicationInfo;
