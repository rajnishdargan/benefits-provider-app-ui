import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  InputGroup,
  Textarea,
} from "@chakra-ui/react";

import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createRole } from "../../services/auth";

const AddProvider: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/");
    }
  }, [isSuperAdmin, navigate]);
  const showToast = (
    title: string,
    description: string,
    status: "success" | "error"
  ) => {
    toast({
      title,
      description,
      status,
      duration: 5000,
      isClosable: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createRole(name, description);

      showToast(
        "Provider created",
        "The provider has been created successfully",
        "success"
      );

      // Reset form
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error creating provider:", error);
      showToast(
        "Error",
        "Failed to create provider. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      showMenu={true}
      showSearchBar={false}
      showLanguage={false}
      _titleBar={{
        title: "Add a new provider ",
      }}
    >
      <Box p={8} bg="gray.50" minH="100vh">
        <VStack spacing={8} align="stretch" maxW="800px" mx="auto">
          <Box bg="white" shadow="md" borderRadius="lg" p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">
                    Provider Name
                  </FormLabel>
                  <InputGroup>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter provider name"
                      size="lg"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px #3182ce",
                      }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">
                    Provider Description
                  </FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter provider description"
                    size="lg"
                    bg="white"
                    borderColor="gray.200"
                    _hover={{ borderColor: "gray.300" }}
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px #3182ce",
                    }}
                    minH="120px"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  isDisabled={!name || !description}
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                  _active={{ transform: "translateY(0)" }}
                >
                  Add Provider
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Box>
    </Layout>
  );
};

export default AddProvider;
