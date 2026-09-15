"use client";

import { Login } from "@/views/pages/Auth";
import { useApp } from "@/context/app-provider";

export default function LoginPage() {
  const { login, navigate } = useApp();
  return <Login onLogin={login} navigate={navigate} />;
}
