import React, { useState } from "react";
import { RiEyeCloseFill, RiEyeFill } from "react-icons/ri";
import { ToastContainer, toast } from "react-toastify";
import { BallTriangle } from "react-loader-spinner";
import { useNavigate, Link } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const Registration = () => {
  const auth = getAuth();
  const db = getDatabase();
  let navigate = useNavigate();
  let [email, setEmail] = useState("");
  let [fullname, setFullname] = useState("");
  let [password, setPassword] = useState("");
  let [emailerr, setEmailerr] = useState("");
  let [fullnameerr, setFullnameerr] = useState("");
  let [passworderr, setPassworderr] = useState("");
  let [passwordshow, setPasswordShow] = useState("");
  let [loading, setLoading] = useState(false);

  let handleEmail = (e) => {
    setEmail(e.target.value);
    setEmailerr("");
  };
  let handleFullname = (e) => {
    setFullname(e.target.value);
    setFullnameerr("");
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
    if (!fullname) {
      setFullnameerr("Full Name Is Requird");
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
      fullname &&
      password &&
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      ) &&
      /^(?=.{6,})/.test(password)
    ) {
      setLoading(true);
      createUserWithEmailAndPassword(auth, email, password)
        .then((user) => {
          updateProfile(auth.currentUser, {
            displayName: fullname,
            photoURL: "images/profilepic.png",
          })
            .then(() => {
              toast.success("Registration Succesful please verify your Email");
              setEmail("");
              setFullname("");
              setPassword("");
              sendEmailVerification(auth.currentUser);
              setLoading(false);
              setTimeout(() => {
                navigate("/login");
              }, 2000);
            })
            .then(() => {
              set(ref(db, "users/" + user.user.uid), {
                username: user.user.displayName,
                email: user.user.email,
                profilePhoto: "images/profilepic.png",
              });
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          if (error.code.includes("auth/email-already-in-use")) {
            setEmailerr("Email already in use");
            setLoading(false);
          }
        });
    }
  };

  return (
    <div className="flex">
      <ToastContainer position="bottom-center" theme="dark" />
      <div className="w-full lg:w-2/4  px-5 lg:flex bg-gray-300 h-screen md:h-screen land:h-full justify-end lg:px-3 xl:px-0">
        <div className="lg:mr-16 mt-6 lg:mt-6 xl:mt-36 md:mt-36">
          <h1 className="font-nunito font-bold xl:text-4xl text-3xl text-center xl:text-left text-zinc-900 mb-3">
            Get started with easily register
          </h1>
          <p className="font-nunito font-bold text-xl text-center xl:text-left md:mt-4 lg:mt-0 text-zinc-900 opacity-80">
            Free register and you can enjoy it
          </p>
          <div className="relative mt-9 xl:mt-16">
            <input
              type="email"
              className="border-black border-solid border xl:w-96 w-full outline-none bg-gray-300 text-black  rounded-lg py-5 md:py-6 px-9 lg:px-14"
              onChange={handleEmail}
              value={email}
            ></input>
            <p className="font-nunito font-bold text-sm text-black absolute top-[-9px] left-9 rounded-sm bg-gray-300 px-5">
              Email Address
            </p>
            {emailerr && (
              <p className="absolute xl:w-96 w-full text-white bg-red-600 font-nunito font-semibold text-xs sm:p-1 md:text-sm mt-2.5 p-1.5 rounded-md sm:-bottom-7">
                {emailerr}
              </p>
            )}
          </div>
          <div className="relative mt-9 lg:mt-10 xl:mt-16">
            <input
              type="text"
              className="border-black outline-none bg-gray-300 border-solid border xl:w-96 w-full rounded-lg py-5 md:py-6 px-9 lg:px-14"
              onChange={handleFullname}
              value={fullname}
            ></input>
            <p className="font-nunito font-bold text-sm text-black absolute rounded-sm top-[-9px] left-9 bg-gray-300 px-5">
              Full Name
            </p>
            {fullnameerr && (
              <p className="absolute xl:w-96 w-full text-white bg-red-600 font-nunito font-semibold text-xs sm:p-1 md:text-sm mt-2.5 p-1.5 rounded-md sm:-bottom-7">
                {fullnameerr}
              </p>
            )}
          </div>
          <div className="relative mt-9 lg:mt-10 md:mt-16 xl:w-96 w-full">
            <input
              type={passwordshow ? "text" : "password"}
              className="border-black outline-none bg-gray-300 border-solid border rounded-lg md:py-6 py-5 w-full px-9 lg:px-14"
              onChange={handlePassword}
              value={password}
            ></input>
            <p className="font-nunito font-bold text-sm text-black absolute rounded-sm top-[-9px] left-9 bg-gray-300 px-5">
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
              <p className="absolute xl:w-96 w-full text-white bg-red-600 font-nunito font-semibold text-xs sm:p-1 md:text-sm mt-2.5 p-1.5 rounded-md sm:-bottom-7">
                {passworderr}
              </p>
            )}
          </div>
          <div>
            {loading ? (
              <div className="flex justify-center w-80 lg:w-96">
                <BallTriangle
                  height={100}
                  width={100}
                  radius={5}
                  color="#4fa94d"
                  ariaLabel="ball-triangle-loading"
                  wrapperClass={{}}
                  wrapperStyle=""
                  visible={true}
                />
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gray-800 xl:w-96 w-full font-nunito font-bold text-xl text-white py-5 rounded-[86px] mt-10 md:mt-14"
              >
                Sign Up
              </button>
            )}
            <p className="font-opensans font-regular text-sm text-indigo-900 text-center lg:w-96 w-full mt-6 xl:mt-9">
              Already have an account ?
              <Link
                to="/login"
                className="text-rose-600 font-opensans ml-1 font-bold text-base"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="w-2/4 hidden lg:block">
        <img
          className="object-cover w-full h-full lg:h-screen"
          src="images/reg-img.png"
          alt="Reg img"
        />
      </div>
    </div>
  );
};

export default Registration;
