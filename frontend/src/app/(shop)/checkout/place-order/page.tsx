"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Place-order step folded into reservation preview — redirect. */
export default function PlaceOrderPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/checkout/reservation");
  }, [router]);

  return null;
}
