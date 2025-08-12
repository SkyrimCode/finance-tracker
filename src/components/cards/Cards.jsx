import { useEffect, useState, useRef } from "react";
import { Button } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useNavigate, useLocation } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../firebase";
import { useToast } from "../../context/ToastContext";
import axisLogo from "../../assets/bank-logos/axis.webp";
import bandhanLogo from "../../assets/bank-logos/bandhan.webp";
import bobLogo from "../../assets/bank-logos/bob.webp";
import federalLogo from "../../assets/bank-logos/federal.webp";
import hdfcLogo from "../../assets/bank-logos/hdfc.webp";
import iciciLogo from "../../assets/bank-logos/icici.webp";
import idbiLogo from "../../assets/bank-logos/idbi.webp";
import idfcLogo from "../../assets/bank-logos/idfc.webp";
import pnbLogo from "../../assets/bank-logos/pnb.webp";
import sbiLogo from "../../assets/bank-logos/sbi.webp";
import hsbcLogo from "../../assets/bank-logos/hsbc.webp";
import auLogo from "../../assets/bank-logos/au.webp";
import fallbackLogo from "../../assets/bank-logos/default.webp";

import { convertToInr } from "../../utils/genericUtils";

const bankLogoMap = {
  "HDFC Bank": hdfcLogo,
  "Axis Bank": axisLogo,
  "ICICI Bank": iciciLogo,
  "State Bank of India": sbiLogo,
  "Bandhan Bank": bandhanLogo,
  "Bank Of Baroda": bobLogo,
  "Federal Bank": federalLogo,
  "IDBI Bank": idbiLogo,
  "IDFC First Bank": idfcLogo,
  "Punjab National Bank": pnbLogo,
  "AU Small Finance Bank": auLogo,
  "HSBC Bank": hsbcLogo,
};

import LoadingSpinner from "../custom/LoadingSpinner";

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [, setTotalBill] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Only show success toast once after navigation from CardDetails save
  const toastShownRef = useRef(false);
  useEffect(() => {
    if (
      location.state &&
      location.state.showSuccess &&
      !toastShownRef.current
    ) {
      showToast("Card updated successfully!", "success");
      toastShownRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }

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
              setCards(cardsArray);
              let totalDueSum = 0;
              let totalBillSum = 0;
              cardsArray.forEach((card) => {
                const bill = Number(card.totalDue) || 0;
                const paid = Number(card.amountPaid) || 0;
                const due = bill - paid;
                totalDueSum += due;
                totalBillSum += bill;
              });
              setTotalDue(totalDueSum);
              setTotalBill(totalBillSum);
            } else {
              setCards([]);
              setTotalDue(0);
              setTotalBill(0);
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
  }, [showToast, location, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="px-4">
      {cards.length !== 0 ? (
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex items-center bg-gradient-to-r from-green-100 to-green-50 rounded-xl shadow p-5 border border-green-200">
            <CreditCardIcon
              className="text-green-600 mr-4"
              style={{ fontSize: 40 }}
            />
            <div>
              <div className="text-gray-500 text-sm font-medium">
                Total Amount Due
              </div>
              <div className="text-xl font-semibold text-green-700">
                {convertToInr(totalDue)}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow px-8 py-10 flex flex-col items-center max-w-md w-full">
            <CreditCardIcon
              style={{ fontSize: 56, color: "#888" }}
              className="mb-4"
            />
            <div className="text-xl font-semibold text-gray-800 mb-2 text-center">
              No Cards Added
            </div>
            <div className="text-gray-500 text-base mb-4 text-center">
              Please add a new card to track your bills.
            </div>
            <Button
              variant="outlined"
              color="success"
              size="medium"
              onClick={() => navigate("/cards/add")}
              sx={{
                borderRadius: "8px",
                padding: "8px 24px",
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              Set up New Card
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-4">
            {cards.map((card) => {
              const bill = Number(card.totalDue) || 0;
              const paid = Number(card.amountPaid) || 0;
              const due = bill - paid;
              const logo = bankLogoMap[card.bankName] || fallbackLogo;
              return (
                <div
                  key={card.id}
                  className="group bg-white border border-blue-100 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between hover:shadow-md hover:border-blue-300 transition cursor-pointer"
                  onClick={() => navigate(`/cards/${card.id}`)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={logo}
                      alt={card.bankName}
                      className="w-10 h-10 rounded-md object-contain bg-gray-50 border border-gray-200"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-sans font-semibold text-sm text-gray-900 truncate">
                        {card.bankName}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {card.cardName}
                      </span>
                    </div>
                  </div>
                  <div className=" flex items-center">
                    <span className="px-4 py-2">{convertToInr(due)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-start mt-8">
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => navigate("/cards/add")}
              sx={{
                borderRadius: "10px",
                padding: "8px 20px",
                fontWeight: "bold",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "0.3s",
                "&:hover": {
                  backgroundColor: "success",
                  boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              Set up New Card
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cards;
