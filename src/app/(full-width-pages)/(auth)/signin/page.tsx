import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gempup SignIn Page ",
  description: "This is  Signin Page of gemup",
};

export default function SignIn() {
  return <SignInForm />;
}
