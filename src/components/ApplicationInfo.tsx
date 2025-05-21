import React from "react";
import { Table, DataType } from "ka-table";
import "ka-table/style.css";

interface ApplicationInfoProps {
  details: { [key: string]: any };
  showAmount?: boolean;
}

interface Row {
  name1?: string;
  value1?: string;
  name2?: string;
  value2?: string;
}

const ApplicationInfo: React.FC<ApplicationInfoProps> = ({
  details,
  showAmount,
}) => {
  const entries = Object.entries(details).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
    value: value?.toString() || "N/A",
  }));

  const groupedEntries: Row[] = [];

  if (showAmount) {
    // Each row has only one field-value pair
    for (let i = 0; i < entries.length; i++) {
      groupedEntries.push({
        name1: entries[i]?.name,
        value1: entries[i]?.value,
      });
    }
  } else {
    // Default: two field-value pairs per row
    for (let i = 0; i < entries.length; i += 2) {
      groupedEntries.push({
        name1: entries[i]?.name,
        value1: entries[i]?.value,
        name2: entries[i + 1]?.name,
        value2: entries[i + 1]?.value,
      });
    }
  }

  // Define columns dynamically based on showAmount
  const columns = [
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
    ...(showAmount
      ? []
      : [
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
        ]),
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: showAmount ? "24px" : "0",
      }}
    >
      <div style={{ width: showAmount ? "50%" : "100%" }}>
        <Table
          rowKeyField="name1"
          data={groupedEntries}
          columns={columns}
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
    </div>
  );
};

export default ApplicationInfo;
