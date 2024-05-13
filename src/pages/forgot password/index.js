import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";

const ForgotPassword = () => {
  const auth = getAuth();
  let [email, setEmail] = useState("");

  let handleEmail = (e) => {
    setEmail(e.target.value);
  };

  let navigate = useNavigate();
  let handleUpdate = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.success("Check your gmail to reset password");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      })
      .catch((error) => {
        const errorCode = error.code;
        toast.error(errorCode);
      });
  };

  return (
    <div className="bg-forgotPassBG bg-cover bg-center w-full h-screen flex justify-center items-center">
      <ToastContainer position="bottom-center" theme="dark" />
      <div className="bg-transparent backdrop-blur-lg py-8 px-10 rounded-xl border border-gray-600 shadow-lg">
        <div className="text-white text-center font-poppins font-extrabold text-2xl">
          Forgot Password
        </div>
        <div className="relative mt-8 mb-2.5">
          <input
            type="email"
            className="border-para border-solid border bg-white rounded-lg py-6 px-14 w-96"
            onChange={handleEmail}
          />
          <p className="font-nunito font-semibold text-sm text-heading absolute top-[-9px] left-9 bg-white px-5 rounded-sm">
            Email Address
          </p>
          <br/>
          <button
            onClick={handleUpdate}
            className="bg-indigo-600 font-nunito font-semibold text-xl text-white p-5 rounded-lg mt-5"
          >
            Update
          </button>
          <button className="bg-indigo-600 font-nunito font-semibold text-xl ml-6 text-white p-5 rounded-lg mt-5">
            <Link to="/login">Back to Login</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
