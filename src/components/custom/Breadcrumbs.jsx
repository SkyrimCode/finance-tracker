import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CustomBreadcrumbs = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator="›" // Modern separator
      sx={{
        "& .MuiBreadcrumbs-separator": { mx: 1, color: "gray" }, // Subtle separator color
      }}
    >
      {items.map((item, index) =>
        index !== items.length - 1 ? (
          <Link
            key={index}
            underline="none"
            color="text.secondary" // Use modern secondary text color
            onClick={() => navigate(item.link, item.data)}
            sx={{
              fontSize: "0.85rem",
              fontWeight: 500,
              textTransform: "capitalize",
              letterSpacing: "0.5px",
              transition: "all 0.3s ease",
              color: "#6c757d", // Neutral modern gray
              "&:hover": {
                color: "#1E88E5", // Modern blue hover effect
                textDecoration: "none",
                transform: "translateY(-2px)", // Smooth hover lift
                cursor: "pointer",
              },
            }}
          >
            {item.label}
          </Link>
        ) : (
          <Typography
            key={index}
            color="primary"
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "capitalize",
              letterSpacing: "0.5px",
            }}
          >
            {item.label}
          </Typography>
        )
      )}
    </Breadcrumbs>
  );
};

export default CustomBreadcrumbs;
