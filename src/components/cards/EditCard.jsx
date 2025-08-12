import { useEffect, useState } from "react";
import LoadingSpinner from "../custom/LoadingSpinner";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
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

const banks = [
  { name: "HDFC Bank", logo: hdfcLogo },
  { name: "Axis Bank", logo: axisLogo },
  { name: "ICICI Bank", logo: iciciLogo },
  { name: "State Bank of India", logo: sbiLogo },
  { name: "Bandhan Bank", logo: bandhanLogo },
  { name: "Bank Of Baroda", logo: bobLogo },
  { name: "Federal Bank", logo: federalLogo },
  { name: "IDBI Bank", logo: idbiLogo },
  { name: "IDFC First Bank", logo: idfcLogo },
  { name: "Punjab National Bank", logo: pnbLogo },
  { name: "HSBC Bank", logo: hsbcLogo },
  { name: "AU Small Finance Bank", logo: auLogo },
  { name: "Other", logo: fallbackLogo },
];
import CustomBreadcrumbs from "../custom/Breadcrumbs";
import { useNavigate, useParams } from "react-router-dom";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "../../firebase";

const EditCard = () => {
  const { cardId } = useParams();
  const [form, setForm] = useState({
    bankName: "",
    cardName: "",
    statementDate: "",
    dueDate: "",
  });
  const [errors, setErrors] = useState({ statementDate: "", dueDate: "" });
  const [loading, setLoading] = useState(true);
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
          setForm({
            bankName: data?.bankName || "",
            cardName: data?.cardName || "",
            statementDate: data?.statementDate || "",
            dueDate: data?.dueDate || "",
          });
          setLoading(false);
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
    const { name, value } = e.target;
    let error = "";
    if ((name === "statementDate" || name === "dueDate") && value !== "") {
      const num = Number(value);
      if (num < 1 || num > 31) {
        error = "Value must be between 1 and 31";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;
    let newErrors = { ...errors };
    ["statementDate", "dueDate"].forEach((field) => {
      const num = Number(form[field]);
      if (form[field] === "" || num < 1 || num > 31) {
        newErrors[field] = "Value must be between 1 and 31";
        valid = false;
      }
    });
    setErrors(newErrors);
    if (!valid) return;
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
        navigate("/cards");
      })
      .catch((error) => {
        if (typeof window !== "undefined" && window.showToast) {
          window.showToast(error.message, "error");
        } else {
          alert(error.message);
        }
      });
  };

  const breadcrumbItems = [
    { label: "Back to Cards", link: "/cards" },
    { label: form.cardName || "Card", link: `/cards/${cardId}` },
    { label: "Edit Card", link: "" },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <form
      className="p-4 max-w-md md:ml-16 md:mr-0 md:mx-0 mx-auto"
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        background: "#fff",
        borderRadius: 12,
      }}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <CustomBreadcrumbs items={breadcrumbItems} />
      </div>
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="bank-select-label">Bank Name</InputLabel>
        <Select
          labelId="bank-select-label"
          id="bank-select"
          name="bankName"
          value={form.bankName}
          label="Bank Name"
          onChange={handleChange}
          renderValue={(selected) => {
            const bank = banks.find((b) => b.name === selected);
            return (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src={bank?.logo}
                  alt={bank?.name}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    objectFit: "contain",
                  }}
                />
                {bank?.name}
              </span>
            );
          }}
        >
          {banks.map((bank) => (
            <MenuItem key={bank.name} value={bank.name}>
              <ListItemIcon>
                <img
                  src={bank.logo}
                  alt={bank.name}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    objectFit: "contain",
                  }}
                />
              </ListItemIcon>
              <ListItemText primary={bank.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Card Name"
        name="cardName"
        value={form.cardName}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Statement Date (1-31)"
        name="statementDate"
        type="number"
        value={form.statementDate}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        error={!!errors.statementDate}
        helperText={errors.statementDate}
      />
      <TextField
        label="Due Date (1-31)"
        name="dueDate"
        type="number"
        value={form.dueDate}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        error={!!errors.dueDate}
        helperText={errors.dueDate}
      />
      <div className="mt-4">
        <Button type="submit" variant="contained" color="primary">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditCard;
