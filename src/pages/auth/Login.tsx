import { useState } from "react";
import {
  Button,
  FormControl,
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
// import { LoginProvider } from "../../services/auth";
import Loading from "../../components/common/Loading";
// import AlertMessage from "../../components/common/modal/AlertMessage";
export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [showAlert, setShowAlert] = useState(false);
  // const [message, setMessage] = useState("");
  const handleLogin = async () => {
    setIsLoading(true);
    localStorage.setItem("Email", email);
    // try {
    //   const loginResponse = await LoginProvider(email);
    //   if (loginResponse) {

    const timer = setTimeout(() => {
      setIsLoading(false);
      navigate("/otp", { state: { fromPage: "login" } });
    }, 3000);
    return () => clearTimeout(timer);

    // } else {
    //   setIsLoading(false);
    //   setMessage(t("LOGIN_ERROR"));
    //   setShowAlert(true);
    // }
    // } catch (err) {
    //   setIsLoading(false);
    //   setMessage(err as string);
    //   setShowAlert(true);
    // }
  };

  // const handleCloseAlertModal = () => {
  //   setShowAlert(false);
  // };

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
                  type="email"
                  w={"full"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isRequired
                  marginTop={"14px"}
                  placeholder="Organisation Email"
                />
              </FormControl>

              <Stack spacing={6}>
                <Button
                  colorScheme={"blue"}
                  variant={"solid"}
                  borderRadius={"100px"}
                  isDisabled={email === ""}
                  onClick={handleLogin}
                >
                  <Text fontSize={"14px"} fontWeight={400}>
                    {t("LOGIN_LOGIN_BUTTON")}
                  </Text>
                </Button>
                <Button
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
                </Button>
              </Stack>
            </Stack>
          </VStack>
        </HStack>
      )}

      {/* {showAlert && (
        <AlertMessage
          message={message}
          show={showAlert}
          close={handleCloseAlertModal}
        />
      )} */}
    </Layout>
  );
}
