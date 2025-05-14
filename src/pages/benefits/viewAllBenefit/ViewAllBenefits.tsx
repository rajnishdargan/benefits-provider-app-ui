import {
  ArrowForwardIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import {
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  Select,
} from "@chakra-ui/react";

import Table from "../../../components/common/table/Table";
import { DataType } from "ka-table/enums";
import { ICellTextProps } from "ka-table/props";
import { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import PaginationList from "./PaginationList";
import { getBenefitList } from "../../../services/benefits";

const columns = [
  { key: "title", title: "Benefit Name", dataType: DataType.String },
  { key: "applications_count", title: "Total Applications", dataType: DataType.Number },
  { key: "pending_applications_count", title: "Pending Applications", dataType: DataType.Number },
  { key: "approved_applications_count", title: "Approved Applications", dataType: DataType.Number },
  { key: "rejected_applications_count", title: "Rejected Applications", dataType: DataType.Number },
  { key: "applicationCloseDate", title: "Close Date", dataType: DataType.String },
  {
    key: "actions",
    title: "Actions",
    dataType: DataType.String,
  },
];

const ActionCell = ({ rowData }: ICellTextProps) => {
  const navigate = useNavigate();
  return (
    <HStack>
      <IconButton
        onClick={() => {
          navigate(`/applicants_list/${rowData?.documentId}`);
        }}
        aria-label="Show Details"
        icon={<ArrowForwardIcon />}
        size="lg"
      />
    </HStack>
  );
};

const customCellText = (props: ICellTextProps) => {
  switch (props.column.key) {
    case "actions":
      return <ActionCell {...(props as any)} rowData={props.rowData} />;
    default:
      return props.value;
  }
};

const ViewAllBenefits = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const PAGE_SIZE = 10;
  const [pageIndex, setPageIndex] = useState(0);

  const fetchAllBenefits = async () => {
    try {
      const response = await getBenefitList();
      console.log("Response from API:", response);
      if (response?.results) {
        const mappedData = response.results.map((benefit: any) => ({
          ...benefit,
          applications_count: benefit.application_details?.applications_count || 0,
          pending_applications_count: benefit.application_details?.pending_applications_count || 0,
          approved_applications_count: benefit.application_details?.approved_applications_count || 0,
          rejected_applications_count: benefit.application_details?.rejected_applications_count || 0,
        }));
        setData(mappedData);
        setFilteredData(mappedData);
      }
    } catch (error) {
      console.error("Error fetching all benefits:", error);
    }
  };

  useEffect(() => {
    fetchAllBenefits();
  }, []);

  useEffect(() => {
    if (sortOrder) {
      const sorted = [...filteredData].sort((a: any, b: any) => {
        if (sortOrder === "asc") {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      });
      setFilteredData(sorted);
    }
  }, [sortOrder, filteredData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = data.filter((benefit: any) =>
      benefit.title.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
    setPageIndex(0); // Reset to the first page
  };

  const paginatedData = filteredData?.slice(
    pageIndex * PAGE_SIZE,
    pageIndex * PAGE_SIZE + PAGE_SIZE
  );

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  return (
    <Layout
      _titleBar={{
        title: "Benefit List",
      }}
      showMenu={true}
      showSearchBar={true}
      showLanguage={false}
    >
      <VStack spacing="20px" p={"20px"} align="stretch">
        {/* Search and Sort Controls */}
        <HStack spacing={4}>
          <InputGroup maxWidth="300px" rounded={"full"} size="lg">
            <Input
              placeholder="Search by Benefit Name"
              rounded={"full"}
              bg="#E9E7EF"
              value={searchQuery}
              onChange={handleSearch}
            />
            <InputRightElement>
              <SearchIcon color="gray.500" />
            </InputRightElement>
          </InputGroup>

          <Select
            placeholder="Sort Order"
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            value={sortOrder || ""}
            maxWidth="150px"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>
        </HStack>

        {/* Table and Pagination */}
        {filteredData?.length > 0 ? (
          <Table
            columns={columns}
            data={paginatedData}
            rowKeyField={"id"}
            childComponents={{
              cellText: {
                content: (props: ICellTextProps) => customCellText(props),
              },
            }}
          />
        ) : (
          <Text fontSize="lg" textAlign="center" color="gray.500">
            No data available
          </Text>
        )}
        <PaginationList
          total={filteredData?.length}
          pageSize={PAGE_SIZE}
          currentPage={pageIndex}
          onPageChange={handlePageChange}
        />
      </VStack>
    </Layout>
  );
};

export default ViewAllBenefits;
