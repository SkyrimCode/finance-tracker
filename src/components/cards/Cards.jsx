import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../firebase";
import { useToast } from "../../context/ToastContext";
import { convertToInr } from "../../utils/genericUtils";
import LoadingSpinner from "../custom/LoadingSpinner";

const Cards = () => {
  const [hasCards, setHasCards] = useState(false);
  const [currentYearSpend, setCurrentYearSpend] = useState(0);
  const [currentMonthSpend, setCurrentMonthSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    const db = getDatabase(app);
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email?.replace(/\./g, "_");
        const dbRef = ref(db, `users/${email}/cards`);
        get(dbRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const cardsArray = Object.entries(data).map(([id, value]) => ({
                id,
                ...value,
              }));
              setHasCards(cardsArray.length > 0);

              let yearSpend = 0;
              let monthSpend = 0;
              const now = new Date();
              const currentYear = now.getFullYear();
              const monthKey = `${currentYear}-${String(
                now.getMonth() + 1
              ).padStart(2, "0")}`;

              cardsArray.forEach((card) => {
                // Current month calculations
                const statement = card.statements?.[monthKey] || {};
                const bill = Number(statement.totalDue) || 0;
                monthSpend += bill;

                // Current year calculations
                if (card.statements) {
                  Object.keys(card.statements).forEach((key) => {
                    if (key.startsWith(currentYear.toString())) {
                      yearSpend += Number(card.statements[key].totalDue) || 0;
                    }
                  });
                }
              });
              setCurrentYearSpend(yearSpend);
              setCurrentMonthSpend(monthSpend);
            } else {
              setHasCards(false);
              setCurrentYearSpend(0);
              setCurrentMonthSpend(0);
            }
            setLoading(false);
          })
          .catch((error) => {
            showToast(error.message, "error");
            setLoading(false);
          });
      } else {
        showToast("User not authenticated", "error");
        setLoading(false);
      }
    });
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Credit Cards</h1>
      <p className="text-gray-500 text-sm mb-6">
        Manage your credit card bills and track spending
      </p>

      {hasCards ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Current Year Spend */}
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-300/10 to-purple-500/10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                    <CreditCardIcon
                      className="text-white"
                      style={{ fontSize: 28 }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    {new Date().getFullYear()}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Annual Spending
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {convertToInr(currentYearSpend)}
                  </h3>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            </div>

            {/* Current Month Spend */}
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/10 to-blue-500/10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                    <CreditCardIcon
                      className="text-white"
                      style={{ fontSize: 28 }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {new Date().toLocaleString("default", { month: "short" })}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Monthly Spending
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {convertToInr(currentMonthSpend)}
                  </h3>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => navigate("/cards/list")}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 px-8 py-4 border border-gray-200 hover:border-blue-400 flex items-center gap-3"
            >
              <CreditCardIcon
                className="text-blue-600"
                style={{ fontSize: 24 }}
              />
              <span className="text-gray-900 font-semibold text-base">
                View All Cards
              </span>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center mb-8 mt-12">
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-lg px-10 py-12 flex flex-col items-center max-w-md w-full">
            <div className="bg-gray-100 p-4 rounded-full mb-6">
              <CreditCardIcon style={{ fontSize: 56, color: "#666" }} />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-3 text-center">
              No Cards Added
            </div>
            <div className="text-gray-500 text-base mb-6 text-center">
              Start tracking your credit card bills by adding your first card.
            </div>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => navigate("/cards/add")}
              sx={{
                borderRadius: "12px",
                padding: "12px 32px",
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              + Add Your First Card
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
