import { useMemo, useState } from "react";
import "./AttendanceCalendar.css";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad2 = (value) => String(value).padStart(2, "0");

const formatDateKey = (year, monthIndex, day) => {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
};

const isSameDate = (a, b) => a.toDateString() === b.toDateString();

const buildYearOptions = (centerYear) => {
  const years = [];
  for (let year = centerYear - 2; year <= centerYear + 2; year += 1) {
    years.push(year);
  }
  return years;
};

const sampleAttendance = {
  "2026-03-01": "holiday",
  "2026-03-03": "present",
  "2026-03-04": "present",
  "2026-03-05": "absent",
  "2026-03-06": "present",
  "2026-03-07": "leave",
  "2026-03-09": "present",
  "2026-03-10": "present",
  "2026-03-11": "present",
  "2026-03-12": "absent",
  "2026-03-13": "present",
  "2026-03-15": "holiday",
  "2026-03-18": "leave",
  "2026-03-19": "present",
  "2026-03-20": "present",
  "2026-03-21": "absent",
  "2026-03-25": "present",
};

const AttendanceCalendar = () => {
  const today = new Date();
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const years = useMemo(() => buildYearOptions(today.getFullYear()), [today]);

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayIndex = new Date(year, monthIndex, 1).getDay();

  const monthKeyPrefix = `${year}-${pad2(monthIndex + 1)}-`;

  const getStatus = (day) => {
    const key = `${monthKeyPrefix}${pad2(day)}`;
    return sampleAttendance[key] || "none";
  };

  const isFutureDate = (day) => {
    const date = new Date(year, monthIndex, day);
    return date > today && !isSameDate(date, today);
  };

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let totalMarked = 0;

    for (let day = 1; day <= daysInMonth; day += 1) {
      const status = getStatus(day);
      if (status === "present") {
        present += 1;
        totalMarked += 1;
      } else if (status === "absent") {
        absent += 1;
        totalMarked += 1;
      } else if (status === "leave") {
        leave += 1;
        totalMarked += 1;
      }
    }

    const percentage = totalMarked
      ? Math.round((present / totalMarked) * 100)
      : 0;

    return { present, absent, leave, percentage };
  }, [daysInMonth, monthKeyPrefix]);

  const goToPreviousMonth = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((prev) => prev - 1);
    } else {
      setMonthIndex((prev) => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((prev) => prev + 1);
    } else {
      setMonthIndex((prev) => prev + 1);
    }
  };

  const goToToday = () => {
    setMonthIndex(today.getMonth());
    setYear(today.getFullYear());
  };

  return (
    <div className="attendance-wrapper">
      <div className="attendance-card">
        <div className="attendance-header">
          <div>
            <h2>Attendance Calendar</h2>
            <p>Track your attendance at a glance</p>
          </div>
          <div className="attendance-controls">
            <button type="button" onClick={goToPreviousMonth}>
              Prev
            </button>
            <button type="button" onClick={goToToday} className="today-btn">
              Today
            </button>
            <button type="button" onClick={goToNextMonth}>
              Next
            </button>
          </div>
        </div>

        <div className="attendance-filters">
          <select
            value={monthIndex}
            onChange={(event) => setMonthIndex(Number(event.target.value))}
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          >
            {years.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h4>Present Days</h4>
            <span>{summary.present}</span>
          </div>
          <div className="summary-card">
            <h4>Absent Days</h4>
            <span>{summary.absent}</span>
          </div>
          <div className="summary-card">
            <h4>Leave Days</h4>
            <span>{summary.leave}</span>
          </div>
          <div className="summary-card">
            <h4>Attendance Percentage</h4>
            <span>{summary.percentage}%</span>
          </div>
        </div>

        <div className="progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${summary.percentage}%` }}
            ></div>
          </div>
          <span>{summary.percentage}% present this month</span>
        </div>

        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="calendar-day">
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-empty"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const status = getStatus(day);
            const future = isFutureDate(day);
            const date = new Date(year, monthIndex, day);
            const isToday = isSameDate(date, today);
            const statusLabel = future
              ? "Future"
              : status === "none"
                ? "No Data"
                : status.charAt(0).toUpperCase() + status.slice(1);

            const cardClass = future
              ? "date-card future"
              : `date-card ${status}`;

            return (
              <div
                key={formatDateKey(year, monthIndex, day)}
                className={`${cardClass} ${isToday ? "today" : ""}`}
              >
                <div className="date-top">
                  <span className="date-number">{day}</span>
                  <span className="date-icon">
                    {status === "present" && "P"}
                    {status === "absent" && "A"}
                    {status === "leave" && "L"}
                    {status === "holiday" && "H"}
                  </span>
                </div>
                <div className="date-tooltip">{statusLabel}</div>
              </div>
            );
          })}
        </div>

        <div className="legend">
          <span>
            <i className="legend-dot present"></i> Present
          </span>
          <span>
            <i className="legend-dot absent"></i> Absent
          </span>
          <span>
            <i className="legend-dot leave"></i> Leave
          </span>
          <span>
            <i className="legend-dot holiday"></i> Holiday
          </span>
          <span>
            <i className="legend-dot future"></i> Future
          </span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
