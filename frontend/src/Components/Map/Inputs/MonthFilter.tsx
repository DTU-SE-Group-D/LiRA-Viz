import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import '../../../css/month_filter.css';

interface Props {
  /** function taking argument "date" for Start Date **/
  onStartChange: (date: any) => void;
  /** function taking argument "date" for End date **/
  onEndChange: (date: any) => void;
}

const CustomInput = ({
  value,
  onClick,
}: {
  value: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => (
  <button className="month-custom-input" onClick={onClick}>
    {value}
  </button>
);

/**
 * Component rendering Month Filter
 */

const MonthFilter: React.FC<Props> = ({ onEndChange, onStartChange }) => {
  const [startDate, setStartDate] = useState(new Date('2022/06/08'));
  const [endDate, setEndDate] = useState(new Date());
  return (
    <>
      <div className="datepicker">
        <DatePicker
          selected={startDate}
          onSelect={(date: any) => setStartDate(date)}
          onChange={onStartChange}
          customInput={React.createElement(CustomInput)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          minDate={new Date('2022/06/08')}
          maxDate={new Date()}
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
          startDate={startDate}
          endDate={endDate}
          minDate={new Date('2022/06/08')}
          maxDate={new Date()}
          dateFormat="MM/yyyy"
          showMonthYearPicker
        />
      </div>
    </>
  );
};

export default MonthFilter;
