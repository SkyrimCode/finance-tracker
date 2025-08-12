import { useEffect, useState } from "react";
import CustomBreadcrumbs from "../custom/Breadcrumbs";
import { useParams } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "../../firebase";
import { DataGrid } from "@mui/x-data-grid";

const CardStatements = () => {
  const { cardId } = useParams();
  const [statements, setStatements] = useState([]);

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
          ([month, record]) => ({
            month,
            ...record,
          })
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
          const [monthA, yearA] = a.month.split(" ");
          const [monthB, yearB] = b.month.split(" ");
          const months = [
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
          if (yearA !== yearB) return Number(yearB) - Number(yearA);
          return months.indexOf(monthB) - months.indexOf(monthA);
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

  const rows = statements.map((s, idx) => ({
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
      <h2 className="font-bold text-lg mb-4">Old Statements</h2>
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
