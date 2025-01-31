import React, { useState, useEffect } from "react";

const DateTimeSelector = ({ initialDateTime, onDateTimeChange }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateDisplay, setSelectedDateDisplay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const businessHours = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  useEffect(() => {
    if (!initialDateTime) return;
  
    // Example: "Mon, Jan 27, 2025, 9:00 AM"
    const parts = initialDateTime.split(", ");
    if (parts.length !== 4) return;
  
    const [dayAndMonth, day, year, time] = parts;
    const dateDisplay = `${dayAndMonth}, ${day}`;
  
    setSelectedDateDisplay(dateDisplay);
    setSelectedDate(dateDisplay);
    setSelectedYear(year);
  
    if (businessHours.includes(time)) {
      setSelectedTime(time);
    } else {
      setSelectedTime("9:00 AM");
      onDateTimeChange(`${dateDisplay}, ${year}, 9:00 AM`);
    }
  }, [initialDateTime]);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    // If we have an initial date, parse it and add it if it's not in our range
    let initialDate = null;
    if (initialDateTime) {
      const [dayAndMonth, day, year] = initialDateTime.split(", ");
      initialDate = new Date(`${dayAndMonth}, ${day}, ${year}`);
    }
  
    // Add next 7 days
    for (let i = 1; i < 8; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
  
      const display = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
  
      dates.push({
        value: display,
        display,
      });
    }
  
    // Add initial date if it exists and isn't already in our list
    if (initialDate) {
      const initialDateStr = initialDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
  
      if (!dates.some(d => d.value === initialDateStr)) {
        dates.unshift({
          value: initialDateStr,
          display: initialDateStr,
        });
      }
    }
  
    // Sort dates chronologically
    dates.sort((a, b) => new Date(a.value) - new Date(b.value));
    
    return dates;
  };

  const handleDateTimeChange = (type, value) => {
    if (type === "date") {
      setSelectedDate(value);
      setSelectedDateDisplay(value);
  
      if (selectedTime) {
        const [dayAndMonth, day] = value.split(", ");
        onDateTimeChange(
          `${dayAndMonth}, ${day}, ${selectedYear}, ${selectedTime}`
        );
      }
    } else {
      if (businessHours.includes(value)) {
        setSelectedTime(value);
  
        if (selectedDate) {
          const [dayAndMonth, day] = selectedDate.split(", ");
          onDateTimeChange(
            `${dayAndMonth}, ${day}, ${selectedYear}, ${value}`
          );
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <select
          value={selectedDate}
          onChange={(e) => handleDateTimeChange("date", e.target.value)}
          className="w-full p-2 rounded-lg border bg-background-light dark:bg-stone-800"
        >
          <option value="">Select Date</option>
          {generateDates().map((date) => (
            <option key={date.value} value={date.value}>
              {date.display}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Time</label>
        <select
          value={selectedTime}
          onChange={(e) => handleDateTimeChange("time", e.target.value)}
          className="w-full p-2 rounded-lg border bg-background-light dark:bg-stone-800"
        >
          <option value="">Select Time</option>
          {businessHours.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DateTimeSelector;
