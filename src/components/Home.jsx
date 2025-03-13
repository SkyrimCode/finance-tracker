import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
import { useEffect, useState } from "react";
import { fetchRowsData } from "./utils/Fetcher";
import LoadingSpinner from "./custom/LoadingSpinner";

const getSortedMonthsForCurrentYear = (records) => {
  const currentYear = new Date().getFullYear();
  const monthOrder = [
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

  return records
    .filter(({ monthYear }) => monthYear.includes(currentYear)) // Filter records for current year
    .map(({ monthYear }) => monthYear.split(" ")[0]) // Extract month name
    .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)); // Sort by month order
};

const getSortedFieldForCurrentYear = (records, field) => {
  const currentYear = new Date().getFullYear();

  const monthOrder = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const filteredRecords = records.filter((record) => {
    const [, year] = record.monthYear.split(" ");
    return parseInt(year) === currentYear;
  });

  return filteredRecords
    .sort((a, b) => {
      const [monthA] = a.monthYear.split(" ");
      const [monthB] = b.monthYear.split(" ");

      return monthOrder[monthA] - monthOrder[monthB];
    })
    .map((record) => {
      switch (field) {
        case "income":
          return record.cumulativeIncome || 0;
        case "expense":
          return record.cumulativeExpense || 0;
        default:
          return record.cumulativeInvestment || 0;
      }
    });
};

const lineOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      display: true,
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Annual Income Vs Expense",
    },
  },
};

const stackedBarOptions = {
  plugins: {
    title: {
      display: true,
      text: "Investment Distribution - Stacked",
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

const lineData = (rows) => {
  return {
    labels: getSortedMonthsForCurrentYear(rows),
    datasets: [
      {
        label: "Monthly Income",
        data: getSortedFieldForCurrentYear(rows, "income"),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Monthly Expense",
        data: getSortedFieldForCurrentYear(rows, "expense"),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };
};

const stackedBarData = (rows) => {
  return {
    labels: getSortedMonthsForCurrentYear(rows),
    datasets: [
      {
        label: "US Equity",
        data: getSortedFieldForCurrentYear(rows, "income"),
        backgroundColor: "rgb(255, 99, 132)",
      },
      {
        label: "India Equity",
        data: getSortedFieldForCurrentYear(rows, "income"),
        backgroundColor: "rgb(75, 192, 192)",
      },
      {
        label: "India Debt",
        data: getSortedFieldForCurrentYear(rows, "income"),
        backgroundColor: "rgb(53, 162, 235)",
      },
    ],
  };
};

export function Card({ heading, body }) {
  return (
    <div
      className="lg:max-w-64 p-5 bg-white shadow-xl rounded-xl border border-gray-200 hover:shadow-2xl 
                 transition-all duration-500 ease-in-out transform hover:-translate-y-2 
                 animate-fadeIn"
      style={{ width: "calc(50% - 10px)" }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{heading}</h3>
      <p className="text-gray-600 text-base">{body}</p>
    </div>
  );
}

function Home() {
  let [rows, setRows] = useState([]);
  let [loading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.displayName?.split(" ")[0];

  useEffect(() => {
    fetchRowsData(setRows, setIsLoading);
  }, []);

  const netIncome = rows.reduce(
    (sum, item) => sum + (item.cumulativeIncome || 0),
    0
  );
  const netExpense = rows.reduce(
    (sum, item) => sum + (item.cumulativeExpense || 0),
    0
  );
  const netInvestment = rows.reduce(
    (sum, item) => sum + (item.cumulativeInvestment || 0),
    0
  );

  const getCurrentMonthYear = () => {
    const now = new Date();
    return now.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  const findRecordByMonthYear = (data) => {
    const currentMonthYear = getCurrentMonthYear();
    return data.find((record) => record.monthYear === currentMonthYear) || null;
  };

  const currentMonthRecord = findRecordByMonthYear(rows);

  const savings = currentMonthRecord
    ? Number(
        currentMonthRecord?.cumulativeIncome -
          currentMonthRecord?.cumulativeExpense
      )
    : 0;
  const savingsRate =
    savings > 0
      ? ((savings * 100) / currentMonthRecord?.cumulativeIncome).toFixed(2)
      : 0;
  const disposableIncome = currentMonthRecord
    ? currentMonthRecord?.cumulativeIncome -
      currentMonthRecord?.cumulativeExpense -
      currentMonthRecord?.cumulativeInvestment
    : 0;

  const netWorth = netIncome + netInvestment - netExpense;

  const convertToInr = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);

  return loading ? (
    <LoadingSpinner />
  ) : (
    <>
      <div className="flex flex-col">
        <label className="text-xl font-bold">{`Hello, ${userName}`}</label>
        <label className="text-gray-400 mt-2">
          Here&apos;s your spending summary for the month
        </label>
        <div className="flex flex-wrap mt-8 gap-4">
          <Card heading="Net Worth" body={convertToInr(netWorth)} />
          <Card heading="Savings Rate" body={`${savingsRate}%`} />
          <Card
            heading="Total Income"
            body={convertToInr(currentMonthRecord?.cumulativeIncome ?? 0)}
          />
          <Card
            heading="Total Expense"
            body={convertToInr(currentMonthRecord?.cumulativeExpense ?? 0)}
          />
          <Card
            heading="Total Investments"
            body={convertToInr(currentMonthRecord?.cumulativeInvestment ?? 0)}
          />
          <Card
            heading="Disposable Income"
            body={convertToInr(disposableIncome)}
          />
        </div>
      </div>
      <div className="mt-20 mb-10 pb-16 lg:px-40 lg:py-10 flex justify-center">
        <Line options={lineOptions} data={lineData(rows)} />
      </div>
      <label className="border-b border-gray-200 text-lg font-semibold lg:mt-20 pb-2 flex justify-center">
        Spending Habits
      </label>

      <div className="mt-8 lg:px-40 lg:py-10">
        <Bar options={barOptions} data={lineData(rows)} />
      </div>
      {/* <div className="w-full lg:w-1/4 flex items-center">
          <Doughnut data={data2} options={options2} />
        </div> */}

      <label className="border-b border-gray-200 text-lg font-semibold mt-20 pb-2 flex justify-center">
        Investments
      </label>
      <div className="flex flex-col lg:flex-row gap-2 my-10 justify-center">
        <div className="w-full lg:w-3/4">
          <Bar options={stackedBarOptions} data={stackedBarData(rows)} />
        </div>
      </div>
    </>
  );
}

export default Home;
