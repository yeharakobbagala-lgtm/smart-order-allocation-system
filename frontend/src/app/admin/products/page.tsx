"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { categories } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Table, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";

const categoryOptions = categories
  .filter((c) => c !== "All")
  .map((c) => ({ label: c, value: c }));

type ProductForm = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  active: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: categoryOptions[0]?.value ?? "Electronics",
  active: true,
};

export default function AdminProductsPage() {
  const { products, upsertProduct, toggleProductActive } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (activeFilter === "active" && !p.active) return false;
      if (activeFilter === "inactive" && p.active) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, search, activeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      image: product.image,
      category: product.category,
      active: product.active,
    });
    setModalOpen(true);
  };

  const save = () => {
    const price = Number(form.price);
    if (!form.name.trim()) {
      toast({ title: "Name is required", tone: "error" });
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast({ title: "Enter a valid price", tone: "error" });
      return;
    }
    upsertProduct({
      id: editing?.id,
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      image: form.image.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      category: form.category,
      active: form.active,
    });
    toast({
      title: editing ? "Product updated" : "Product created",
      tone: "success",
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted">
            Manage catalog items and availability.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Search"
            placeholder="Name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            rightElement={<Search className="h-4 w-4 text-muted" />}
          />
          <Select
            label="Status"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            options={[
              { label: "All", value: "" },
              { label: "Active only", value: "active" },
              { label: "Inactive only", value: "inactive" },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Product list" description={`${filtered.length} items`} />
        <CardBody className="p-0 sm:p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No products found" />
          ) : (
            <Table
              headers={[
                "Product",
                "Category",
                "Price",
                "Status",
                "Actions",
              ]}
              className="rounded-none border-0 border-t border-border"
            >
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80">
                  <Td>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="line-clamp-1 max-w-xs text-xs text-muted">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>{product.category}</Td>
                  <Td>{formatCurrency(product.price)}</Td>
                  <Td>
                    <Badge variant={product.active ? "success" : "neutral"}>
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toggleProductActive(product.id);
                          toast({
                            title: product.active
                              ? "Product deactivated"
                              : "Product activated",
                            tone: "info",
                          });
                        }}
                      >
                        {product.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit product" : "Add product"}
        description="Product details shown in the customer catalog."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Save changes" : "Create product"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="min-h-24 w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <Input
            label="Price (LKR)"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <Input
            label="Image URL"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            options={categoryOptions}
          />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            Active in catalog
          </label>
        </div>
      </Modal>
    </div>
  );
}
