import {
  Button,
  FormControl,
  HStack,
  Stack,
  VStack,
  PinInput,
  PinInputField,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import LeftSideBar from "../../components/common/login/LeftSideBar";
import Loading from "../../components/common/Loading";

export default function OTP() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [otp, setOtp] = React.useState();
  const [isSubmitDisabled, setIsSubmitDisabled] = React.useState(true);
  const [timer, setTimer] = React.useState(300);
  const otpArray = Array(6).fill("");
  const [isLoading, setIsLoading] = React.useState(false);
  const fromPage = location?.state?.fromPage || "login";
  const handleChange = (element: any) => {
    setOtp(element);
    setIsSubmitDisabled(element.length !== 6);
  };

  React.useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };
  const handleOtp = async () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("token", "true");
      navigate("/home");
      window.location.reload();
    }, 3000);
    return () => clearTimeout(timer);
  };

  return (
    <Layout showMenu={false} showSearchBar={false} showLanguage={true}>
      {isLoading ? (
        <Loading />
      ) : (
        <HStack w="full" h="88vh" spacing={8} align="stretch">
          <LeftSideBar />
          <VStack p={8} flex={1} align={"center"} justify={"center"}>
            <Stack spacing={4} w={"full"}>
              <Text fontSize={"24px"} fontWeight={400} marginBottom={"20px"}>
                {fromPage === "registration"
                  ? t("REGISTER_TITLE")
                  : t("LOGIN_OTP_TITLE")}
              </Text>
              <Text fontSize={"16px"} fontWeight={400} marginBottom={"20px"}>
                {t("OTP_WELCOME_TEXT")}
              </Text>
              <FormControl id="email">
                <Text fontSize={"16px"} fontWeight={400} marginBottom={"20px"}>
                  {t("OTP_ENTER_OTP_LABEL")}
                </Text>

                <HStack>
                  <PinInput
                    size="lg"
                    value={otp}
                    onChange={(e) => handleChange(e)}
                    otp
                  >
                    {otpArray?.map((feild) => {
                      return (
                        <PinInputField
                          key={feild}
                          type="text"
                          w={"100.67px"}
                          placeholder=""
                          borderRadius={"0px"}
                        />
                      );
                    })}
                  </PinInput>
                </HStack>
              </FormControl>
              <Stack spacing={6}>
                <HStack marginBottom={"14px"}>
                  <Text fontSize={"16px"} fontWeight={400}>
                    {t("OTP_RESEND_REQUEST_TEXT")}
                  </Text>
                  <Text
                    fontSize={"16px"}
                    fontWeight={400}
                    color={"#0037b9"}
                    borderBottom={"1px solid #0037b9"}
                    textUnderlineOffset={"1px"}
                  >
                    <Link to="#" className="custom-link">
                      {t("OTP_RESEND_REQUEST_LINK")}
                    </Link>
                  </Text>
                  <Text fontSize={"16px"} fontWeight={400}>
                    in {formatTime(timer)}
                  </Text>
                </HStack>

                <Button
                  colorScheme={"blue"}
                  variant={"solid"}
                  borderRadius={"100px"}
                  isDisabled={isSubmitDisabled}
                  onClick={() => handleOtp()}
                >
                  <Text fontSize={"14px"} fontWeight={400}>
                    {fromPage === "registration"
                      ? t("REGISTER_OTP_SUBMIT_BUTTON")
                      : t("LOGIN_OTP_SUBMIT_BUTTON")}
                  </Text>
                </Button>
              </Stack>
            </Stack>
          </VStack>
        </HStack>
      )}
    </Layout>
  );
}
