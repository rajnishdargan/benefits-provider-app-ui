import { SearchIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  VStack,
} from "@chakra-ui/react";
import Table from "../../../components/common/table/Table";
import { DataType } from "ka-table/enums";
import { ICellTextProps } from "ka-table/props";
import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";

import { viewAllApplicationByBenefitId } from "../../../services/benefits";

const columns = [
  { key: "studentName", title: "Name", dataType: DataType.String },
  { key: "applicationId", title: "Application ID", dataType: DataType.Number },
  { key: "status", title: "Status", dataType: DataType.String },

  {
    key: "actions",
    title: "Actions",
    dataType: DataType.String,
  },
];

const DetailsButton = ({ rowData }: ICellTextProps) => {
  const navigate = useNavigate();
  return (
    <HStack>
      <IconButton
        aria-label="View"
        icon={<ArrowForwardIcon />}
        size="lg"
        onClick={() => {
          navigate(`/application_detail/${rowData?.applicationId}`);
        }}
      />
    </HStack>
  );
};

const PaginationControls: React.FC<{
  total: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}> = ({ total, pageSize, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box textAlign="center" mt={4}>
      {Array.from({ length: totalPages }, (_, index) => (
        <Button
          key={index}
          onClick={() => onPageChange(index)}
          colorScheme={currentPage === index ? "blue" : "gray"}
          mx={1}
        >
          {index + 1}
        </Button>
      ))}
    </Box>
  );
};

const ApplicantDetails: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const { id } = useParams<{ id: string }>();
  const [applicationData, setApplicationData] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 5;
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (id) {
        try {
          const applicantionDataResponse = await viewAllApplicationByBenefitId(
            id
          );
          const processedData = applicantionDataResponse?.map((item: any) => ({
            studentName: item?.applicant?.studentName || "N/A",
            applicationId: item?.id || "N/A",
            status: item?.status || "N/A",
          }));
          setApplicationData(processedData);
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error("id is undefined");
      }
    };
    fetchApplicationData();
  }, [id]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPageIndex(0);
  };
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
    setPageIndex(0);
  };
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };
  const filteredData = applicationData?.filter((item) =>
    item?.studentName.toLowerCase().includes(searchTerm)
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.studentName.localeCompare(b.studentName);
    } else if (sortOrder === "desc") {
      return b.studentName.localeCompare(a.studentName);
    }
    return 0;
  });

  const paginatedData = sortedData.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize
  );
  return (
    <Layout
      _titleBar={{
        title: `Applications List: ${id}`,
      }}
      showMenu={true}
      showSearchBar={true}
      showLanguage={false}
    >
      <VStack spacing="50px" p={"20px"} align="stretch">
        <HStack spacing={4}>
          <InputGroup maxWidth="300px" rounded={"full"} size="lg">
            <Input
              placeholder="Search by name.."
              rounded={"full"}
              bg="#E9E7EF"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <InputRightElement>
              <SearchIcon color="gray.500" />
            </InputRightElement>
          </InputGroup>

          <Select
            placeholder="Sort Order"
            onChange={handleSortOrderChange}
            value={sortOrder}
            maxWidth="150px"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>
        </HStack>
        <Table
          columns={columns}
          data={paginatedData}
          detailsRows={[1]}
          rowKeyField={"applicationId"}
          childComponents={{
            cellText: {
              content: (props: ICellTextProps) => CellTextContent(props),
            },
          }}
        />
        <PaginationControls
          total={sortedData.length}
          pageSize={pageSize}
          currentPage={pageIndex}
          onPageChange={handlePageChange}
        />
      </VStack>
    </Layout>
  );
};

export default ApplicantDetails;

const CellTextContent = (props: ICellTextProps) => {
  if (props.column.key === "actions") {
    return <DetailsButton {...props} />;
  }
  return props.value;
};
