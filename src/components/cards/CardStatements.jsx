import { useEffect, useState } from "react";
import CustomBreadcrumbs from "../custom/Breadcrumbs";
import { useParams } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../firebase";
import { DataGrid } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import LoadingSpinner from "../custom/LoadingSpinner";

const CardStatements = () => {
  const { cardId } = useParams();
  const [statements, setStatements] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [currentYearTotal, setCurrentYearTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const db = getDatabase(app);
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

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

          // Calculate current year total
          const currentYear = new Date().getFullYear();
          const yearTotal = statementsList
            .filter((s) => {
              if (s.sortKey)
                return s.sortKey.startsWith(currentYear.toString());
              return s.month.endsWith(currentYear.toString());
            })
            .reduce((sum, s) => sum + (Number(s.totalDue) || 0), 0);
          setCurrentYearTotal(yearTotal);
          setLoading(false);
        })
        .catch((error) => {
          if (typeof window !== "undefined" && window.showToast) {
            window.showToast(error.message, "error");
          } else {
            alert(error.message);
          }
          setLoading(false);
        });
    });

    return () => unsubscribe();
  }, [cardId]);

  const breadcrumbItems = [
    { label: "Cards", link: "/cards" },
    { label: "All Cards", link: "/cards/list" },
    { label: "Old Statements", link: "" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

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

      {/* Current Year Total Card */}
      <div className="mb-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-white/90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                Total Spending {new Date().getFullYear()}
              </span>
            </div>
            <h3 className="text-4xl font-extrabold text-white mb-1">
              ₹{currentYearTotal.toLocaleString()}
            </h3>
            <p className="text-white/70 text-xs">
              Across all statements this year
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
        </div>
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
