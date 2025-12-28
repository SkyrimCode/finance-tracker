import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import LoadingSpinner from "../custom/LoadingSpinner";
import CustomBreadcrumbs from "../custom/Breadcrumbs";

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

const SortableCard = ({ card, navigate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const now = new Date();
  const today = now.getDate();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const statement = card.statements?.[monthKey] || {};
  const bill = Number(statement.totalDue) || 0;
  const paid = Number(statement.amountPaid) || 0;
  const due = bill - paid;
  const logo = bankLogoMap[card.bankName] || fallbackLogo;
  const dueDate = Number(card.dueDate);
  let dueStatus = null;
  let dueColor = "text-orange-400";

  // Check if statement exists and has data
  const hasStatementData =
    statement.totalDue !== undefined ||
    statement.amountPaid !== undefined ||
    statement.billPaid !== undefined;

  if (!hasStatementData) {
    dueStatus = "No Bill Due";
    dueColor = "text-gray-400 font-semibold";
  } else if (bill === 0 && statement.billPaid) {
    dueStatus = "Fully Paid";
    dueColor = "text-green-600 font-semibold";
  } else if (due <= 0 && bill > 0) {
    dueStatus = "Fully Paid";
    dueColor = "text-green-600 font-semibold";
  } else if (!isNaN(dueDate)) {
    const daysLeft = dueDate - today;
    if (today >= dueDate) {
      dueStatus = `Late by ${today - dueDate} days`;
      dueColor = "text-red-700 font-semibold";
    } else if (daysLeft < 5) {
      dueStatus = `Due in ${daysLeft} days`;
      dueColor = "text-red-500 font-semibold";
    } else if (daysLeft > 10) {
      dueStatus = `Due in ${daysLeft} days`;
      dueColor = "text-yellow-500 font-semibold";
    } else {
      dueStatus = `Due in ${daysLeft} days`;
      dueColor = "text-orange-400 font-semibold";
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: "none" }}
      {...attributes}
      {...listeners}
      className="group bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 flex items-center justify-between hover:shadow-md hover:border-blue-300 transition-all touch-none cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className="flex items-center gap-4 min-w-0 flex-1"
          onClick={() => navigate(`/cards/${card.id}`)}
        >
          <img
            src={logo}
            alt={card.bankName}
            className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-200 p-1"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-bold text-base text-gray-900 truncate">
              {card.bankName}
            </span>
            <span className="text-sm text-gray-500 truncate">
              {card.cardName}
            </span>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col items-end min-w-[120px]"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/cards/${card.id}`);
        }}
      >
        <span className="text-lg font-bold text-gray-900">
          {convertToInr(bill)}
        </span>
        {dueStatus && (
          <span className={dueColor + " text-xs text-center mt-1"}>
            {dueStatus}
          </span>
        )}
      </div>
    </div>
  );
};

const CardsList = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    const db = getDatabase(app);
    const auth = getAuth();

    // Wait for auth state to be ready
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
              // Sort by displayOrder, if not set use original order
              cardsArray.sort((a, b) => {
                const orderA = a.displayOrder ?? 999999;
                const orderB = b.displayOrder ?? 999999;
                return orderA - orderB;
              });
              setCards(cardsArray);
            } else {
              setCards([]);
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [showToast]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((card) => card.id === active.id);
    const newIndex = cards.findIndex((card) => card.id === over.id);

    const newCards = arrayMove(cards, oldIndex, newIndex);

    // Update displayOrder for all cards
    const updatedCards = newCards.map((card, index) => ({
      ...card,
      displayOrder: index,
    }));

    setCards(updatedCards);

    // Save to Firebase
    try {
      const db = getDatabase(app);
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const email = user.email?.replace(/\./g, "_");
        const updates = {};
        updatedCards.forEach((card) => {
          updates[`users/${email}/cards/${card.id}/displayOrder`] =
            card.displayOrder;
        });
        await update(ref(db), updates);
        showToast("Card order updated", "success");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const breadcrumbItems = [
    { label: "Cards", link: "/cards" },
    { label: "All Cards", link: "" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="mb-6">
        <CustomBreadcrumbs items={breadcrumbItems} />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">All Cards</h1>
        <p className="text-gray-500 text-sm">
          Manage and view all your credit cards
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-400 text-lg mb-4">No cards found</div>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/cards/add")}
          >
            Add Your First Card
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cards.map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {cards.map((card) => (
                <SortableCard key={card.id} card={card} navigate={navigate} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {cards.length > 0 && (
        <div className="flex mt-8 mb-4">
          <Button
            variant="contained"
            color="success"
            size="medium"
            onClick={() => navigate("/cards/add")}
            sx={{
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "0.9rem",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            + Add New Card
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardsList;
