import { Form, Field, useFormState } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import arrayMutators from "final-form-arrays";
import { Button, IconButton } from "@mui/material";
import { getDatabase, ref, set, push, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "../../firebase";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

import { CustomSelect, MonthYearPicker } from "../custom/InputFields";
import CustomBreadcrumbs from "../custom/Breadcrumbs";

const FormLayout = ({ pristine, invalid }) => {
  const { values } = useFormState();
  const stockOptions = [
    { label: "US Stock", value: "usStock" },
    { label: "US Bond", value: "usBond" },
    { label: "Indian Stock", value: "indStock" },
    { label: "Indian Bond", value: "indBond" },
    { label: "Gold", value: "gold" },
    { label: "Fixed", value: "fixed" },
    { label: "Others", value: "others" },
  ];
  const isUSInvestment = (index) => {
    return values.investment[index].type.includes("us");
  };
  const getSelectBoxOption = (val) => {
    switch (val) {
      case "usStock":
        return { label: "US Stock", value: "usStock" };
      case "usBond":
        return { label: "US Bond", value: "usBond" };
      case "indStock":
        return { label: "Indian Stock", value: "indStock" };
      case "indBond":
        return { label: "Indian Bond", value: "indBond" };
      case "gold":
        return { label: "Gold", value: "gold" };
      case "fixed":
        return { label: "Fixed", value: "fixed" };
      case "others":
        return { label: "Others", value: "others" };
      default:
        return null;
    }
  };

  const required = (value) => (value ? undefined : "Amount is required");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label className="mt-4 font-semibold border-b border-gray-200 pb-2">
          Time Period
        </label>
        <div className="mt-2">
          <MonthYearPicker name="monthYear" />
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md overflow-hidden p-6 border border-gray-200">
        <label className="mt-1 font-semibold border-b border-gray-200 pb-2">
          Income (after tax)
        </label>
        <FieldArray name="income">
          {({ fields }) => (
            <div>
              {fields.map((name, index) => (
                <div
                  key={name}
                  className="mb-4 relative bg-white border border-gray-200 rounded-lg p-4 w-full"
                >
                  <div className=" flex flex-col lg:flex-row lg:gap-8">
                    {/* Amount Field */}
                    <div className="flex flex-col lg:w-1/3">
                      <label className="my-2 text-sm font-semibold">
                        Amount
                      </label>

                      <Field name={`${name}.amount`} validate={required}>
                        {({ input, meta }) => (
                          <div>
                            <input
                              {...input}
                              type="number"
                              placeholder="Enter income eg: Rs.1000"
                              className={`w-full p-2 border ${
                                meta.error && meta.touched
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
                              onWheel={(e) => e.target.blur()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  fields.push({ type: "", amount: undefined });
                                }
                              }}
                            />
                            {meta.error && meta.touched && (
                              <span className="text-red-500 text-xs">
                                {meta.error}
                              </span>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>

                    {/* Remarks Field */}
                    <div className="flex flex-col lg:w-1/3">
                      <label className="my-2 text-sm font-semibold">
                        Remarks
                      </label>
                      <Field
                        name={`${name}.remarks`}
                        component="input"
                        placeholder="Enter income type eg: Salary credit"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // Prevent form submission
                            fields.push({ type: "", amount: undefined });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 m-1 mt-2">
                    {index > 0 && (
                      <IconButton
                        color="error"
                        onClick={() => fields.remove(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                </div>
              ))}

              <Button
                size="small"
                onClick={() => fields.push({ type: "", amount: undefined })}
                sx={{
                  padding: "2px 30px",
                  fontSize: "0.75rem",
                  minWidth: "auto",
                  height: "28px",
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "#E8EDF2",
                  color: "#000",
                  "&:hover": {
                    backgroundColor: "#bdbdbd",
                  },
                }}
              >
                + Add Income
              </Button>
            </div>
          )}
        </FieldArray>
      </div>
      <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md overflow-hidden p-6 border border-gray-200">
        <label className="mt-1 font-semibold border-b border-gray-200 pb-2">
          Monthly Expenses
        </label>
        <FieldArray name="expense">
          {({ fields }) => (
            <div>
              {fields.map((name, index) => (
                <div
                  key={name}
                  className="relative bg-white border border-gray-200 rounded-lg p-4 mb-4"
                >
                  <div className="flex flex-col lg:flex-row lg:gap-8">
                    <div className="flex flex-col lg:w-1/3">
                      <label className="my-2 text-sm font-semibold">
                        Amount
                      </label>
                      <Field name={`${name}.amount`} validate={required}>
                        {({ input, meta }) => (
                          <div>
                            <input
                              {...input}
                              type="number"
                              placeholder="Enter income eg: Rs.1000"
                              className={`w-full p-2 border ${
                                meta.error && meta.touched
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
                              onWheel={(e) => e.target.blur()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  fields.push({ type: "", amount: undefined });
                                }
                              }}
                            />
                            {meta.error && meta.touched && (
                              <span className="text-red-500 text-xs">
                                {meta.error}
                              </span>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>
                    <div className="flex flex-col lg:w-1/3">
                      <label className="my-2 text-sm font-semibold">
                        Remarks
                      </label>
                      <Field
                        name={`${name}.remarks`}
                        component="input"
                        placeholder="Enter expense type eg: Food"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // Prevent form submission
                            fields.push({ type: "", amount: undefined });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 m-1 mt-2">
                    {index > 0 && (
                      <IconButton
                        color="error"
                        onClick={() => fields.remove(index)}
                        sx={{
                          width: "18px",
                          height: "18px",
                          padding: "2px",
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                </div>
              ))}
              <Button
                size="small"
                onClick={() => fields.push({ type: "", amount: undefined })}
                sx={{
                  padding: "2px 30px",
                  fontSize: "0.75rem",
                  minWidth: "auto",
                  height: "28px",
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "#E8EDF2",
                  color: "#000",
                  "&:hover": {
                    backgroundColor: "#bdbdbd",
                  },
                }}
              >
                + Add Expense
              </Button>
            </div>
          )}
        </FieldArray>
      </div>
      <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md p-6 border border-gray-200 overflow-visible relative">
        <label className="mt-1 font-semibold border-b border-gray-200 pb-2">
          Investments
        </label>
        <FieldArray name="investment">
          {({ fields }) => (
            <div>
              {fields.map((name, index) => (
                <div
                  key={name}
                  className="relative bg-white border border-gray-200 rounded-lg p-4 mb-4"
                >
                  <div className="flex flex-col lg:flex-row lg:gap-8">
                    <div className="flex flex-col lg:w-1/7">
                      <label className="my-2 text-sm font-semibold">Type</label>
                      <CustomSelect
                        name={`${name}.type`}
                        options={stockOptions}
                        initialSelected={getSelectBoxOption(
                          values.investment[index].type
                        )}
                      />
                    </div>
                    {isUSInvestment(index) ? (
                      <div className="flex flex-col lg:w-1/4">
                        <label className="my-2 text-sm font-semibold">
                          Amount (in USD)
                        </label>
                        <Field name={`${name}.usdAmount`} validate={required}>
                          {({ input, meta }) => (
                            <div>
                              <input
                                {...input}
                                type="number"
                                placeholder="Enter USD amount eg: $100"
                                className={`w-full p-2 border ${
                                  meta.error && meta.touched
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
                                onWheel={(e) => e.target.blur()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    fields.push({
                                      type: "",
                                      amount: undefined,
                                    });
                                  }
                                }}
                              />
                              {meta.error && meta.touched && (
                                <span className="text-red-500 text-xs">
                                  {meta.error}
                                </span>
                              )}
                            </div>
                          )}
                        </Field>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="flex flex-col lg:w-1/4">
                      <label className="my-2 text-sm font-semibold">
                        Amount
                      </label>
                      <Field name={`${name}.amount`} validate={required}>
                        {({ input, meta }) => (
                          <div>
                            <input
                              {...input}
                              type="number"
                              placeholder="Enter INR equivalent: Rs.8800"
                              className={`w-full p-2 border ${
                                meta.error && meta.touched
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  fields.push({ type: "", amount: undefined });
                                }
                              }}
                            />
                            {meta.error && meta.touched && (
                              <span className="text-red-500 text-xs">
                                {meta.error}
                              </span>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>

                    <div className="flex flex-col lg:w-1/4">
                      <label className="my-2 text-sm font-semibold">
                        Remarks
                      </label>
                      <Field
                        name={`${name}.remarks`}
                        component="input"
                        placeholder="Enter investment details eg: NIFTY-50"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // Prevent form submission
                            fields.push({ type: "", amount: undefined });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 m-1 mt-2">
                    <IconButton
                      color="error"
                      onClick={() => fields.remove(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              ))}
              <Button
                size="small"
                onClick={() => fields.push({ type: "", amount: undefined })}
                sx={{
                  marginTop: "10px",
                  padding: "2px 30px",
                  fontSize: "0.75rem",
                  minWidth: "auto",
                  height: "28px",
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "#E8EDF2",
                  color: "#000",
                  "&:hover": {
                    backgroundColor: "#bdbdbd",
                  },
                }}
              >
                + Add Investment
              </Button>
            </div>
          )}
        </FieldArray>
      </div>
      <div className="flex justify-start pb-10 ml-2">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={pristine || invalid} // Disable if form is invalid
          className="mt-4"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

function CreateMonth() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isUpdate = id != null;

  const onSubmit = (values) => {
    const db = getDatabase(app);
    const auth = getAuth();
    const user = auth.currentUser;
    const el = user.email;
    const email = el.replace(/\./g, "_");

    const getIncome = (record) => {
      const totalIncome =
        record.income?.reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        ) ?? 0;

      return Number(totalIncome);
    };

    const getExpense = (record) => {
      const totalExpense =
        record.expense?.reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        ) ?? 0;
      return Number(totalExpense);
    };

    const getInvestment = (record) => {
      const totalInvestment =
        record.investment?.reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        ) ?? 0;
      return Number(totalInvestment);
    };

    if (user) {
      if (isUpdate) {
        const recordRef = ref(db, `users/${email}/${id}`); // Reference to the record
        const data = {
          ...values,
          cumulativeIncome: getIncome(values),
          cumulativeExpense: getExpense(values),
          cumulativeInvestment: getInvestment(values),
          timestamp: new Date().toISOString(),
        };

        const cleanData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value === undefined ? null : value,
          ])
        );
        console.log("Clean data", cleanData);
        update(recordRef, cleanData)
          .then(() => {
            showToast("Success! Data updated.");
            navigate(`/account/${id}`, { state: { row: cleanData } });
          })
          .catch((error) => {
            alert("error: ", error.message);
          });
      } else {
        const expenseRef = push(ref(db, `users/${email}`));
        set(expenseRef, {
          ...values,
          cumulativeIncome: getIncome(values),
          cumulativeExpense: getExpense(values),
          cumulativeInvestment: getInvestment(values),
          timestamp: new Date().toISOString(),
        })
          .then(() => {
            showToast("Success! Data saved.");
            navigate("/account");
          })
          .catch((error) => {
            alert("error: ", error.message);
          });
      }
    } else {
      console.log("User not authenticated");
    }
  };

  const initialValues = location.state
    ? location.state
    : {
        income: [{ remarks: "", amount: undefined }],
        expense: [{ remarks: "", amount: undefined }],
      };
  const breadcrumbItems = isUpdate
    ? [
        { label: "Back to Overview", link: "/account" },
        {
          label: "View Data",
          link: `/account/${id}`,
          data: { state: { row: initialValues } },
        },
        { label: "Update", link: "" },
      ]
    : [
        { label: "Back to Overview", link: "/account" },
        { label: "Create New", link: "" },
      ];

  return (
    <div className="flex flex-col">
      <div className="mb-10">
        <CustomBreadcrumbs items={breadcrumbItems} />
      </div>
      <label className="text-xl font-bold">
        Track your expenses & investments
      </label>
      <label className="text-gray-400 mt-2">
        Add your monthly income, expenses, and investments to see how much
        you&apos;re saving. We&apos;ll use this information to help you track
        spending, set budgets, and analyze investment performance.
      </label>

      <Form
        className="flex flex-col"
        mutators={{ ...arrayMutators }}
        initialValues={initialValues}
        onSubmit={onSubmit}
        render={({ handleSubmit, pristine, invalid }) => (
          <form onSubmit={handleSubmit}>
            <FormLayout pristine={pristine} invalid={invalid} />
          </form>
        )}
      />
    </div>
  );
}

export default CreateMonth;
