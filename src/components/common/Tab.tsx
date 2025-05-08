import React from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabIndicator,
  HStack,
  Box,
  Text,
} from "@chakra-ui/react";

interface TabItem {
  label: string;
  value: string;
}

interface CustomTabProps {
  tabs: TabItem[];
  activeIndex: number;
  handleTabClick: (index: number) => void;
}

const CustomTab: React.FC<CustomTabProps> = ({
  tabs,
  activeIndex,
  handleTabClick,
}) => {
  return (
    <Tabs
      position="relative"
      variant="unstyled"
      index={activeIndex}
      onChange={handleTabClick}
    >
      <TabList>
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;

          return (
            <Tab
              key={tab.value || index}
              pb={2}
              _hover={{ outline: "none", borderColor: "white" }}
              _focus={{ outline: "none", borderColor: "blue.500" }}
            >
              <HStack spacing={2}>
                <Box
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={isActive ? "#30713D" : "white"}
                />
                <Text fontSize="16px" fontWeight={400}>
                  {tab.label}
                </Text>
              </HStack>
            </Tab>
          );
        })}
      </TabList>
      <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
    </Tabs>
  );
};

export default CustomTab;
