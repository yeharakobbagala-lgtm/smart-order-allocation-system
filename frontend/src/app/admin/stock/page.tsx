"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { availableStock } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";

export default function AdminStockPage() {
  const { stocks, products, branches, updateStock } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [draftPhysical, setDraftPhysical] = useState<Record<string, string>>(
    {}
  );

  const branchOptions = useMemo(
    () => [
      { label: "All branches", value: "" },
      ...branches.map((b) => ({ label: b.name, value: String(b.id) })),
    ],
    [branches]
  );

  const productOptions = useMemo(
    () => [
      { label: "All products", value: "" },
      ...products.map((p) => ({ label: p.name, value: String(p.id) })),
    ],
    [products]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stocks
      .map((s) => {
        const product = products.find((p) => p.id === s.productId);
        const branch = branches.find((b) => b.id === s.branchId);
        const avail = availableStock(s.physicalStock, s.reservedStock);
        return { stock: s, product, branch, avail };
      })
      .filter(({ stock, product, branch }) => {
        if (!product || !branch) return false;
        if (branchFilter && String(stock.branchId) !== branchFilter) return false;
        if (productFilter && String(stock.productId) !== productFilter)
          return false;
        if (q) {
          const hay = `${product.name} ${branch.name}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const bn = a.branch!.name.localeCompare(b.branch!.name);
        if (bn !== 0) return bn;
        return a.product!.name.localeCompare(b.product!.name);
      });
  }, [stocks, products, branches, search, branchFilter, productFilter]);

  const key = (branchId: number, productId: number) =>
    `${branchId}-${productId}`;

  const saveRow = (branchId: number, productId: number, reserved: number) => {
    const k = key(branchId, productId);
    const raw = draftPhysical[k];
    const physical = raw !== undefined ? Number(raw) : NaN;
    if (!Number.isFinite(physical) || physical < 0) {
      toast({ title: "Enter a valid physical quantity", tone: "error" });
      return;
    }
    if (physical < reserved) {
      toast({
        title: "Physical stock too low",
        description: `Cannot go below reserved quantity (${reserved}).`,
        tone: "error",
      });
      return;
    }
    updateStock(branchId, productId, physical);
    setDraftPhysical((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
    toast({ title: "Stock updated", tone: "success" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stock</h1>
        <p className="mt-1 text-sm text-muted">
          Physical and reserved inventory by branch. Available = physical −
          reserved.
        </p>
      </div>

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Search"
            placeholder="Product or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            rightElement={<Search className="h-4 w-4 text-muted" />}
          />
          <Select
            label="Branch"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            options={branchOptions}
          />
          <Select
            label="Product"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            options={productOptions}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Stock levels"
          description={`${rows.length} row${rows.length === 1 ? "" : "s"}`}
        />
        <CardBody className="p-0 sm:p-0">
          {rows.length === 0 ? (
            <EmptyState title="No stock records match" />
          ) : (
            <Table
              headers={[
                "Branch",
                "Product",
                "Physical",
                "Reserved",
                "Available",
                "Update physical",
              ]}
              className="rounded-none border-0 border-t border-border"
            >
              {rows.map(({ stock, product, branch, avail }) => {
                const k = key(stock.branchId, stock.productId);
                const draft = draftPhysical[k];
                const displayPhysical =
                  draft !== undefined ? draft : String(stock.physicalStock);
                return (
                  <tr key={stock.id} className="hover:bg-slate-50/80">
                    <Td>{branch!.name}</Td>
                    <Td className="font-medium">{product!.name}</Td>
                    <Td>
                      <span className="font-semibold text-foreground">
                        {stock.physicalStock}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-warning">{stock.reservedStock}</span>
                    </Td>
                    <Td>
                      <Badge
                        variant={
                          avail === 0
                            ? "danger"
                            : avail <= 5
                              ? "warning"
                              : "success"
                        }
                      >
                        {avail}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex min-w-[200px] items-end gap-2">
                        <Input
                          type="number"
                          min={stock.reservedStock}
                          value={displayPhysical}
                          onChange={(e) =>
                            setDraftPhysical((prev) => ({
                              ...prev,
                              [k]: e.target.value,
                            }))
                          }
                          className="h-9"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            saveRow(
                              stock.branchId,
                              stock.productId,
                              stock.reservedStock
                            )
                          }
                          disabled={
                            draft === undefined ||
                            Number(draft) === stock.physicalStock
                          }
                        >
                          Save
                        </Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
