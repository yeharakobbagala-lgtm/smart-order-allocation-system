"use client";

import React from "react";
import type { Page } from "@/lib/types";
import { Button } from "@/components/ui";

/**
 * Legacy demo place-order view. Live confirm lives on the reservation page.
 */
export const PlaceOrder: React.FC<{
  navigate: (page: Page) => void;
}> = ({ navigate }) => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
    <p className="text-[#64748B]">
      Order confirmation happens on the reservation preview after stock is reserved.
    </p>
    <Button onClick={() => navigate("checkout")}>Go to Checkout</Button>
  </div>
);
