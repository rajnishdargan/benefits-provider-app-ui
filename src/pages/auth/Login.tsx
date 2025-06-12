import { useState } from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import LeftSideBar from "../../components/common/login/LeftSideBar";
import { LoginProvider } from "../../services/auth";
import Loading from "../../components/common/Loading";
import AlertMessage from "../../components/common/modal/AlertMessage";
export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const validate = () => {
    const errors: { username?: string; password?: string } = {};

    if (!userName.trim()) {
      errors.username = "Username is required.";
    }
    if (!password.trim()) {
      errors.password = t("LOGIN_PASSWORD_REQUIRED_HELPER_TEXT");
    } else if (password.length < 6) {
      errors.password = t("LOGIN_PASSWORD_LENGTH_HELPER_TEXT");
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return errors;
    }

    setIsLoading(true);
    try {
      const loginResponse = await LoginProvider(userName, password);
      if (loginResponse?.token) {
        localStorage.setItem("token", loginResponse?.token);
        if (loginResponse?.user?.s_roles?.[0]) {
          localStorage.setItem("userRole", loginResponse.user.s_roles[0]);
        }
        setIsLoading(false);
        setMessage("Login successfully!");
        navigate(0);
      } else {
        setIsLoading(false);
        setMessage(loginResponse?.response?.data?.error_description);
        setShowAlert(true);
        navigate(0);
      }
    } catch (err) {
      setIsLoading(false);
      setMessage(err as string);
      setShowAlert(true);
      navigate(0);
    }
  };
  const handleCloseAlertModal = () => {
    setShowAlert(false);
    navigate(0);
  };

  return (
    <Layout showMenu={false} showSearchBar={false} showLanguage={true}>
      {isLoading ? (
        <Loading />
      ) : (
        <HStack w="full" h="89vh" spacing={8} align="stretch" overflow="hidden">
          <LeftSideBar />

          <VStack
            p={8}
            spacing={4}
            flex={1}
            align={"center"}
            justify={"center"}
            w={"full"}
            h={"full"}
            overflow="hidden"
          >
            <Stack spacing={4} w={"full"}>
              <Text
                fontSize={"24px"}
                fontWeight={400}
                textAlign={"left"}
                marginBottom={"14px"}
              >
                {t("LOGIN_TITLE")}
              </Text>
              <FormControl id="email" mt={60}>
                <Text fontSize={"16px"} fontWeight={400}>
                  {t("LOGIN_EMAIL_ID_LABEL")}
                </Text>
                <Input
                  type="text"
                  w={"full"}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  isRequired
                  marginTop={"14px"}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <FormErrorMessage>{errors.username}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl id="email" mt={60}>
                <Text fontSize={"16px"} fontWeight={400}>
                  {t("LOGIN_PASSWORD_LABEL")}
                </Text>
                <Input
                  type="password"
                  w={"full"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isRequired
                  marginTop={"14px"}
                  placeholder="Enter password"
                />
                {errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
              </FormControl>

              <Stack spacing={6}>
                <Button
                  colorScheme={"blue"}
                  variant={"solid"}
                  borderRadius={"100px"}
                  isDisabled={!userName.trim() || !password.trim()}
                  onClick={handleLogin}
                >
                  <Text fontSize={"14px"} fontWeight={400}>
                    {t("LOGIN_LOGIN_BUTTON")}
                  </Text>
                </Button>
                {/* //NOSONAR <Button
                  colorScheme={"blue"}
                  variant={"outline"}
                  borderRadius={"100px"}
                  onClick={() => {
                    navigate("/user/register");
                  }}
                >
                  <Text fontSize={"14px"} fontWeight={400}>
                    {t("LOGIN_REGISTER_BUTTON")}
                  </Text>
                </Button> */}
              </Stack>
            </Stack>
          </VStack>
        </HStack>
      )}

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
