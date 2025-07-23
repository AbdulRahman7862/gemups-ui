import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gempup SignUp Page ",
  description: "This is gempup SignUp Page ",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
