import { useEffect, useState } from "react";
import CustomBreadcrumbs from "../custom/Breadcrumbs";
import { useParams } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "../../firebase";
import { DataGrid } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const CardStatements = () => {
  const { cardId } = useParams();
  const [statements, setStatements] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");

  useEffect(() => {
    const db = getDatabase(app);
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const email = user.email.replace(/\./g, "_");

    Promise.all([
      get(ref(db, `users/${email}/cards/${cardId}/statements`)),
      get(ref(db, `users/${email}/cards/${cardId}`)),
    ])
      .then(([statementsSnap, cardSnap]) => {
        const statementsData = statementsSnap.val() || {};
        const statementsList = Object.entries(statementsData).map(
          ([monthKey, record]) => {
            const [year, monthNum] = monthKey.split("-");
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
            const monthName = monthNames[parseInt(monthNum, 10) - 1];
            return {
              month: `${monthName} ${year}`,
              sortKey: monthKey,
              ...record,
            };
          }
        );

        const cardData = cardSnap.val() || {};
        const now = new Date();
        const currentMonth = now.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        const alreadyPresent = statementsList.some(
          (s) => s.month === currentMonth
        );
        if (!alreadyPresent && cardData.totalDue !== undefined) {
          statementsList.push({
            month: currentMonth,
            totalDue: cardData.totalDue || 0,
            amountPaid: cardData.amountPaid || 0,
            billPaid: cardData.billPaid || false,
          });
        }
        statementsList.sort((a, b) => {
          function getYearMonth(obj) {
            if (obj.sortKey) {
              const [year, month] = obj.sortKey.split("-").map(Number);
              return { year, month };
            }
            const [monthName, yearStr] = obj.month.split(" ");
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
            const month = monthNames.indexOf(monthName) + 1;
            const year = Number(yearStr);
            return { year, month };
          }
          const aDate = getYearMonth(a);
          const bDate = getYearMonth(b);
          if (aDate.year !== bDate.year) return aDate.year - bDate.year;
          return aDate.month - bDate.month;
        });
        setStatements(statementsList);
      })
      .catch((error) => {
        if (typeof window !== "undefined" && window.showToast) {
          window.showToast(error.message, "error");
        } else {
          alert(error.message);
        }
      });
  }, [cardId]);

  const breadcrumbItems = [
    { label: "Back to Cards", link: "/cards" },
    { label: "Old Statements", link: "" },
  ];
  // DataGrid columns
  const columns = [
    {
      field: "month",
      headerName: "Month",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "totalDue",
      headerName: "Total Due",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => `₹${Number(value).toLocaleString()}`,
    },
    {
      field: "amountPaid",
      headerName: "Amount Paid",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => `₹${Number(value).toLocaleString()}`,
    },
    {
      field: "billPaid",
      headerName: "Bill Paid",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
  ];

  const years = Array.from(
    new Set(
      statements.map((s) => {
        if (s.sortKey) return s.sortKey.split("-")[0];
        const parts = s.month.split(" ");
        return parts[1];
      })
    )
  ).sort();

  const filteredStatements =
    selectedYear === "All"
      ? statements
      : statements.filter((s) => {
          if (s.sortKey) return s.sortKey.startsWith(selectedYear);
          return s.month.endsWith(selectedYear);
        });
  const rows = filteredStatements.map((s, idx) => ({
    id: idx,
    ...s,
    totalDue: s.totalDue === undefined || s.totalDue === null ? 0 : s.totalDue,
    amountPaid:
      s.amountPaid === undefined || s.amountPaid === null ? 0 : s.amountPaid,
    billPaid: s.billPaid ? "Yes" : "No",
  }));

  return (
    <div className="p-2">
      <div className="mb-6">
        <CustomBreadcrumbs items={breadcrumbItems} />
      </div>
      <h2 className="mb-2 font-bold text-lg">Statements</h2>
      <div className="mb-4 text-sm text-gray-500">
        View your previous card statements
      </div>

      <FormControl fullWidth size="small" sx={{ maxWidth: 150 }}>
        <InputLabel id="year-select-label">Year</InputLabel>
        <Select
          labelId="year-select-label"
          value={selectedYear}
          label="Year"
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <MenuItem value="All">All</MenuItem>
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          className="mt-4"
          rows={rows}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 8 } },
          }}
          pageSizeOptions={[8, 16, 32]}
          disableSelectionOnClick
          autoHeight={false}
          disableColumnMenu={true}
          sx={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
};

export default CardStatements;
