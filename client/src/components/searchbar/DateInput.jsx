import dayjs from "dayjs";
import "dayjs/locale/vi"
import { Form } from "react-bootstrap";
import { CalendarDays } from "lucide-react";
import { useSearchForm } from "../../hooks/useSearchForm";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { styled, createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e11d48',
    },
  },
});

const StyledDatePickerTextField = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.primary.main,
  },
  '& .MuiOutlinedInput-root': {
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      borderColor: '#ced4da',
      boxShadow: 'none',
      transition: theme.transitions.create(['border-color', 'box-shadow'], {
        duration: 150, // 0.15s
        easing: 'ease-in-out',
      }),
    },
    [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
      borderColor: '#000000',
    },
    [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 0.15rem ${alpha(theme.palette.primary.main, 0.2)}`,
      borderWidth: '1px',
    },
    '& .MuiInputBase-input': {
      cursor: 'pointer',
      padding: '7px 12px',
    },
  },
}));

export default function DateInput({ value: propValue, onChange: propOnChange, labelText = "Ngày tổ chức" }) {
  const { state, setField } = useSearchForm();

  const tomorrow = dayjs().add(1, 'day');
  const oneYearLater = dayjs().add(1, 'year');

  const handleChange = (newValue) => {
    if (newValue && newValue.isBefore(tomorrow, 'day')) {
      // Prevent past dates
      return;
    }
    const dateStr = newValue ? newValue.format("YYYY-MM-DD") : "";
    if (typeof propOnChange === 'function') {
      propOnChange(dateStr);
    } else {
      setField("date", dateStr);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Form.Label>
          <CalendarDays className="me-1" style={{ color: '#E11D48' }} size={18} />
          {labelText}
        </Form.Label>

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          <DatePicker
            value={(propValue ? dayjs(propValue) : (state?.date ? dayjs(state.date) : null))}
            onChange={handleChange}
            disablePast
            minDate={tomorrow}
            maxDate={oneYearLater}
            slots={{ textField: StyledDatePickerTextField }}
            enableAccessibleFieldDOMStructure={false}
          />
        </LocalizationProvider>
      </div>
    </ThemeProvider>
  );
}
