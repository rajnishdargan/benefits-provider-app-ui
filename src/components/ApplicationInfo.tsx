import React from "react";
import { Table, DataType } from "ka-table";
import "ka-table/style.css";

// Props interface for the component
interface ApplicationInfoProps {
  data: { [key: string]: any };
  mapping?: Array<{
    name: string;
    label: string;
    type?: string;
    options?: { label: string; value: any }[];
  }>;
  columnsLayout?: "one" | "two";
}

const ApplicationInfo: React.FC<ApplicationInfoProps> = ({
  data,
  mapping,
  columnsLayout = "one",
}) => {
  // Helper: Converts camelCase to Title Case
  const camelToTitle = (str: string): string =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

  // Helper: Get display value based on field type
  const getDisplayValue = (field: any, value: any): string => {
    if (!field) return value?.toString() ?? "N/A";
    if (field.type === "select" && Array.isArray(field.options)) {
      const option = field.options.find(
        (opt: { value: string }) => opt.value === value
      );
      return option?.label ?? value?.toString() ?? "N/A";
    }
    if (field.type === "amount" && value !== null && value !== "") {
      return `₹${Number(value).toFixed(2)}`;
    }
    return value?.toString() ?? "N/A";
  };

  // Create a map for quick field lookup by name (if mapping provided)
  const mappingMap = React.useMemo(() => {
    if (!mapping) return {};
    return Object.fromEntries(mapping.map((field) => [field.name, field]));
  }, [mapping]);

  // Prepare entries: [{ label, value }]
  const entries = React.useMemo(() => {
    // Use mapping order if provided, else all keys from data
    const keys = mapping ? mapping.map((m) => m.name) : Object.keys(data);
    return keys
      .filter((key) => data.hasOwnProperty(key))
      .map((key) => {
        const field = mappingMap[key];
        const label = field?.label ?? camelToTitle(key);
        const displayValue = getDisplayValue(field, data[key]);
        return { label, value: displayValue };
      });
  }, [data, mapping, mappingMap]);

  // Group entries for one or two column layout
  const groupedEntries =
    columnsLayout === "two"
      ? entries.reduce((rows: any[], item, idx) => {
          if (idx % 2 === 0) {
            rows.push({ col1Label: item.label, col1Value: item.value });
          } else {
            Object.assign(rows[rows.length - 1], {
              col2Label: item.label,
              col2Value: item.value,
            });
          }
          return rows;
        }, [])
      : entries.map((item) => ({
          col1Label: item.label,
          col1Value: item.value,
        }));

  // Define table columns based on layout
  const columns = [
    {
      key: "col1Label",
      title: "Field",
      dataType: DataType.String,
      style: { fontWeight: "bold", width: "25%" },
    },
    {
      key: "col1Value",
      title: "Value",
      dataType: DataType.String,
      style: { width: "25%" },
    },
    ...(columnsLayout === "two"
      ? [
          {
            key: "col2Label",
            title: "Field",
            dataType: DataType.String,
            style: { fontWeight: "bold", width: "25%" },
          },
          {
            key: "col2Value",
            title: "Value",
            dataType: DataType.String,
            style: { width: "25%" },
          },
        ]
      : []),
  ];

  // Render the table with custom styles
  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}
    >
      <div style={{ width: columnsLayout === "two" ? "100%" : "50%" }}>
        <Table
          rowKeyField="col1Label"
          data={groupedEntries}
          columns={columns}
          childComponents={{
            table: {
              elementAttributes: () => ({
                style: { width: "100%", borderCollapse: "collapse" },
              }),
            },
          }}
        />
        {/* Inline styles for table header and cells */}
        <style>
          {`
            .ka-thead-cell {
              font-weight: bold;
              background-color: #f5f5f5;
              text-align: left !important;
            }
            .ka-cell {
              padding: 8px;
              text-align: left !important;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default ApplicationInfo;
