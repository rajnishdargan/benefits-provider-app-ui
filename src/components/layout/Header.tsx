import React from "react";
import { SearchIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/Images/logo.png";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showMenu?: boolean;
  showSearchBar?: boolean;
  showLanguage?: boolean;
}
interface MenuOption {
  name: string;
  icon?: React.ReactElement; // icon can be a React node
  onClick?: () => void; // optional click handler
}

interface MenuItem {
  label: string;
  option?: MenuOption[];
  onClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  showMenu,
  showSearchBar,
  showLanguage,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Array of menu names
  const menuNames = [
    {
      label: "Dashboard",
      onClick: () => {
        navigate("/");
      },
    },
    // {
    //   label: "Quick Actions",
    //   option: [
    //     {
    //       name: "Create",
    //       icon: <AddIcon />,
    //       onClick: () => {
    //         navigate("/benefits/form");
    //       },
    //     },
    //     { name: "Edit", icon: <EditIcon /> },
    //   ],
    // },
    {
      label: "Log out",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
      },
    },
  ];

  return (
    <Box
      w="100%"
      p={4}
      boxShadow="md"
      position="sticky"
      top={0}
      zIndex="11"
      bg="white"
    >
      <HStack
        align="center"
        justify="space-between" // Keeps left and right sections apart
        w="100%"
      >
        {/* Left Section: Logo and Company Name */}
        <HStack>
          <img
            src={Logo}
            alt="Logo"
            style={{ width: "40px", marginRight: "8px" }}
          />
          <Text color="#484848" fontWeight={500} fontSize={"28px"}>
            {t("LEFTSIDE_CONTENT_HEADER_COMPANY_NAME")}
          </Text>
        </HStack>

        {/* Right Section: Menu, Search Bar, and Language Bar */}
        <HeaderRightSection
          showMenu={showMenu}
          showSearchBar={showSearchBar}
          showLanguage={showLanguage}
          menuNames={menuNames}
        />
      </HStack>
    </Box>
  );
};

interface HeaderRightSectionProps {
  showMenu?: boolean;
  showSearchBar?: boolean;
  showLanguage?: boolean;
  menuNames: MenuItem[]; // add new
}

const HeaderRightSection: React.FC<HeaderRightSectionProps> = ({
  showMenu,
  showSearchBar,
  showLanguage,
  menuNames,
}) => {
  return (
    //@ts-ignore
    <HStack align="center" spacing={6}>
      {/* Menu */}
      {showMenu &&
        menuNames.map((menu, index) => (
          <HStack key={menu?.label || index} align="center">
            {menu?.option ? (
              <DropdownMenu menu={menu} />
            ) : (
              <Text
                fontSize="16px"
                fontWeight={400}
                cursor="pointer"
                onClick={menu?.onClick}
              >
                {menu?.label}
              </Text>
            )}
          </HStack>
        ))}

      {/* Search Bar */}
      {showSearchBar && <SearchBar />}

      {/* Language Dropdown */}
      {showLanguage && <LanguageDropdown />}
    </HStack>
  );
};

const DropdownMenu: React.FC<{ menu: any }> = ({ menu }) => (
  <Menu>
    <MenuButton
      as={Text as any}
      fontWeight="bold"
      cursor="pointer"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <HStack spacing={1}>
        {menu?.label && (
          <Text fontSize={"16px"} fontWeight={400}>
            {menu?.label}
          </Text>
        )}
        <ChevronDownIcon />
      </HStack>
    </MenuButton>
    <MenuList>
      {menu?.option.map((submenuItem: MenuOption, subIndex: number) => (
        <MenuItem
          key={submenuItem.name || subIndex}
          icon={submenuItem.icon}
          cursor="pointer"
          onClick={submenuItem.onClick}
        >
          {submenuItem.name}
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
);

const SearchBar: React.FC = () => (
  <HStack align="center">
    <InputGroup maxWidth="300px" rounded={"full"} size="lg">
      <Input placeholder="Search For Benefit" rounded={"full"} bg="#E9E7EF" />
      <InputRightElement>
        <SearchIcon color="gray.500" />
      </InputRightElement>
    </InputGroup>
  </HStack>
);

const LanguageDropdown: React.FC = () => (
  <Select borderRadius="8" size="sm" width="100px">
    <option value="en">English</option>
  </Select>
);

export default Header;
