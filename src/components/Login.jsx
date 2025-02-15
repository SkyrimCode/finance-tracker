import GoogleButton from "react-google-button";
import { auth, googleAuthProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleSignInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      localStorage.setItem("token", result.user.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen -mt-32 flex justify-center items-center">
      <GoogleButton onClick={handleSignInWithGoogle} />
    </div>
  );
};

export default Login;
