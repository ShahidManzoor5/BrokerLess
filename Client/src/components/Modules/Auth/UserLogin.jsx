import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { Button, Container, FooterLinks, FormInput } from "../../Index";
import { useNavigate } from "react-router-dom";

function UserLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCALHOST}/auth/user/login`,
        data,
        {
          withCredentials: true,
        }
      );
      window.location.reload("/user/dashboard");
      setLoading(false);
      toast.success(response.data.message);
    } catch (error) {
      setLoading(false);
      toast.error(error.response.data.message);
      if (error.response.data.message === "Email not verified") {
        setEmailError(true);
      }
    }
  };

  const resendEmail = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCALHOST}/auth/user/resend-verification-email`,
        { email: document.getElementById("email").value }
      );
      toast.success(response.data.message);
      setEmailError(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const Inputs = [
    {
      label: "Email",
      type: "email",
      name: "email",
      placeholder: "Enter your email address",
      required: true,
    },
    {
      label: "Password",
      type: "password",
      name: "password",
      placeholder: "Enter your password",
      required: true,
    },
  ];

  const FooterLink = [
    {
      text: "Don't have an account?",
      link: "/auth/register-user",
      linkText: "Register",
    },
    {
      text: "Forget Password?",
      link: "/auth/forget-password",
      linkText: "Reset Password",
    },
  ];

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col w-auto">
          <FormInput
            Inputs={Inputs}
            register={register}
            errors={errors}
            Heading={"Login"}
            Subheading={"Login to your account"}
          />
          <Button
            className={"flex justify-center w-full mt-5 "}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle size={20} className="text-white animate-spin" />
            ) : (
              "Login"
            )}
          </Button>

          <div className="text-center text-sm py-3 md:text-md font-semibold text-black pt-5">
            {emailError && (
              <p className="font-bold">
                Resend verification email
                <button
                  className="text-success py-4 p-2"
                  type="button"
                  onClick={resendEmail}
                >
                  Resend
                </button>
              </p>
            )}
          </div>
          <FooterLinks Links={FooterLink} />
        </div>
      </form>
    </Container>
  );
}

export default UserLogin;