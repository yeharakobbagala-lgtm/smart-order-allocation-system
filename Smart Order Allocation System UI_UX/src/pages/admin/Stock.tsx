import React, { useState } from "react";
import { MOCK_BRANCHES, MOCK_PRODUCTS, MOCK_STOCK } from "../../data";
import type { StockEntry } from "../../types";
import { Button, Card, Badge, Modal, Input, IconSearch, IconEdit, IconInventory } from "../../components/ui";

export const AdminStock: React.FC = () => {
  const [stock, setStock] = useState<StockEntry[]>(MOCK_STOCK);
  const [branchFilter, setBranchFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<{ entry: StockEntry; product: string; branch: string } | null>(null);
  const [editVal, setEditVal] = useState("");
  const [saving, setSaving] = useState(false);

  const branches = MOCK_BRANCHES.filter((b) => b.active);

  const filteredBranches = branchFilter === "all" ? branches : branches.filter((b) => b.id === branchFilter);

  const getStock = (branchId: string, productId: string) =>
    stock.find((s) => s.branchId === branchId && s.productId === productId) || { branchId, productId, physical: 0, reserved: 0 };

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) => p.active && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (entry: StockEntry, productName: string, branchName: string) => {
    setEditVal(String(entry.physical));
    setEditModal({ entry, product: productName, branch: branchName });
  };

  const handleSave = async () => {
    if (!editModal) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setStock((prev) => {
      const idx = prev.findIndex((s) => s.branchId === editModal.entry.branchId && s.productId === editModal.entry.productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], physical: Number(editVal) };
        return next;
      }
      return [...prev, { ...editModal.entry, physical: Number(editVal) }];
    });
    setSaving(false);
    setEditModal(null);
  };

  const availableColor = (avail: number) => avail === 0 ? "text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]" : avail < 10 ? "text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]" : "text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#0F172A]">Stock Management</h1>
        <p className="text-[#64748B] mt-1">Physical stock, reservations, and available inventory per branch.</p>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 text-xs">
          {[
            ["Physical Stock", "Total units in warehouse", "#4F46E5"],
            ["Reserved", "Units held for active reservations", "#F59E0B"],
            ["Available", "Physical − Reserved", "#10B981"],
          ].map(([label, desc, color]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <div>
                <span className="font-semibold text-[#334155]">{label}</span>
                <span className="text-[#94A3B8] ml-1">({desc})</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"><IconSearch size={16} /></span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
        </div>
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="appearance-none px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#334155] focus:outline-none">
          <option value="all">All Branches</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Stock Table per Branch */}
      {filteredBranches.map((branch) => (
        <Card key={branch.id} className="overflow-hidden">
          <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                <IconInventory size={14} className="text-[#4F46E5]" />
              </div>
              <h2 className="font-display font-bold text-[#0F172A]">{branch.name}</h2>
              <span className="text-xs text-[#94A3B8]">— {branch.city}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Product", "Category", "Physical", "Reserved", "Available", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {filteredProducts.map((product) => {
                  const entry = getStock(branch.id, product.id);
                  const available = entry.physical - entry.reserved;
                  return (
                    <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={product.image} alt={product.name} className="w-9 h-9 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
                          <p className="font-medium text-[#0F172A] leading-tight">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="muted">{product.category}</Badge></td>
                      <td className="px-4 py-3">
                        <span className="font-mono-data font-bold text-[#4F46E5]">{entry.physical}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono-data font-medium text-[#F59E0B]">{entry.reserved}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono-data font-bold px-2 py-0.5 rounded-lg border text-xs ${availableColor(available)}`}>{available}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openEdit(entry, product.name, branch.name)} className="p-2 rounded-lg hover:bg-[#EEF2FF] text-[#94A3B8] hover:text-[#4F46E5] transition-colors">
                          <IconEdit size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <Modal open={editModal !== null} onClose={() => setEditModal(null)} title="Update Stock" size="sm">
        {editModal && (
          <div className="space-y-4">
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8]">Branch</p>
              <p className="font-medium text-[#0F172A] text-sm">{editModal.branch}</p>
              <p className="text-xs text-[#94A3B8] mt-2">Product</p>
              <p className="font-medium text-[#0F172A] text-sm">{editModal.product}</p>
            </div>
            <Input
              label="Physical Stock (units)"
              type="number"
              min="0"
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              hint={`Currently reserved: ${editModal.entry.reserved} units`}
            />
            <div className="flex gap-3">
              <Button loading={saving} onClick={handleSave} className="flex-1">Update Stock</Button>
              <Button variant="outline" onClick={() => setEditModal(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
