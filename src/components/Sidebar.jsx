import { useState, useRef, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon, Home, AccountCircle } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Item = ({
  title,
  to,
  icon,
  selected,
  setSelected,
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <Link to={to} style={{ textDecoration: "none", display: "block" }}>
      <MenuItem
        onClick={() => {
          setSelected(title);
          setSidebarOpen(false);
        }}
        style={{
          color: "white",
          padding: "0", // Remove any padding added by MenuItem
          minWidth: "auto", // Prevent the MenuItem from forcing any width
          display: "flex", // Ensure the ListItemIcon and Text stay in the same row
          alignItems: "center", // Align text and icon properly
          paddingTop: "8px",
          paddingBottom: "8px",
        }}
      >
        <ListItemIcon
          sx={{
            color: "#fff",
            minWidth: "48px", // Keep the default icon size
            paddingLeft: "0", // Ensure no padding is applied to the icon
          }}
        >
          {icon}
        </ListItemIcon>
        {sidebarOpen ? (
          <ListItemText
            primary={title}
            sx={{
              color: "#fff", // Override the default color
              opacity: selected === title ? 1 : 0.7, // Keep selected state for text opacity
              whiteSpace: "nowrap", // Prevent overflow of text
              marginLeft: "10px", // Adjust space between icon and text
              padding: 0, // Remove internal padding
              fontWeight: "normal", // Adjust font weight
              fontSize: "1rem", // Adjust font size
            }}
          />
        ) : (
          <></>
        )}
      </MenuItem>
    </Link>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [selected, setSelected] = useState("");
  const menuItems = [
    { title: "Home", icon: <Home />, path: "/" },
    { title: "Account", icon: <AccountCircle />, path: "/account" },
    { title: "Upload", icon: <AccountCircle />, path: "/upload" },
  ];
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user.displayName?.split(" ")[0];
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    }

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, setSidebarOpen]);

  const handleToggleSidebar = (event) => {
    event.stopPropagation();
    setSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {/* 🔹 AppBar */}
      <AppBar
        position="fixed"
        sx={{
          background: "#1E1E2D",
          zIndex: 1301,
          width: "100%", // Make the AppBar full width
        }}
      >
        <Toolbar className="flex justify-between">
          {/* Hamburger Icon for both mobile and desktop */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            ref={toggleButtonRef}
            onClick={handleToggleSidebar}
            sx={{ display: { xs: "block", sm: "block" } }} // Show hamburger on both mobile and desktop
          >
            <MenuIcon />
          </IconButton>
          <h1 className="text-xl sm:ml-4">Finance Tracker</h1>

          <Box>
            <IconButton color="inherit" onClick={handleProfileClick}>
              <AccountCircle sx={{ fontSize: 30 }} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{
                zIndex: 1400,
                "& .MuiPaper-root": {
                  borderRadius: "12px",
                  minWidth: 180,
                  backgroundColor: "#25253A",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  color: "#ffffff",
                  //   padding: "8px 0",
                },
              }}
            >
              <Paper sx={{ backgroundColor: "transparent", boxShadow: "none" }}>
                <Typography
                  sx={{ px: 2, py: 1, fontSize: "0.9rem", opacity: 0.8 }}
                >
                  {`Welcome, ${userName}`}
                </Typography>
                <Divider
                  sx={{ backgroundColor: "rgba(255,255,255,0.2)", mx: 1 }}
                />

                <MenuItem
                  onClick={handleClose}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                    px: 2,
                    py: 1.2,
                    fontSize: "0.9rem",
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                    px: 2,
                    py: 1.2,
                    fontSize: "0.9rem",
                  }}
                >
                  Sign Out
                </MenuItem>
              </Paper>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 🔹 Sidebar */}
      <Box
        ref={sidebarRef}
        className="h-screen bg-[#1E1E2D] text-white flex flex-col fixed top-0 left-0"
        sx={{
          width: sidebarOpen ? 200 : 60, // Sidebar width is 200 when open, 60 when collapsed
          minWidth: sidebarOpen ? 200 : 60, // Prevent shrinking
          maxWidth: sidebarOpen ? 200 : 60, // Prevent expansion
          zIndex: 1300,
          backgroundColor: "#1E1E2D", // Ensure the background is visible
          position: { xs: "fixed", sm: "relative" }, // Fixed for mobile, relative for desktop
          height: "100vh", // Sidebar should take the full height
          top: 0,
          left: 0,
          display: "block", // Sidebar visible on desktop, toggle on mobile
          paddingTop: "64px", // Add padding-top equivalent to AppBar height (64px default AppBar height in MUI)
          transform: {
            xs: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            sm: "none",
          }, // 🔥 Smooth sliding transition
          transition: "all 0.3s ease-in-out",
        }}
      >
        <List>
          {/* Sidebar Menu Items */}
          {menuItems.map((item, index) => (
            <ListItemButton key={index}>
              <Item
                title={item.title}
                to={item.path}
                icon={item.icon}
                selected={selected}
                setSelected={setSelected}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </>
  );
};

export default Sidebar;
