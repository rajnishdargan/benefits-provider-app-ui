import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Text,
} from "@chakra-ui/react";

const AlertMessage = ({
  messageData,
  show,
  close,
}: {
  messageData: string;
  show: boolean;
  close: () => void;
}) => {
  return (
    <Modal isOpen={show} onClose={close} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Message</ModalHeader>
        <ModalBody>
          <Text>{messageData || "An unexpected error occurred."}</Text>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={close}>
            Okay
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default AlertMessage;
