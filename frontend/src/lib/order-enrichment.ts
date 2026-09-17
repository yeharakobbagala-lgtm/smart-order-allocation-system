import { fetchBranches, fetchProducts, type ApiOrder } from "@/lib/api";
import { mapApiOrder } from "@/lib/mappers";
import type { Order } from "@/lib/types";

export async function enrichApiOrders(
  apiOrders: ApiOrder[],
  extras?: { customerEmail?: string }
): Promise<Order[]> {
  const [products, branches] = await Promise.all([
    fetchProducts().catch(() => []),
    fetchBranches().catch(() => []),
  ]);
  const productNames: Record<number, string> = {};
  const productImages: Record<number, string> = {};
  products.forEach((p) => {
    productNames[p.id] = p.name;
    if (p.image) productImages[p.id] = p.image;
  });
  const branchNames: Record<number, string> = {};
  branches.forEach((b) => {
    branchNames[b.id] = b.name;
  });

  return apiOrders.map((order) =>
    mapApiOrder(order, {
      branchName:
        order.branch_id != null ? branchNames[order.branch_id] : undefined,
      productNames,
      productImages,
      customerEmail: extras?.customerEmail,
    })
  );
}
