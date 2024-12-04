import { HStack, Image, VStack } from "@chakra-ui/react";
import Logo from "../../../assets/Images/Frame.png";

export default function LeftSideBar() {
  return (
    <VStack
      flex={1}
      backgroundColor={"#121943"}
      align={"center"}
      justify={"center"}
      h="100vh"
      overflow="hidden"
    >
      <HStack>
        <Image src={Logo} />
      </HStack>
    </VStack>
  );
}
