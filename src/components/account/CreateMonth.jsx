import { Form, Field, useFormState } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import arrayMutators from "final-form-arrays";
import { Button, IconButton } from "@mui/material";
import {
  getDatabase,
  ref,
  set,
  push,
  update,
  get,
  child,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "../../firebase";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useState } from "react";

import { CustomSelect, MonthYearPicker } from "../custom/InputFields";
import CustomBreadcrumbs from "../custom/Breadcrumbs";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const ChevronComponent = ({ isOpen, toggle }) => {
  return (
    <div onClick={toggle} className="pb-2">
      {isOpen ? (
        <ExpandLess fontSize="small" />
      ) : (
        <ExpandMore fontSize="small" />
      )}
    </div>
  );
};

const FormLayout = ({ pristine, form }) => {
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
  const handleFieldChange = (form, name) => {
    const currentTime = new Date().toISOString();
    form.change(`${name}.timestamp`, currentTime);
  };

  const required = (value) => (value ? undefined : "Amount is required");
  const [isOpenIncomeTab, setIsOpenIncomeTab] = useState(false);
  const [isOpenExpenseTab, setIsOpenExpenseTab] = useState(false);
  const [isOpenInvestmentTab, setisOpenInvestmentTab] = useState(false);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <label className="mt-4 font-semibold border-b border-gray-200 pb-2">
          Time Period
        </label>
        <div className="mt-2">
          <MonthYearPicker name="monthYear" />
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md overflow-hidden py-1 px-6 border border-gray-200">
        <div
          className="flex justify-between items-center py-2"
          onClick={() => setIsOpenIncomeTab((prev) => !prev)}
        >
          <label className="font-semibold">Income (after tax)</label>
          <ChevronComponent isOpen={isOpenIncomeTab} />
        </div>
        <div className={`${isOpenIncomeTab ? "block" : "hidden"}`}>
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

                        <Field name={`${name}.amount`}>
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
                                    fields.push({
                                      type: "",
                                      amount: undefined,
                                    });
                                  }
                                }}
                                onChange={(e) => {
                                  input.onChange(e);
                                  handleFieldChange(form, name);
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
                        <Field name={`${name}.remarks`}>
                          {({ input }) => (
                            <input
                              {...input}
                              type="text"
                              placeholder="Enter income type eg: Salary credit"
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault(); // Prevent form submission
                                  fields.push({ type: "", amount: undefined });
                                }
                              }}
                              onChange={(e) => {
                                input.onChange(e);
                                handleFieldChange(form, name);
                              }}
                            />
                          )}
                        </Field>
                      </div>
                      <Field name={`${name}.timestamp`}>
                        {({ input }) => (
                          <input
                            {...input}
                            type="text"
                            readOnly
                            className="hidden"
                          />
                        )}
                      </Field>
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
                <div className="py-4">
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
              </div>
            )}
          </FieldArray>
        </div>
      </div>
      <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md overflow-hidden py-1 px-6 border border-gray-200">
        <div
          className="flex justify-between items-center py-2"
          onClick={() => setIsOpenExpenseTab((prev) => !prev)}
        >
          <label className="font-semibold">Monthly Expenses</label>
          <ChevronComponent isOpen={isOpenExpenseTab} />
        </div>
        <div className={`${isOpenExpenseTab ? "block" : "hidden"}`}>
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
                        <Field name={`${name}.amount`}>
                          {({ input, meta }) => (
                            <div>
                              <input
                                {...input}
                                type="number"
                                placeholder="Enter expense eg: Rs.1000"
                                className={`w-full p-2 border ${
                                  meta.error && meta.touched
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                  input.onChange(e);
                                  handleFieldChange(form, name);
                                }}
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
                      <div className="flex flex-col lg:w-1/3">
                        <label className="my-2 text-sm font-semibold">
                          Remarks
                        </label>
                        <Field name={`${name}.remarks`}>
                          {({ input }) => (
                            <input
                              {...input}
                              type="text"
                              placeholder="Enter expense type eg: Food"
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault(); // Prevent form submission
                                  fields.push({ type: "", amount: undefined });
                                }
                              }}
                              onChange={(e) => {
                                input.onChange(e);
                                handleFieldChange(form, name);
                              }}
                            />
                          )}
                        </Field>
                        <Field name={`${name}.timestamp`}>
                          {({ input }) => (
                            <input
                              {...input}
                              type="text"
                              readOnly
                              className="hidden"
                            />
                          )}
                        </Field>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 m-1 mt-2">
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
                    </div>
                  </div>
                ))}
                <div className="py-4">
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
              </div>
            )}
          </FieldArray>
        </div>
      </div>
      <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md py-1 px-6 border border-gray-200 overflow-visible relative">
        <div
          className="flex justify-between items-center py-2"
          onClick={() => setisOpenInvestmentTab((prev) => !prev)}
        >
          <label className="font-semibold">Investments</label>
          <ChevronComponent isOpen={isOpenInvestmentTab} />
        </div>
        <div className={`${isOpenInvestmentTab ? "block" : "hidden"}`}>
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
                        <label className="my-2 text-sm font-semibold">
                          Type
                        </label>
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
                                  onChange={(e) => {
                                    input.onChange(e);
                                    handleFieldChange(form, name);
                                  }}
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
                                onChange={(e) => {
                                  input.onChange(e);
                                  handleFieldChange(form, name);
                                }}
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

                      <div className="flex flex-col lg:w-1/4">
                        <label className="my-2 text-sm font-semibold">
                          Remarks
                        </label>
                        <Field name={`${name}.remarks`}>
                          {({ input }) => (
                            <input
                              {...input}
                              type="text"
                              placeholder="Enter investment details eg: NIFTY 50"
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault(); // Prevent form submission
                                  fields.push({ type: "", amount: undefined });
                                }
                              }}
                              onChange={(e) => {
                                input.onChange(e);
                                handleFieldChange(form, name);
                              }}
                            />
                          )}
                        </Field>
                        <Field name={`${name}.timestamp`}>
                          {({ input }) => (
                            <input
                              {...input}
                              type="text"
                              readOnly
                              className="hidden"
                            />
                          )}
                        </Field>
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
                <div className="py-4">
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
              </div>
            )}
          </FieldArray>
        </div>
      </div>
      <div className="flex justify-start pb-10 ml-2">
        <Button
          type="submit"
          variant="contained"
          color="primary"
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

    const diffData = (
      previousData,
      currentData,
      uniqueKey = "remarks",
      amountKey = "amount"
    ) => {
      const keys = ["expense", "income"];
      const result = {};

      keys.forEach((key) => {
        const prevArr = previousData[key] || [];
        const currArr = currentData[key] || [];
        const prevMap = new Map();
        prevArr.forEach((item) => {
          prevMap.set(item[uniqueKey], item);
        });

        const diffs = [];
        currArr.forEach((currItem) => {
          if (prevMap.has(currItem[uniqueKey])) {
            const prevItem = prevMap.get(currItem[uniqueKey]);
            if (prevItem[amountKey] !== currItem[amountKey]) {
              diffs.push({
                ...currItem,
                prevAmount: prevItem[amountKey],
                type: "UPDATED",
              });
            }
            prevMap.delete(currItem[uniqueKey]);
          } else {
            diffs.push({
              ...currItem,
              type: "CREATED",
            });
          }
        });

        prevMap.forEach((deletedItem) => {
          diffs.push({
            ...deletedItem,
            type: "DELETED",
          });
        });

        result[key] = diffs;
      });

      return result;
    };
    if (user) {
      // Helper to filter out empty rows
      const filterValidRows = (arr = []) =>
        (arr || []).filter(
          (item) =>
            (item.amount !== undefined &&
              item.amount !== null &&
              item.amount !== "") ||
            (item.remarks && item.remarks.trim() !== "")
        );

      if (isUpdate) {
        const recordRef = ref(db, `users/${email}/${id}`);
        const filteredIncome = filterValidRows(values.income);
        const filteredExpense = filterValidRows(values.expense);
        const filteredInvestments = filterValidRows(values.investments);
        const data = {
          ...values,
          income: filteredIncome,
          expense: filteredExpense,
          investments: filteredInvestments,
          cumulativeIncome: getIncome({ ...values, income: filteredIncome }),
          cumulativeExpense: getExpense({
            ...values,
            expense: filteredExpense,
          }),
          cumulativeInvestment: getInvestment({
            ...values,
            investments: filteredInvestments,
          }),
          timestamp: new Date().toISOString(),
        };

        const cleanData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value === undefined ? null : value,
          ])
        );

        get(recordRef)
          .then((snapshot) => {
            const previousData = snapshot.val();
            return update(recordRef, cleanData).then(() => {
              const archiveRef = child(recordRef.ref.parent, "accountHistory");
              const dateKey = new Date()
                .toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })
                .replace(",", "");
              const newArchiveRef = child(archiveRef, dateKey);
              return set(newArchiveRef, diffData(previousData, cleanData));
            });
          })
          .then(() => {
            showToast("Success! Data updated.");
            navigate(`/account/${id}`, { state: { row: cleanData } });
          })
          .catch((error) => {
            alert("error: " + error.message);
          });
      } else {
        const generateUniqueKey = () => push(ref(db, "dummy")).key;

        // Function to assign a unique id to each expense in the array.
        function assignUniqueIds(arr = []) {
          return arr.map((item) => ({
            ...item,
            id: generateUniqueKey(),
          }));
        }

        const filteredIncome = filterValidRows(values.income);
        const filteredExpense = filterValidRows(values.expense);
        const filteredInvestments = filterValidRows(values.investments);
        const updatedIncome = assignUniqueIds(filteredIncome);
        const updatedExpenses = assignUniqueIds(filteredExpense);
        const updatedInvestments = assignUniqueIds(filteredInvestments);
        const data = {
          ...values,
          income: updatedIncome,
          expense: updatedExpenses,
          investments: updatedInvestments,
          cumulativeIncome: getIncome({ ...values, income: updatedIncome }),
          cumulativeExpense: getExpense({
            ...values,
            expense: updatedExpenses,
          }),
          cumulativeInvestment: getInvestment({
            ...values,
            investments: updatedInvestments,
          }),
          timestamp: new Date().toISOString(),
        };
        const expenseRef = push(ref(db, `users/${email}`));

        set(expenseRef, data)
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
        render={({ handleSubmit, pristine, form }) => (
          <form onSubmit={handleSubmit}>
            <FormLayout pristine={pristine} form={form} />
          </form>
        )}
      />
    </div>
  );
}

export default CreateMonth;
