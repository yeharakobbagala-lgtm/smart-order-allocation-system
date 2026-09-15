"use client";

import { Landing } from "@/views/pages/Landing";
import { useApp } from "@/context/app-provider";

export default function HomePage() {
  const { navigate } = useApp();
  return <Landing navigate={navigate} />;
}
