import React from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { WidgetProps } from "@rjsf/utils";

const DatePickerWidget: React.FC<WidgetProps> = ({
  id,
  label,
  required,
  value,
  onChange,
}) => {
  return (
    <FormControl id={id} isRequired={required} mt={4}>
      <FormLabel>{label}</FormLabel>
      <Input
        type="date"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormControl>
  );
};

export default DatePickerWidget;
