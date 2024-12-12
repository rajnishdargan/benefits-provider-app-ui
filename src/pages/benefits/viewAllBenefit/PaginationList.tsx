import React from "react";
import { Box, Button, HStack } from "@chakra-ui/react";

interface PaginationControlsProps {
  total: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PaginationList: React.FC<PaginationControlsProps> = ({
  total,
  pageSize,
  currentPage,
  onPageChange,
}) => {
  if (total < 0 || pageSize <= 0) {
    throw new Error(
      "Invalid pagination parameters: total and pageSize must be positive"
    );
  }
  const totalPages = Math.ceil(total / pageSize);
  const pageLimit = 3; // Maximum number of page numbers to show at a time
  const startPage = Math.floor(currentPage / pageLimit) * pageLimit;
  const endPage = Math.min(startPage + pageLimit, totalPages);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <Box textAlign="center" mt={4}>
      <HStack spacing={2} justify="center">
        {currentPage > 0 && (
          <Button onClick={handlePrev} colorScheme="blue">
            Previous
          </Button>
        )}

        {Array.from({ length: endPage - startPage }, (_, index) => {
          const pageIndex = startPage + index;
          return (
            <Button
              key={pageIndex}
              onClick={() => onPageChange(pageIndex)}
              colorScheme={currentPage === pageIndex ? "blue" : "gray"}
              mx={1}
            >
              {pageIndex + 1}
            </Button>
          );
        })}

        {currentPage < totalPages - 1 && (
          <Button onClick={handleNext} colorScheme="blue">
            Next
          </Button>
        )}
      </HStack>
    </Box>
  );
};

export default PaginationList;
