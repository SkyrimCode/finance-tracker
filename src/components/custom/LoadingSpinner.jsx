import { CircularProgress } from "@mui/material";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 backdrop-blur-md z-50">
      <div className="flex flex-col items-center space-y-3">
        <CircularProgress size={60} thickness={4} sx={{ color: "#1E1E2D" }} />
      </div>
    </div>
  );
};

export default LoadingSpinner;
