import React, { useState } from "react";
import { RiEyeCloseFill, RiEyeFill } from "react-icons/ri";
import { ToastContainer, toast } from "react-toastify";
import { BallTriangle } from "react-loader-spinner";
import { useNavigate, Link, json } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useDispatch } from "react-redux";
import userSlice, { userLoginInfo } from "../../slices/userSlice";

const Login = () => {
  const auth = getAuth();
  const db = getDatabase();
  const provider = new GoogleAuthProvider();
  const dispacth = useDispatch();
  let navigate = useNavigate();
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [emailerr, setEmailerr] = useState("");
  let [passworderr, setPassworderr] = useState("");
  let [passwordshow, setPasswordShow] = useState("");
  let [loading, setLoading] = useState(false);

  let handleEmail = (e) => {
    setEmail(e.target.value);
    setEmailerr("");
  };
  let handlePassword = (e) => {
    setPassword(e.target.value);
    setPassworderr("");
  };
  let handleSubmit = () => {
    if (!email) {
      setEmailerr("Email Is Requird");
    } else {
      if (
        !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          email
        )
      ) {
        setEmailerr("Email Is Invalid");
      }
    }
    if (!password) {
      setPassworderr("Password Is Requird");
    } else {
      if (!/^(?=.{6,})/.test(password)) {
        setPassworderr("Password Is Invalid");
      }
    }
    if (
      email &&
      password &&
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      ) &&
      /^(?=.{6,})/.test(password)
    ) {
      setLoading(true);
      signInWithEmailAndPassword(auth, email, password)
        .then((user) => {
          setLoading(false);
          toast.success("log in succes");
          dispacth(userLoginInfo(user.user));
          localStorage.setItem("userInfo", JSON.stringify(user));
          setTimeout(() => {
            navigate("/");
          }, 2000);
        })
        .catch((error) => {
          const errorCode = error.code;
          if (errorCode.includes("auth/user-not-found")) {
            setEmailerr("Email is not found");
          }
          if (errorCode.includes("auth/wrong-password")) {
            setPassworderr("Password not match");
          }
          setLoading(false);
        });
    }
  };

  let handleGoogleSignIn = () => {
    signInWithPopup(auth, provider).then((user) => {
      toast.success("log in succes");
      set(ref(db, "users/" + user.user.uid), {
        username: user.user.displayName,
        email: user.user.email,
        profilePhoto: user.user.photoURL,
      });
      dispacth(userLoginInfo(user.user));
      localStorage.setItem("userInfo", JSON.stringify(user));
      setTimeout(() => {
        navigate("/");
      }, 2000);
    });
  };

  return (
    <div className="flex p-5 xl:p-0 lg:px-10 lg:py-0 md:mt-10 lg:mt-0">
      <ToastContainer position="bottom-center" theme="dark" />
      <div className="xl:w-2/4 w-full xl:flex xl:justify-end">
        <div className="xl:mr-44 mt-10 xl:mt-36">
          <h1 className="font-nunito font-bold sm:text-center xl:text-left text-3xl xl:text-4xl text-black mb-3">
            Login to your account!
          </h1>
          <a
            href="#"
            onClick={handleGoogleSignIn}
            className="flex py-5 px-5 border border-solid w rounded-lg mt-6 sm:hidden xl:block"
          >
            <img className="inline-block" src="images/Google.png" alt=""/>
            <h2 className="font-opensans inline-block font-semibold text-sm text-primary ml-2.5">
              Login with Google
            </h2>
          </a>
          <div className="relative mt-16">
            <input
              type="email"
              className="border-para border-solid border-b w-full xl:w-96 py-6 outline-0"
              onChange={handleEmail}
              value={email}
            ></input>
            <p className="font-nunito font-bold text-sm text-black absolute top-0 xl:top-[-9px] left-0 bg-white">
              Email Address
            </p>
            {emailerr && (
              <p className="absolute w-full xl:w-96 text-white bg-red-600 font-nunito font-semibold text-sm mt-2.5 p-1.5 rounded-md">
                {emailerr}
              </p>
            )}
          </div>
          <div className="relative mt-16">
            <input
              type={passwordshow ? "text" : "password"}
              className="border-para border-solid border-b py-6 w-full xl:w-96 outline-0"
              onChange={handlePassword}
              value={password}
            ></input>
            <p className="font-nunito font-bold text-sm text-black absolute top-0 xl:top-[-9px] left-0 bg-white">
              Password
            </p>
            {passwordshow ? (
              <RiEyeFill
                onClick={() => setPasswordShow(!passwordshow)}
                className="absolute top-6 right-6"
              />
            ) : (
              <RiEyeCloseFill
                onClick={() => setPasswordShow(!passwordshow)}
                className="absolute top-6 right-6"
              />
            )}
            {passworderr && (
              <p className="absolute text-white w-full xl:w-96 bg-red-600 font-nunito font-semibold text-sm mt-2.5 p-1.5 rounded-md">
                {passworderr}
              </p>
            )}
          </div>
          <div>
            {loading ? (
              <div className="flex justify-center w-96">
                <BallTriangle
                  height={100}
                  width={100}
                  radius={5}
                  color="#000"
                  ariaLabel="ball-triangle-loading"
                  wrapperClass={{}}
                  wrapperStyle=""
                  visible={true}
                />
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gray-800 w-full xl:w-96 font-nunito font-semibold text-xl text-white py-5 rounded-lg xl:rounded mt-14"
              >
                Login to Continue
              </button>
            )}
            <a
              href="#"
              onClick={handleGoogleSignIn}
              className="flex py-5 mt-7 justify-center border border-solid w-full shadow-sm rounded-lg xl:hidden"
            >
              <img className="inline-block" src="images/Google.png "alt="" />
              <h2 className="font-opensans inline-block font-semibold text-sm text-primary ml-3">
                Login with Google
              </h2>
            </a>
            <p className="font-opensans font-regular text-sm text-indigo-900 text-center xl:w-96 mt-6 xl:mt-9">
              Don’t have an account ?
              <Link
                to="/registration"
                className="text-rose-600 ml-1 font-opensans font-bold text-base"
              >
                Sign up
              </Link>
            </p>
            <p className="text-center xl:w-96 mt-3 xl:mt-9">
              <Link
                to="/forgotpassword"
                className="text-rose-600 font-opensans font-bold text-base"
              >
                Forgot Password
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="w-2/4 hidden xl:block">
        <img
          className="object-cover w-full h-screen"
          src="images/loginimg.png"
          alt=""
        />
      </div>
    </div>
  );
};

export default Login;
