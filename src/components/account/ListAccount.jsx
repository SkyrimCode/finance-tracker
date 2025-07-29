import { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchRowsData } from "../utils/Fetcher";

const columns = [
  {
    field: "monthYear",
    headerName: "Time Period",
    headerClassName: "bg-gray-100",
    flex: 1,
    align: "center",
    headerAlign: "center",
    editable: true,
  },
  {
    field: "cumulativeIncome",
    headerName: "Income",
    headerClassName: "bg-gray-100",
    flex: 1,
    align: "center",

    headerAlign: "center",
    editable: true,
    valueFormatter: (value) => `₹${value?.toLocaleString() || 0}`,
  },
  {
    field: "cumulativeExpense",
    headerName: "Expense",
    headerClassName: "bg-gray-100",

    flex: 1,
    align: "center",
    headerAlign: "center",
    valueFormatter: (value) => `₹${value?.toLocaleString() || 0}`,
  },
  {
    field: "cumulativeInvestment",
    headerName: "Investment",
    headerClassName: "bg-gray-100",
    align: "center",
    headerAlign: "center",
    flex: 1,
    valueFormatter: (value) => `₹${value?.toLocaleString() || 0}`,
  },
];

// const rows = [
//   {
//     id: 1,
//     month: "January",
//     income: "₹ 10000",
//     expense: "₹ 5000",
//     investment: "₹ 4000",
//   },
//   {
//     id: 2,
//     month: "February",
//     income: "₹ 10000",
//     expense: "₹ 5000",
//     investment: "₹ 4000",
//   },
//   {
//     id: 3,
//     month: "March",
//     income: "₹ 10000",
//     expense: "₹ 5000",
//     investment: "₹ 4000",
//   },
//   {
//     id: 4,
//     month: "April",
//     income: "₹ 10000",
//     expense: "₹ 5000",
//     investment: "₹ 4000",
//   },
//   {
//     id: 5,
//     month: "May",
//     income: "₹ 10000",
//     expense: "₹ 5000",
//     investment: "₹ 4000",
//   },
//   {
//     id: 6,
//     month: "June",
//     income: "₹ 10000",
//     expense: "₹ 5000",
//     investment: "₹ 4000",
//   },
// ];

export default function Account() {
  let [rows, setRows] = useState([]);
  let [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const navigate = useNavigate();

  const handleAddRow = () => {
    navigate("/account/new");
  };

  // Extract unique years from the data
  const availableYears = useMemo(() => {
    const years = rows
      .map((row) => {
        const monthYear = row.monthYear;
        if (monthYear) {
          // Extract year from "April 2025" format
          const yearMatch = monthYear.match(/\d{4}/);
          return yearMatch ? yearMatch[0] : null;
        }
        return null;
      })
      .filter((year) => year !== null);

    return [...new Set(years)].sort((a, b) => b - a);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const filtered = rows.filter((row) => {
      if (!selectedYear) return true;
      const monthYear = row.monthYear;
      if (monthYear) {
        const yearMatch = monthYear.match(/\d{4}/);
        return yearMatch && yearMatch[0] === selectedYear;
      }
      return false;
    });

    // Sort by month chronologically
    return filtered.sort((a, b) => {
      const monthOrder = [
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

      const getMonthIndex = (monthYear) => {
        if (!monthYear) return -1;
        const monthName = monthYear.split(" ")[0];
        return monthOrder.indexOf(monthName);
      };

      const aMonthIndex = getMonthIndex(a.monthYear);
      const bMonthIndex = getMonthIndex(b.monthYear);

      return aMonthIndex - bMonthIndex;
    });
  }, [rows, selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    fetchRowsData(setRows, setIsLoading);
  }, []);

  return (
    <div className="flex flex-col">
      <label className="text-xl font-bold">
        Track your expenses & investments
      </label>
      <label className="text-gray-400 mt-2">
        Add your monthly income, expenses, and investments to see how much
        you&apos;re saving. We&apos;ll use this information to help you track
        spending, set budgets, and analyze investment performance.
      </label>

      {/* Year Filter */}
      <div className="mt-6 mb-4 w-48">
        <FormControl fullWidth size="small">
          <InputLabel id="year-filter-label">Filter by Year</InputLabel>
          <Select
            labelId="year-filter-label"
            value={selectedYear}
            label="Filter by Year"
            onChange={handleYearChange}
          >
            <MenuItem value="">All Years</MenuItem>
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <DataGrid
        className="mt-4"
        loading={isLoading}
        rows={filteredRows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 12 } },
        }}
        pageSizeOptions={[10]}
        onRowClick={(params) => {
          navigate(`/account/${params.id}`, { state: { row: params.row } });
        }}
        sx={{ cursor: "pointer" }}
      />
      <div className="mt-4 w-[40%">
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={handleAddRow}
          sx={{
            borderRadius: "10px",
            padding: "8px 20px",

            fontWeight: "bold",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "0.3s",
            "&:hover": {
              backgroundColor: "success", // Darker blue on hover
              boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          + Add new month
        </Button>
      </div>
    </div>
  );
}
