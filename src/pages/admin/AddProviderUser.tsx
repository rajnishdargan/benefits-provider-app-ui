import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  HStack,
  InputGroup,
  InputRightElement,
  IconButton,
  FormErrorMessage,
  InputLeftElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, EmailIcon, LockIcon } from "@chakra-ui/icons";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createUser, getRoles } from "../../services/auth";

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
}

const AddProviderUser: React.FC = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch roles when component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching roles:", error);
        showToast("Error", "Failed to fetch roles. Please try again.", "error");
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [toast]);

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/");
    }
  }, [isSuperAdmin, navigate]);

  // Validate password match
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);
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
    if (password !== confirmPassword) {
      showToast("Error", "Passwords do not match.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await createUser(firstname, lastname, email, password, role);
      showToast(
        "User created",
        "The user has been created successfully",
        "success"
      );

      // Reset form
      setFirstname("");
      setLastname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("");
    } catch (error) {
      console.log(" Error in create user :", error);

      showToast("Error", "Failed to create user. Please try again.", "error");
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
        title: "Add a new provider user",
      }}
    >
      <Box p={8} bg="gray.50" minH="100vh">
        <VStack spacing={8} align="stretch" maxW="800px" mx="auto">
          <Box bg="white" shadow="md" borderRadius="lg" p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <HStack spacing={4} width="full">
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" color="gray.700">
                      First Name
                    </FormLabel>
                    <InputGroup>
                      <Input
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        placeholder="Enter first name"
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
                      Last Name
                    </FormLabel>
                    <InputGroup>
                      <Input
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        placeholder="Enter last name"
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
                </HStack>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">
                    Email
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <EmailIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
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

                <FormControl isRequired isInvalid={!!passwordError}>
                  <FormLabel fontWeight="medium" color="gray.700">
                    Password
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <LockIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      size="lg"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px #3182ce",
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired isInvalid={!!passwordError}>
                  <FormLabel fontWeight="medium" color="gray.700">
                    Confirm Password
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <LockIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      size="lg"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px #3182ce",
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        icon={
                          showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />
                        }
                        variant="ghost"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    </InputRightElement>
                  </InputGroup>
                  {passwordError && (
                    <FormErrorMessage>{passwordError}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">
                    Select Provider
                  </FormLabel>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Select Provider"
                    isDisabled={isLoadingRoles}
                    size="lg"
                    bg="white"
                    borderColor="gray.200"
                    _hover={{ borderColor: "gray.300" }}
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px #3182ce",
                    }}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id.toString()}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  isDisabled={
                    (!firstname ||
                      !lastname ||
                      !email ||
                      !password ||
                      !confirmPassword ||
                      !role ||
                      isLoadingRoles) ??
                    !!passwordError
                  }
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                  _active={{ transform: "translateY(0)" }}
                >
                  Add Provider User
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Box>
    </Layout>
  );
};

export default AddProviderUser;
