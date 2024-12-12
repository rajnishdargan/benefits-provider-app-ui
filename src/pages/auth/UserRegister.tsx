import React from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import LeftSideBar from "../../components/common/login/LeftSideBar";
import { registerProvider } from "../../services/auth";
import Loading from "../../components/common/Loading";
import ModalShow from "../../components/common/modal/ModalShow";
import AlertMessage from "../../components/common/modal/AlertMessage";
export default function UserRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = React.useState(false);
  const [userName, setUserName] = React.useState("");
  const [name, setName] = React.useState("");
  const [mobile, setMobile] = React.useState("");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [showTooltip, setShowTooltip] = React.useState(false);

  const [errors, setErrors] = React.useState({
    email: "",
    name: "",
    userName: "",
    password: "",
    mobile: "",
    gender: "",
  });

  const validateField = (field: any, value: any) => {
    let error = "";

    if (field === "email") {
      if (!value.trim()) {
        error = "Email is required.";
      } else if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
      ) {
        error = "Invalid email address.";
      }
    } else if (field === "name") {
      if (!value.trim()) {
        error = "Name is required.";
      } else if (!/^[a-zA-Z\s]{2,50}$/.test(value)) {
        error =
          "Name must be 2-50 characters long and contain only letters and spaces.";
      }
    } else if (field === "mobile") {
      if (!value.trim()) {
        error = "Mobile number is required.";
      } else if (!/^\d{10}$/.test(value)) {
        error = "Mobile number must be 10 digits.";
      }
    } else if (field === "userName") {
      if (!value.trim()) {
        error = "Username is required.";
      } else if (!/^\w{3,15}$/.test(value)) {
        error =
          "Username must be 3-15 characters and can only contain letters, numbers, or underscores.";
      }
    } else if (field === "password") {
      if (!value.trim()) {
        error = t("LOGIN_PASSWORD_REQUIRED_HELPER_TEXT");
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
          value
        )
      ) {
        error = t("REGISTER_PASSWORD_LENGTH_HELPER_TEXT");
      }
    } else if (field === "gender") {
      if (!value) {
        error = "Gender is required.";
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
  };

  const handleRegister = async () => {
    const isValid =
      Object.values(errors).every((error) => error === "") &&
      userName &&
      name &&
      email &&
      password &&
      gender &&
      mobile;

    if (!isValid) {
      return;
    }
    setIsLoading(true);

    try {
      const registerResponse = await registerProvider(
        userName,
        name,
        email,
        password,
        gender,
        mobile
      );
      if (registerResponse?.responseInfo?.status === "200") {
        setIsLoading(false);
        setMessage("Register successfully!");
        setShowAlert(true);
      } else {
        setMessage(t("REGISTER_ERROR"));
        setShowAlert(true);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t("REGISTER_ERROR"));
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCloseAlertModal = () => {
    setShowAlert(false);
    navigate("/");
  };
  const handleCloseModal = () => {
    setOpen(false);
    setIsChecked(true);
  };
  const handleInputChange = (field: any, value: any) => {
    validateField(field, value);
    switch (field) {
      case "email":
        setEmail(value);
        break;
      case "name":
        setName(value);
        break;
      case "mobile":
        setMobile(value);
        break;
      case "userName":
        setUserName(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "gender":
        setGender(value);
        break;
      default:
        break;
    }
  };
  return (
    <Layout showMenu={false} showSearchBar={false} showLanguage={true}>
      {isLoading ? (
        <Loading />
      ) : (
        <HStack w="full" h="100vh" spacing={8} align="stretch">
          <LeftSideBar />
          <VStack p={8} flex={1} align={"center"} justify={"center"} w={"full"}>
            <Stack spacing={6} w={"full"}>
              <Text fontSize={"24px"} fontWeight={400} marginTop={"20px"}>
                {t("REGISTER_TITLE")}
              </Text>

              <FormControl id="name" isInvalid={!!errors.name}>
                <Text fontSize={"16px"} fontWeight={400} marginBottom={"8px"}>
                  {t("REGISTER_NAME_LABEL")}
                </Text>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter name"
                  isRequired
                  marginBottom={"12px"}
                />
                {errors.name && (
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl id="userName" isInvalid={!!errors.userName}>
                <Text fontSize={"16px"} fontWeight={400} marginBottom={"8px"}>
                  {t("REGISTER_ORGANISATION_NAME_LABEL")}
                </Text>
                <Input
                  type="text"
                  value={userName}
                  onChange={(e) =>
                    handleInputChange("userName", e.target.value)
                  }
                  placeholder="Enter username"
                  isRequired
                  marginBottom={"12px"}
                />
                {errors.userName && (
                  <FormErrorMessage>{errors.userName}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl id="email" isInvalid={!!errors.email}>
                <Text fontSize={"16px"} fontWeight={400} marginBottom={"8px"}>
                  {t("REGISTER_EMAIL_ID_LABEL")}
                </Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email ID"
                  isRequired
                  marginBottom={"8px"}
                />
                {errors.email && (
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl id="mobile" isInvalid={!!errors.mobile}>
                <Text fontSize={"16px"} fontWeight={400} marginBottom={"8px"}>
                  {t("REGISTER_MOBILE_NUMBER_LABEL")}
                </Text>
                <Input
                  type="text"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleInputChange("mobile", value);
                  }}
                  placeholder="Enter mobile number"
                  isRequired
                  marginBottom={"8px"}
                />
                {errors.mobile && (
                  <FormErrorMessage>{errors.mobile}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl id="gender" isInvalid={!!errors.gender}>
                <FormLabel
                  fontSize={"16px"}
                  fontWeight={400}
                  marginBottom={"8px"}
                >
                  {t("REGISTER_GENDER_LABEL")}
                </FormLabel>
                <RadioGroup
                  onChange={(value) => handleInputChange("gender", value)}
                  value={gender}
                  marginBottom={"8px"}
                >
                  <HStack spacing="24px">
                    <Radio value="male">{t("REGISTER_GENDER_MALE")}</Radio>
                    <Radio value="female">{t("REGISTER_GENDER_FEMALE")}</Radio>
                  </HStack>
                </RadioGroup>
                {errors.gender && (
                  <FormErrorMessage>{errors.gender}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl id="password" isInvalid={!!errors.password}>
                <Text fontSize={"16px"} fontWeight={400} marginBottom={"8px"}>
                  {t("REGISTER_PASSWORD_LABEL")}
                </Text>
                <Input
                  type="password"
                  value={password}
                  autoComplete="new-password"
                  data-private
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter password"
                  isRequired
                  marginBottom={"12px"}
                />
                {errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
              </FormControl>

              <Stack spacing={6}>
                <Stack
                  direction={{ base: "column", sm: "column" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <HStack marginBottom={"14px"}>
                    <Text fontSize={"16px"} fontWeight={400}>
                      {t("REGISTER_TERMS_AND_CONDTION_TEXT")}
                    </Text>
                    <Text
                      fontSize={"16px"}
                      fontWeight={400}
                      color={"#0037b9"}
                      textUnderlineOffset={"1px"}
                    >
                      <Link
                        to="#"
                        className="custom-link"
                        onClick={() => setOpen(true)}
                      >
                        {t("REGISTER_TERMS_AND_CONDTION_TITLE")}
                      </Link>{" "}
                    </Text>
                    <Text fontSize={"16px"} fontWeight={400}>
                      {t("REGISTER_TERMS_AND_CONDTION_SUBTEXT")}
                    </Text>
                  </HStack>
                  <Tooltip
                    isOpen={showTooltip}
                    onClose={() => setShowTooltip(false)}
                    label="Please click on Terms and Condition Link"
                    placement="top"
                  >
                    <Checkbox
                      isChecked={isChecked}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <Text fontSize={"16px"} fontWeight={400}>
                        {t("REGISTER_TERMS_AND_CONDTION_SELECT")}
                      </Text>
                    </Checkbox>
                  </Tooltip>
                </Stack>
                <Button
                  colorScheme={"blue"}
                  variant={"solid"}
                  mb={"10px"}
                  borderRadius={"100px"}
                  isDisabled={
                    !isChecked ||
                    !email ||
                    !name ||
                    !password ||
                    !mobile ||
                    !userName ||
                    !gender ||
                    !Object.values(errors).every((error) => error === "")
                  }
                  onClick={() => handleRegister()}
                >
                  <Text fontSize="14px" fontWeight="400">
                    {t("REGISTER_PROCEED_BUTTON")}
                  </Text>
                </Button>
              </Stack>
            </Stack>
          </VStack>
        </HStack>
      )}
      {open && <ModalShow show={open} close={handleCloseModal} />}
      {showAlert && (
        <AlertMessage
          messageData={message}
          show={showAlert}
          close={handleCloseAlertModal}
        />
      )}
    </Layout>
  );
}
