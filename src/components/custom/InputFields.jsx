import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Field } from "react-final-form";
import { useState } from "react";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";

export const MonthYearPicker = ({ name }) => {
  const required = (value) => (value ? undefined : "This field is required");

  return (
    <Field name={name} validate={required}>
      {({ input, meta }) => (
        <div className="flex flex-col w-fit">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={["year", "month"]}
              label="Select Month & Year"
              value={input.value ? dayjs(input.value, "MMMM YYYY") : null}
              onChange={(newValue) => {
                input.onChange(newValue ? newValue.format("MMMM YYYY") : "");
              }}
              slotProps={{
                textField: {
                  size: "small",
                  error: meta.touched && meta.error ? true : false,
                  helperText: meta.touched && meta.error ? meta.error : "",
                  sx: {
                    width: "200px", // Sets a fixed width for the input
                    minWidth: "180px", // Ensures it doesn't get too small
                    "& .MuiInputBase-root": {
                      height: "36px !important",
                      fontSize: "14px !important",
                      padding: "4px 10px !important",
                      borderColor:
                        meta.touched && meta.error ? "red !important" : "",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "13px !important",
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: "18px !important",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>

          {/* Error Message */}
          {meta.touched && meta.error && (
            <span className="text-red-500 text-xs mt-1">{meta.error}</span>
          )}
        </div>
      )}
    </Field>
  );
};

export const CustomSelect = ({ name, options, initialSelected = null }) => {
  const [selected, setSelected] = useState(initialSelected);

  const required = (value) => (value ? undefined : "This field is required");

  return (
    <Field name={name} validate={required}>
      {({ input, meta }) => (
        <div>
          <Listbox
            value={selected}
            onChange={(value) => {
              setSelected(value);
              input.onChange(value ? value.value : ""); // Store only value in Final Form
            }}
          >
            {({ open }) => (
              <div className="relative w-full">
                {/* Selected Button */}
                <ListboxButton
                  className={`w-full p-2 border rounded-md bg-white text-sm shadow-sm cursor-pointer 
                  flex justify-between items-center
                  ${
                    meta.error && meta.touched
                      ? "border-red-500"
                      : "border-gray-300"
                  } 
                  ${selected ? "text-black" : "text-gray-400"}`}
                >
                  {selected ? selected.label : "Select Investment"}

                  {/* Custom Dropdown Arrow */}
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06 0L10 10.94l3.71-3.73a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </ListboxButton>

                {/* Dropdown List */}
                <ListboxOptions
                  className="absolute w-full bg-white border border-gray-300 rounded-md 
                            shadow-lg mt-1 z-50 text-sm md:bottom-full md:mb-2"
                >
                  {options.map((option) => (
                    <ListboxOption
                      key={option.value}
                      value={option}
                      className={({ active }) =>
                        `p-2 cursor-pointer flex items-center ${
                          active ? "bg-blue-400 text-white" : "text-gray-900"
                        }`
                      }
                    >
                      {option.label}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            )}
          </Listbox>

          {/* Error Message */}
          {meta.error && meta.touched && (
            <span className="text-red-500 text-xs">{meta.error}</span>
          )}
        </div>
      )}
    </Field>
  );
};
