import { CustomerLayout } from "@/components/CustomerLayout";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}
