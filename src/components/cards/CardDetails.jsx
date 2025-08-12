import { useEffect, useState } from "react";
import LoadingSpinner from "../custom/LoadingSpinner";
import { Button, Checkbox, TextField, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CustomBreadcrumbs from "../custom/Breadcrumbs";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "../../firebase";

const CardDetails = () => {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const [form, setForm] = useState({
    cardName: "",
    bankName: "",
    statementDate: "",
    dueDate: "",
    totalDue: "",
    amountPaid: "",
    billPaid: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase(app);
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) return;
      const email = user.email.replace(/\./g, "_");
      get(ref(db, `users/${email}/cards/${cardId}`))
        .then((snapshot) => {
          const data = snapshot.val();
          setCard(data);
          setForm({
            cardName: data?.cardName || "",
            bankName: data?.bankName || "",
            statementDate: data?.statementDate || "",
            dueDate: data?.dueDate || "",
            totalDue: data?.totalDue || "",
            amountPaid: data?.amountPaid || "",
            billPaid: data?.billPaid || false,
          });
        })
        .catch((error) => {
          if (typeof window !== "undefined" && window.showToast) {
            window.showToast(error.message, "error");
          } else {
            alert(error.message);
          }
        });
    });
    return () => unsubscribe();
  }, [cardId]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "billPaid") {
      if (checked) {
        setForm((prev) => ({
          ...prev,
          billPaid: true,
          amountPaid: prev.totalDue,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          billPaid: false,
          amountPaid: "",
        }));
      }
    } else if (name === "totalDue") {
      setForm((prev) => ({
        ...prev,
        totalDue: value,
        amountPaid: prev.billPaid ? value : prev.amountPaid,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEdit = () => navigate(`/cards/${cardId}/edit`);

  const handleSave = () => {
    const db = getDatabase(app);
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const email = user.email.replace(/\./g, "_");
    update(ref(db, `users/${email}/cards/${cardId}`), {
      ...form,
      updatedAt: new Date().toISOString(),
    })
      .then(() => {
        navigate("/cards", { state: { showSuccess: true } });
      })
      .catch((error) => {
        if (typeof window !== "undefined" && window.showToast) {
          window.showToast(error.message, "error");
        } else {
          alert(error.message);
        }
      });
  };

  if (!card) return <LoadingSpinner />;

  const breadcrumbItems = [
    { label: "Back to Cards", link: "/cards" },
    { label: card.cardName || "Card Details", link: "" },
  ];
  return (
    <div className="p-4">
      <div className="mb-6">
        <CustomBreadcrumbs items={breadcrumbItems} />
      </div>
      <div className="flex items-center mb-4">
        <h2 className="font-bold text-lg mr-2">
          {form.cardName} ({form.bankName})
        </h2>
        <span className="text-gray-500 mr-2">
          Statement: {form.statementDate} | Due: {form.dueDate}
        </span>
        <IconButton
          size="small"
          onClick={handleEdit}
          aria-label="Edit Card Info"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </div>
      <TextField
        label="Total Due"
        name="totalDue"
        type="number"
        value={form.totalDue}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Amount Paid"
        name="amountPaid"
        type="number"
        value={form.amountPaid}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={form.billPaid}
      />
      <div className="flex items-center mt-2">
        <Checkbox
          name="billPaid"
          checked={form.billPaid}
          onChange={handleChange}
        />
        <span>Mark as Bill Paid for Current Month</span>
      </div>
      <div className="pt-6 flex flex-row gap-2">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          className="mt-4"
        >
          Save
        </Button>
        <Button
          variant="text"
          onClick={() => navigate(`/cards/${cardId}/statements`)}
          className="mt-2 ml-2"
        >
          View Old Statements
        </Button>
      </div>
    </div>
  );
};

export default CardDetails;
