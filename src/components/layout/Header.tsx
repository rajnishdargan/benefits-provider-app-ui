import React from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/Images/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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

  // Get user role from local storage

  const { isSuperAdmin } = useAuth();

  // Array of menu names
  const menuNames = [
    {
      label: "Benefit List",
      onClick: () => {
        navigate("/");
      },
    },
    {
      label: "Provider Management",
      option: [
        {
          name: "Add Provider User",
          onClick: () => {
            navigate("/admin/add-user");
          },
        },
        {
          name: "Add Provider",
          onClick: () => {
            navigate("/admin/add-role");
          },
        },
      ],
    },
    {
      label: "Log out",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
      },
    },
  ];
  // Conditionally render the Provider Management menu if userRole is "super admin"
  const filteredMenuNames = isSuperAdmin
    ? menuNames
    : menuNames.filter((menu) => menu.label !== "Provider Management");

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
          menuNames={filteredMenuNames}
        />
      </HStack>
    </Box>
  );
};

interface HeaderRightSectionProps {
  showMenu?: boolean;
  showSearchBar?: boolean; //NOSONAR
  showLanguage?: boolean;
  menuNames: MenuItem[]; // add new
}

const HeaderRightSection: React.FC<HeaderRightSectionProps> = ({
  showMenu,
  // showSearchBar,
  showLanguage,
  menuNames,
}) => {
  const location = useLocation(); // Get the current route
  return (
    //@ts-ignore
    <HStack align="center" spacing={6}>
      {/* Menu */}
      {showMenu &&
        menuNames.map((menu, index) => (
          <HStack key={menu?.label || index} align="center">
            {menu?.option ? (
              <DropdownMenu menu={menu} currentPath={location.pathname} />
            ) : (
              <Text
                fontSize="16px"
                fontWeight={
                  location.pathname === "/" && menu.label === "Benefit List"
                    ? "bold"
                    : 400
                } // Bold if active
                cursor="pointer"
                onClick={menu?.onClick}
                color={
                  location.pathname === "/" && menu.label === "Benefit List"
                    ? "blue.500"
                    : "black"
                } // Highlight if on Benefit List
              >
                {menu?.label}
              </Text>
            )}
          </HStack>
        ))}

      {/* Search Bar */}
      {/* {showSearchBar && <SearchBar />} //NOSONAR */}

      {/* Language Dropdown */}
      {showLanguage && <LanguageDropdown />}
    </HStack>
  );
};

interface DropdownMenuProps {
  menu: MenuItem;
  currentPath: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ menu, currentPath }) => {
  // Define the paths for Provider Management routes
  const providerPaths = ["/admin/add-user", "/admin/add-role"];

  // Determine if the current path matches any provider path to highlight the dropdown label
  const isActive =
    menu.label === "Provider Management" && providerPaths.includes(currentPath);

  return (
    <Menu>
      <MenuButton
        as={Text as any}
        fontWeight={isActive ? "bold" : "normal"}
        cursor="pointer"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        color={isActive ? "blue.500" : "black"}
        fontSize="16px"
      >
        <HStack spacing={1}>
          {menu?.label && (
            <Text fontWeight={isActive ? "bold" : 400}>{menu?.label}</Text>
          )}
          <ChevronDownIcon />
        </HStack>
      </MenuButton>
      <MenuList>
        {menu?.option?.map((submenuItem: MenuOption, subIndex: number) => (
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
};

/*
const SearchBar: React.FC = () => (
  <HStack align="center">
    <InputGroup maxWidth="300px" rounded={"full"} size="lg">
      <Input placeholder="Search For Benefit" rounded={"full"} bg="#E9E7EF" />
      <InputRightElement>
        <SearchIcon color="gray.500" />
      </InputRightElement>
    </InputGroup>
  </HStack>
); //NOSONAR
*/

const LanguageDropdown: React.FC = () => (
  <Select borderRadius="8" size="sm" width="100px">
    <option value="en">English</option>
  </Select>
);

export default Header;
