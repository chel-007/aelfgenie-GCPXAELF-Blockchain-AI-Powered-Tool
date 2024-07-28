import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface CustomDatePickerProps {
  selectedDate: Date | null;
  handleDateChange: (date: Date | null) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ selectedDate, handleDateChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label="Select Date"
        value={selectedDate}
        onChange={handleDateChange}
        slotProps={{
          textField: {
            fullWidth: true,
          }
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
