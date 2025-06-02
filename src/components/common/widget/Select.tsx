import React from "react";
import { Select, FormControl, FormLabel } from "@chakra-ui/react";
import { WidgetProps } from "@rjsf/utils";

const SelectWidget: React.FC<WidgetProps> = ({
  id,
  label,
  required,
  value,
  onChange,
  options,
}) => {
  const enumOptions = options.enumOptions as { label: string; value: string }[];

  return (
    <FormControl id={id} isRequired={required} mt={4}>
      <FormLabel>{label}</FormLabel>
      <Select
        placeholder="Select an option"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        _placeholder={{ color: "blue.400", fontSize: "10px" }}
      >
        {enumOptions?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectWidget;
