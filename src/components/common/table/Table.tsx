import "ka-table/style.css";

import { Table } from "ka-table";
import { memo } from "react";

// Define minimal required props based on DocumentList usage
interface TableWrapperProps {
  rowKeyField: string;
  data: any[];
  columns: any[];
  childComponents?: any;
  [key: string]: any; // Allow additional props
}

const TableWrapper = (props: TableWrapperProps) => {
  return <Table {...props} />;
};

export default memo(TableWrapper);
