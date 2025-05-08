import React from "react";
import { VStack, Text, Box, SimpleGrid } from "@chakra-ui/react";

interface ApplicationInfoProps {
  details: { [key: string]: any };
}

const ApplicationInfo: React.FC<ApplicationInfoProps> = ({ details }) => {
  const entries = Object.entries(details);

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
      <SimpleGrid
        columns={{ base: 1, sm: 1, md: 2, lg: 2 }}
        spacingY={{ base: 6, sm: 8, md: 10 }}
        width="80%"
        paddingLeft="100px"
        justifyContent="center"
      >
        {entries.map(([key, value], index) => (
          <Box key={index}>
            <Text
              fontFamily="Poppins"
              fontWeight="700"
              fontSize="14px"
              lineHeight="20px"
              letterSpacing="0.25px"
              verticalAlign="middle"
            >
              {key
                .replace(/([A-Z])/g, " $1") // Add space before capital letters
                .replace(/^./, (c) => c.toUpperCase()) // Capitalize first letter
                .trim()}
              :
            </Text>
            <Text
              pl={4}
              fontFamily="Poppins"
              fontWeight="400"
              fontSize="14px"
              lineHeight="20px"
              letterSpacing="0.25px"
              verticalAlign="middle"
            >
              {value}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export default ApplicationInfo;
