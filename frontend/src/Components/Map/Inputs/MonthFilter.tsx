import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import '../../../css/month_filter.css';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomInputProps {
  /** The date (the value of the date picker) **/
  value: string;
  /** The function to call when the button is clicked **/
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

/**
 * Component rendering the custom input (where the date is) for the datepicker
 *
 * A class component is used to remove the following warning:
 * Function components cannot be given refs. Attempts to access this ref will fail.
 *
 * @author Hansen
 */
class CustomInput extends React.Component<CustomInputProps> {
  constructor(props: CustomInputProps) {
    super(props);
  }
  render() {
    return (
      <button className="month-custom-input" onClick={this.props.onClick}>
        {this.props.value}
      </button>
    );
  }
}

interface MonthFilterProps {
  /** function taking argument "date" for Start Date **/
  onStartChange: (date: any) => void;
  /** function taking argument "date" for End date **/
  onEndChange: (date: any) => void;
  /** The minimum & maximum date possible **/
  minDate: Date;
  maxDate: Date;
}

/**
 * Component rendering Month Filter
 *
 * @author Hansen
 */
const MonthFilter: React.FC<MonthFilterProps> = ({
  onEndChange,
  onStartChange,
  minDate,
  maxDate,
}) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    setStartDate(minDate);
    setEndDate(maxDate);
  }, [minDate, maxDate]);

  return (
    <>
      <div className="datepicker">
        <DatePicker
          selected={startDate}
          onSelect={(date: any) => setStartDate(date)}
          onChange={onStartChange}
          customInput={React.createElement(CustomInput)}
          selectsStart
          openToDate={minDate}
          minDate={minDate}
          maxDate={maxDate}
          dateFormat="MM/yyyy"
          showMonthYearPicker
        />
      </div>
      <div className="datepicker">
        <DatePicker
          selected={endDate}
          onSelect={(date: any) => setEndDate(date)}
          onChange={onEndChange}
          customInput={React.createElement(CustomInput)}
          selectsEnd
          openToDate={maxDate}
          minDate={startDate}
          maxDate={maxDate}
          dateFormat="MM/yyyy"
          showMonthYearPicker
        />
      </div>
    </>
  );
};

export default MonthFilter;
