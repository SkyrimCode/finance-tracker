import Home from "./components/Home";
import "./App.css";
import Sidebar from "./components/Sidebar";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Protected from "./components/Protected";
import ListAccount from "./components/account/ListAccount";
import CreateMonth from "./components/account/CreateMonth";
import ViewMonthData from "./components/account/ViewMonthData";
import { Box } from "@mui/material";
import { useState } from "react";

const MainContent = () => {
  return (
    <Box
      className="flex flex-col transition-all duration-100"
      sx={{
        marginLeft: { xs: 0, sm: "20px" },
        transition: "margin-left 0.3s ease-in-out",
        flexGrow: 1,
        paddingTop: "64px",
        height: "100vh",
        overflowY: "scroll",
        padding: "0 16px",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <main className="content min-h-screen flex flex-col pt-24">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected />}>
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<ListAccount />} />
            <Route path="/account/:id" element={<ViewMonthData />} />
            <Route path="/account/new" element={<CreateMonth />} />
            <Route path="/account/:id/update" element={<CreateMonth />} />
          </Route>
        </Routes>
      </main>
    </Box>
  );
};

const App = () => {
  let path = useLocation().pathname;
  let showSidebar = path !== "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box className="flex">
      {showSidebar ? (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      ) : (
        <></>
      )}

      <MainContent />
    </Box>
  );
};

export default App;
