import {
  ArrowForwardIcon,
  ChevronDownIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import {
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import Tab from "../../../components/common/Tab";
import Table from "../../../components/common/table/Table";
import { DataType } from "ka-table/enums";
import { ICellTextProps } from "ka-table/props";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { viewAllBenefitsData } from "../../../services/benefits";
import Layout from "../../../components/layout/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
const columns = [
  { key: "name", title: "Name", dataType: DataType.String },
  { key: "applicants", title: "Applicants", dataType: DataType.Number },
  /* { key: "approved", title: "Approved", dataType: DataType.Number },
  { key: "rejected", title: "Rejected", dataType: DataType.Number },
  {
    key: "disbursalPending",
    title: "Disbursal Pending",
    dataType: DataType.Number,
  },*/
  { key: "deadline", title: "Deadline", dataType: DataType.String },
  {
    key: "actions",
    title: "Actions",
    dataType: DataType.String,
  },
];
const DeadLineCell = (prop: ICellTextProps) => {
  return (
    <HStack>
      <Text fontSize="16px" fontWeight="400">
        {prop?.value
          ? new Date(prop.value).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : ""}
        <sup style={{ color: "blue" }}>+3</sup>
      </Text>
    </HStack>
  );
};

const ActionCell = ({ rowData }: ICellTextProps) => {
  const navigate = useNavigate();
  return (
    <HStack>
      <IconButton aria-label="Edit" icon={<ChevronDownIcon />} size="lg" />
      <IconButton
        onClick={() => {
          navigate(`/${rowData?.rowData?.id}/applicants_list`);
        }}
        aria-label="Show Details"
        icon={<ArrowForwardIcon />}
        size="lg"
      />
    </HStack>
  );
};

const ViewAllBenefits = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [validTill, setValidTill] = useState<string | null>("");
  const [createdAt, setCreatedAt] = useState<string | null>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [data, setData] = useState([]);
  const { t } = useTranslation();
  const datePickerRef = useRef<DatePicker | null>(null);
  const datePickerCreatedRef = useRef<DatePicker | null>(null);

  const fetchBenefitsData = async () => {
    const statusValues = {
      0: "ACTIVE",
      1: "CLOSED",
      2: "DRAFT",
    };

    const payload = {
      name: searchTerm || null,
      valid_till: validTill ?? null,
      created_start: createdAt ?? null,
      created_end: createdAt ?? null,
      status: statusValues[activeTab as 0 | 1 | 2],
      page_no: 0,
      page_size: 10,
      sort_by: "benefit_name",
      sort_order: sortOrder,
    };

    const response = await viewAllBenefitsData(payload);

    if (response) {
      setData(response);
    }
  };

  useEffect(() => {
    fetchBenefitsData();
  }, [activeTab, searchTerm, validTill, createdAt, sortOrder]);

  const handleTabClick = (tab: string) => {
    setActiveTab(parseInt(tab, 10));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleValidTillChange = (date: Date | null) => {
    if (date) {
      setValidTill(format(date, "yyyy-MM-dd"));
    } else {
      setValidTill(null);
    }
  };

  const handleCreatedAtChange = (date: Date | null) => {
    if (date) {
      setCreatedAt(format(date, "yyyy-MM-dd"));
    } else {
      setCreatedAt(null);
    }
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
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

          <HStack align="stretch" w="auto" spacing={2}>
            <InputGroup
              size="lg"
              borderWidth="2px"
              borderRadius="lg"
              borderColor="gray.300"
            >
              <DatePicker
                ref={datePickerRef}
                selected={validTill ? new Date(validTill) : null}
                onChange={handleValidTillChange}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select Valid Till"
                showYearDropdown
                id="validTill"
                customInput={
                  <Input
                    id="validTill"
                    isDisabled={false}
                    value={validTill ? format(validTill, "yyyy-MM-dd") : ""}
                    readOnly={true}
                  />
                }
              />
              <InputRightElement display="flex" alignItems="center" pb={2}>
                <IconButton
                  aria-label="Arrow Drop Down"
                  icon={<ChevronDownIcon />}
                  onClick={() => {
                    if (datePickerRef.current) {
                      datePickerRef.current.setOpen(true);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  color="gray.500"
                />
              </InputRightElement>
            </InputGroup>
          </HStack>

          <HStack align="stretch" w="auto" spacing={2}>
            <InputGroup
              size="lg"
              borderWidth="2px"
              borderRadius="lg"
              borderColor="gray.300"
            >
              <DatePicker
                ref={datePickerCreatedRef}
                selected={createdAt ? new Date(createdAt) : null}
                onChange={handleCreatedAtChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select Created At"
                showYearDropdown
                customInput={
                  <Input
                    id="validTill"
                    isDisabled={false}
                    value={validTill ? format(validTill, "yyyy-MM-dd") : ""}
                    readOnly={true}
                  />
                }
              />
              <InputRightElement display="flex" alignItems="center" pb={2}>
                <IconButton
                  aria-label="Arrow Drop Down"
                  icon={<ChevronDownIcon />}
                  onClick={() => {
                    if (datePickerCreatedRef.current) {
                      datePickerCreatedRef.current.setOpen(true);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  color="gray.500"
                />
              </InputRightElement>
            </InputGroup>
          </HStack>

          {/* Sort Order */}
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
        <HStack justifyContent="space-between">
          <Tab
            activeIndex={activeTab}
            handleTabClick={(index: number) =>
              handleTabClick(index.toString() as "0" | "1" | "2")
            }
            tabs={[
              { label: "Active", value: "0" },
              { label: "Closed", value: "1" },
              { label: "Drafts", value: "2" },
            ]}
          />
        </HStack>
        {data?.length > 0 ? (
          <Table
            columns={columns}
            data={data}
            rowKeyField={"id"}
            childComponents={{
              cellText: {
                content: (props: ICellTextProps) => customCellText(props),
              },
            }}
          />
        ) : (
          <Text fontSize="lg" textAlign="center" color="gray.500">
            {t("BENEFIT_LIST_TABLE_NO_DATA_MESSAGE")}
          </Text>
        )}
      </VStack>
    </Layout>
  );
};

export default ViewAllBenefits;

const customCellText = (props: ICellTextProps) => {
  switch (props.column.key) {
    case "deadline":
      return <DeadLineCell {...props} />;
    case "actions":
      return <ActionCell {...(props as any)} rowData={props} />;
    default:
      return props.value;
  }
};
