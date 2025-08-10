import CustomBreadcrumbs from "../custom/Breadcrumbs";
import { useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../custom/MobileView";

function ListView({ label, field }) {
  let isExpense = label === "Expense";

  const getFormattedDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  return field == null ? (
    <></>
  ) : (
    <div className="flex flex-col gap-3">
      <label className="font-bold mb-2">{label}</label>

      {field.map((row, index) => {
        const inr = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.amount);
        return (
          <div
            className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between"
            key={index}
          >
            <div className="flex items-center gap-4">
              {label === "Expense" ? (
                <>
                  <div
                    className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12"
                    data-icon="ArrowUp"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z"></path>
                    </svg>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12"
                    data-icon="ArrowDown"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"></path>
                    </svg>
                  </div>
                </>
              )}

              <div className="flex flex-col justify-center">
                <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                  {row.remarks}
                </p>
                <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">
                  {getFormattedDate(row.timestamp)}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <p
                className={`text-[#0e141b] text-base font-normal leading-normal ${
                  isExpense ? "text-red-600" : "text-green-600"
                }`}
              >
                {isExpense ? `-${inr}` : `+${inr}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UpdateButton({ data, isMobile = false }) {
  const navigate = useNavigate();

  return isMobile ? (
    <EditIcon
      fontSize="small"
      onClick={() =>
        navigate(`/account/${data.id}/update`, {
          state: data,
        })
      }
    />
  ) : (
    <Button
      onClick={() =>
        navigate(`/account/${data.id}/update`, {
          state: data,
        })
      }
      variant="contained"
      startIcon={<EditIcon fontSize="small" />}
      sx={{
        padding: "6px 20px",
        fontSize: "1rem",
        fontWeight: "bold",
        textTransform: "none",
        borderRadius: "8px",
        background: "linear-gradient(135deg, #1E1E2D, #3A3A55)",
        color: "white",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          background: "linear-gradient(135deg, #3A3A55, #1E1E2D)",
          transform: "scale(1.05)",
        },
      }}
    >
      Update
    </Button>
  );
}

function ViewMonthData() {
  const breadcrumbItems = [
    { label: "Back to Overview", link: "/account" },
    { label: "View Data", link: "" },
  ];
  const location = useLocation();
  const data = location.state?.row; // Access the row data
  const isMobile = useIsMobile();
  return (
    <div
      className="flex flex-col gap-4 pb-8"
      style={{ fontFamily: '"Work Sans", "Noto Sans", sans-serif' }}
    >
      <div className="mb-6">
        <CustomBreadcrumbs items={breadcrumbItems} />
      </div>

      <div className="text-[#0e141b] text-3xl font-black leading-tight tracking-[-0.033em] min-w-72 flex justify-between">
        <div>{data.monthYear}</div>
        <div>
          {isMobile ? <UpdateButton data={data} isMobile={isMobile} /> : <></>}
        </div>
      </div>

      {Array.isArray(data.income) && data.income.length > 0 && (
        <ListView label="Income" field={data.income} />
      )}
      {Array.isArray(data.expense) && data.expense.length > 0 && (
        <ListView label="Expense" field={data.expense} />
      )}
      {Array.isArray(data.investment) && data.investment.length > 0 && (
        <ListView label="Investment" field={data.investment} />
      )}
      {!isMobile && (
        <div className="mt-8 ml-2 w-[30%] h-[2%]">
          <UpdateButton data={data} />
        </div>
      )}
    </div>
  );
}

export default ViewMonthData;
