"use client";

import { Register } from "@/views/pages/Auth";
import { useApp } from "@/context/app-provider";

export default function RegisterPage() {
  const { navigate } = useApp();
  return <Register navigate={navigate} />;
}
