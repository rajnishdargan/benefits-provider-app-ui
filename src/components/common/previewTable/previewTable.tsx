import React from "react";
import {
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

interface Column {
  key: string;
  title: string;
  dataKey?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  rowKeyField: string;
}

const PreviewTable: React.FC<TableProps> = ({ columns, data, rowKeyField }) => {
  return (
    <ChakraTable variant="simple" width="100%">
      <Thead>
        <Tr>
          {columns.map((column) => (
            <Th key={column.key}>{column.title}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((row) => (
          <Tr key={row[rowKeyField]}>
            {columns.map((column) => (
              <Td key={column.key}>
                {column.render
                  ? column.render(row[column.dataKey || column.key], row)
                  : row[column.dataKey || column.key]}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </ChakraTable>
  );
};

export default PreviewTable;
