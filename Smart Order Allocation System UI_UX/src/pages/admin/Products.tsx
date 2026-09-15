import React, { useState } from "react";
import type { Product } from "../../types";
import { MOCK_PRODUCTS } from "../../data";
import { Button, Card, Modal, Input, Textarea, Badge, EmptyState, IconSearch, IconEdit, IconPlus, IconPackage } from "../../components/ui";

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", image: "", active: true });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setForm({ name: "", description: "", price: "", image: "", active: true });
    setEditing(null);
    setErrors({});
    setModal("add");
  };

  const openEdit = (p: Product) => {
    setForm({ name: p.name, description: p.description, price: String(p.price), image: p.image, active: p.active });
    setEditing(p);
    setErrors({});
    setModal("edit");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Enter a valid price";
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    if (editing) {
      setProducts((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...form, price: Number(form.price) } : p));
    } else {
      setProducts((prev) => [...prev, {
        id: `p${Date.now()}`,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        image: form.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop&auto=format",
        category: "General",
        active: form.active,
      }]);
    }
    setSaving(false);
    setModal(null);
  };

  const toggleActive = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Products</h1>
          <p className="text-[#64748B] mt-1">{products.length} products</p>
        </div>
        <Button onClick={openAdd} icon={<IconPlus size={16} />}>Add Product</Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"><IconSearch size={16} /></span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Product", "Category", "Price", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12"><EmptyState icon={<IconPackage size={24} />} title="No products found" /></td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
                      <div>
                        <p className="font-medium text-[#0F172A]">{p.name}</p>
                        <p className="text-xs text-[#94A3B8] line-clamp-1 max-w-[200px]">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="muted">{p.category}</Badge></td>
                  <td className="px-4 py-3 font-bold text-[#0F172A]">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.active ? "bg-[#10B981]" : "bg-[#CBD5E1]"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.active ? "translate-x-4" : "translate-x-1"}`} />
                    </button>
                    <span className={`ml-2 text-xs font-medium ${p.active ? "text-[#065F46]" : "text-[#94A3B8]"}`}>{p.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-[#EEF2FF] text-[#94A3B8] hover:text-[#4F46E5] transition-colors">
                      <IconEdit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "add" ? "Add Product" : "Edit Product"} size="md">
        <div className="space-y-4">
          <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} placeholder="Sony WH-1000XM5 Headphones" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={errors.description} placeholder="Product description..." rows={3} />
          <Input label="Price (USD)" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} error={errors.price} placeholder="49.99" />
          <Input label="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." hint="Leave blank for default image" />
          <div className="flex items-center gap-3">
            <button onClick={() => setForm({ ...form, active: !form.active })} className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${form.active ? "bg-[#10B981]" : "bg-[#CBD5E1]"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.active ? "translate-x-5" : "translate-x-1"}`} />
            </button>
            <span className="text-sm font-medium text-[#334155]">Active</span>
          </div>
          <div className="flex gap-3 pt-2">
            <Button loading={saving} onClick={handleSave} className="flex-1">{modal === "add" ? "Add Product" : "Save Changes"}</Button>
            <Button variant="outline" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
