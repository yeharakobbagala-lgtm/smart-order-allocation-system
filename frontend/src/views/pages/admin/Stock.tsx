"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Branch, Product } from "@/lib/types";
import {
  createBranchStock,
  deleteBranchStock,
  fetchBranchStock,
  fetchBranches,
  fetchProducts,
  fetchStockAvailability,
  updateBranchStock,
  ApiError,
} from "@/lib/api";
import { mapApiProduct } from "@/lib/mappers";
import {
  Button,
  Card,
  Badge,
  Modal,
  Input,
  LoadingState,
  ErrorState,
  IconSearch,
  IconEdit,
  IconInventory,
  IconPlus,
} from "@/components/ui";

interface StockRow {
  id: number | null;
  branchId: string;
  productId: string;
  physical: number;
  restockQuantity: number;
  restockDate: string | null;
  available: number | null;
}

export const AdminStock: React.FC = () => {
  const [stock, setStock] = useState<StockRow[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<{
    row: StockRow;
    productName: string;
    branchName: string;
  } | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({
    branchId: "",
    productId: "",
    quantity: "",
    restockQuantity: "",
    restockDate: "",
  });
  const [editForm, setEditForm] = useState({
    quantity: "",
    restockQuantity: "",
    restockDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadAvailability = useCallback(async (rows: StockRow[]) => {
    const updated = await Promise.all(
      rows.map(async (row) => {
        if (row.physical <= 0) return { ...row, available: row.physical };
        try {
          const avail = await fetchStockAvailability(
            Number(row.branchId),
            Number(row.productId),
            row.physical
          );
          return { ...row, available: avail.available_quantity };
        } catch {
          return { ...row, available: null };
        }
      })
    );
    // Merge into existing state — never replace the full list with a partial
    // subset (that drops stock IDs and causes edit to POST instead of PUT).
    setStock((prev) => {
      const byKey = new Map(
        updated.map((r) => [`${r.branchId}:${r.productId}`, r] as const)
      );
      const merged = prev.map((r) => {
        const key = `${r.branchId}:${r.productId}`;
        return byKey.get(key) ?? r;
      });
      for (const r of updated) {
        const key = `${r.branchId}:${r.productId}`;
        if (!prev.some((p) => `${p.branchId}:${p.productId}` === key)) {
          merged.push(r);
        }
      }
      return merged;
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [apiStock, apiBranches, apiProducts] = await Promise.all([
        fetchBranchStock(),
        fetchBranches(),
        fetchProducts(),
      ]);
      setBranches(
        apiBranches
          .filter((b) => b.active)
          .map((b) => ({
            id: String(b.id),
            name: b.name,
            address: b.address,
            city: b.address,
            lat: b.latitude,
            lng: b.longitude,
            capacity: b.capacity,
            active: b.active,
            currentWorkload: 0,
          }))
      );
      setProducts(apiProducts.filter((p) => p.active).map(mapApiProduct));
      const rows: StockRow[] = apiStock.map((s) => ({
        id: s.id,
        branchId: String(s.branch_id),
        productId: String(s.product_id),
        physical: s.quantity,
        restockQuantity: s.restock_quantity,
        restockDate: s.restock_date,
        available: null,
      }));
      setStock(rows);
      void loadAvailability(rows);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : "Failed to load stock."
      );
    } finally {
      setLoading(false);
    }
  }, [loadAvailability]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeBranches = branches.filter((b) => b.active);

  const filteredBranches =
    branchFilter === "all"
      ? activeBranches
      : activeBranches.filter((b) => b.id === branchFilter);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const findStock = (branchId: string, productId: string) =>
    stock.find((s) => s.branchId === branchId && s.productId === productId);

  const getStock = (branchId: string, productId: string): StockRow => {
    return (
      findStock(branchId, productId) ?? {
        id: null,
        branchId,
        productId,
        physical: 0,
        restockQuantity: 0,
        restockDate: null,
        available: null,
      }
    );
  };

  const reservedDisplay = (entry: StockRow) => {
    if (entry.available == null) return "—";
    return Math.max(0, entry.physical - entry.available);
  };

  const availableDisplay = (entry: StockRow) => {
    if (entry.available == null) return null;
    return entry.available;
  };

  const openEdit = (entry: StockRow, productName: string, branchName: string) => {
    // Always resolve the latest row (including stock id) from state.
    const resolved = findStock(entry.branchId, entry.productId) ?? entry;
    setEditForm({
      quantity: String(resolved.physical),
      restockQuantity: String(resolved.restockQuantity),
      restockDate: resolved.restockDate
        ? resolved.restockDate.slice(0, 10)
        : "",
    });
    setSaveError("");
    setEditModal({ row: resolved, productName, branchName });
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    setSaveError("");
    try {
      const quantity = Number(editForm.quantity);
      const restockQuantity = Number(editForm.restockQuantity);
      if (!Number.isFinite(quantity) || quantity < 0) {
        setSaveError("Physical stock must be a valid number.");
        return;
      }
      const payload = {
        quantity,
        restock_quantity: Number.isFinite(restockQuantity) ? restockQuantity : 0,
        restock_date: editForm.restockDate.trim() || null,
      };

      // Prefer ID from modal; fall back to current stock list so we never
      // accidentally POST a duplicate for an existing branch+product row.
      const existingId =
        editModal.row.id ??
        findStock(editModal.row.branchId, editModal.row.productId)?.id ??
        null;

      let row: StockRow;
      if (existingId != null) {
        const updated = await updateBranchStock(existingId, payload);
        row = {
          id: updated.id,
          branchId: String(updated.branch_id),
          productId: String(updated.product_id),
          physical: updated.quantity,
          restockQuantity: updated.restock_quantity,
          restockDate: updated.restock_date,
          available: null,
        };
      } else {
        const created = await createBranchStock({
          branch_id: Number(editModal.row.branchId),
          product_id: Number(editModal.row.productId),
          quantity: payload.quantity,
          restock_quantity: payload.restock_quantity,
          restock_date: payload.restock_date,
        });
        row = {
          id: created.id,
          branchId: String(created.branch_id),
          productId: String(created.product_id),
          physical: created.quantity,
          restockQuantity: created.restock_quantity,
          restockDate: created.restock_date,
          available: null,
        };
      }
      setStock((prev) => {
        const idx = prev.findIndex(
          (s) => s.branchId === row.branchId && s.productId === row.productId
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = row;
          return next;
        }
        return [...prev, row];
      });
      void loadAvailability([row]);
      setEditModal(null);
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Failed to update stock."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const branchId = form.branchId;
      const productId = form.productId;
      if (!branchId || !productId) {
        setSaveError("Select a branch and product.");
        return;
      }
      const quantity = Number(form.quantity);
      if (!Number.isFinite(quantity) || quantity < 0) {
        setSaveError("Physical stock must be a valid number.");
        return;
      }
      const payload = {
        quantity,
        restock_quantity: Number(form.restockQuantity) || 0,
        restock_date: form.restockDate.trim() || null,
      };

      const existing = findStock(branchId, productId);
      let row: StockRow;
      if (existing?.id != null) {
        // Existing combination → update, never duplicate-create.
        const updated = await updateBranchStock(existing.id, payload);
        row = {
          id: updated.id,
          branchId: String(updated.branch_id),
          productId: String(updated.product_id),
          physical: updated.quantity,
          restockQuantity: updated.restock_quantity,
          restockDate: updated.restock_date,
          available: null,
        };
      } else {
        const created = await createBranchStock({
          branch_id: Number(branchId),
          product_id: Number(productId),
          quantity: payload.quantity,
          restock_quantity: payload.restock_quantity,
          restock_date: payload.restock_date,
        });
        row = {
          id: created.id,
          branchId: String(created.branch_id),
          productId: String(created.product_id),
          physical: created.quantity,
          restockQuantity: created.restock_quantity,
          restockDate: created.restock_date,
          available: null,
        };
      }
      setStock((prev) => {
        const idx = prev.findIndex(
          (s) => s.branchId === row.branchId && s.productId === row.productId
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = row;
          return next;
        }
        return [...prev, row];
      });
      void loadAvailability([row]);
      setAddModal(false);
      setForm({
        branchId: "",
        productId: "",
        quantity: "",
        restockQuantity: "",
        restockDate: "",
      });
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Failed to create stock."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: StockRow) => {
    if (row.id == null) return;
    if (!confirm("Delete this stock record?")) return;
    try {
      await deleteBranchStock(row.id);
      setStock((prev) => prev.filter((s) => s.id !== row.id));
    } catch {
      /* ignore */
    }
  };

  const availableColor = (avail: number) =>
    avail === 0
      ? "text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]"
      : avail < 10
        ? "text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]"
        : "text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]";

  if (loading) return <LoadingState message="Loading stock…" />;
  if (loadError && stock.length === 0 && branches.length === 0) {
    return <ErrorState message={loadError} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Stock Management</h1>
          <p className="text-[#64748B] mt-1">Physical stock, reservations, and available inventory per branch.</p>
        </div>
        <Button icon={<IconPlus size={16} />} onClick={() => setAddModal(true)}>
          Add Stock
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4 text-xs">
          {[
            ["Physical Stock", "Total units in warehouse", "#4F46E5"],
            ["Reserved", "Physical − available (when loaded)", "#F59E0B"],
            ["Available", "From reservations API", "#10B981"],
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

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"><IconSearch size={16} /></span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
        </div>
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="appearance-none px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#334155] focus:outline-none">
          <option value="all">All Branches</option>
          {activeBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

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
                  {["Product", "Physical", "Restock Qty", "Restock Date", "Reserved", "Available", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {filteredProducts.map((product) => {
                  const entry = getStock(branch.id, product.id);
                  const avail = availableDisplay(entry);
                  const reserved = reservedDisplay(entry);
                  return (
                    <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={product.image} alt={product.name} className="w-9 h-9 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
                          <p className="font-medium text-[#0F172A] leading-tight">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono-data font-bold text-[#4F46E5]">{entry.physical}</span>
                      </td>
                      <td className="px-4 py-3 font-mono-data text-[#64748B]">{entry.restockQuantity}</td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {entry.restockDate
                          ? new Date(entry.restockDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono-data font-medium text-[#F59E0B]">{reserved}</span>
                      </td>
                      <td className="px-4 py-3">
                        {avail != null ? (
                          <span className={`font-mono-data font-bold px-2 py-0.5 rounded-lg border text-xs ${availableColor(avail)}`}>{avail}</span>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openEdit(entry, product.name, branch.name)} className="p-2 rounded-lg hover:bg-[#EEF2FF] text-[#94A3B8] hover:text-[#4F46E5] transition-colors">
                          <IconEdit size={15} />
                        </button>
                        {entry.id != null && (
                          <button onClick={() => void handleDelete(entry)} className="p-2 rounded-lg hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#EF4444] text-xs ml-1">
                            Del
                          </button>
                        )}
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
            {saveError && <p className="text-sm text-[#EF4444]">{saveError}</p>}
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8]">Branch</p>
              <p className="font-medium text-[#0F172A] text-sm">{editModal.branchName}</p>
              <p className="text-xs text-[#94A3B8] mt-2">Product</p>
              <p className="font-medium text-[#0F172A] text-sm">{editModal.productName}</p>
            </div>
            <Input label="Physical Stock (units)" type="number" min="0" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} />
            <Input label="Restock quantity" type="number" min="0" value={editForm.restockQuantity} onChange={(e) => setEditForm({ ...editForm, restockQuantity: e.target.value })} />
            <Input label="Restock date" type="date" value={editForm.restockDate} onChange={(e) => setEditForm({ ...editForm, restockDate: e.target.value })} />
            <div className="flex gap-3">
              <Button loading={saving} onClick={() => void handleSaveEdit()} className="flex-1">Update Stock</Button>
              <Button variant="outline" onClick={() => setEditModal(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Stock" size="sm">
        <div className="space-y-4">
          {saveError && <p className="text-sm text-[#EF4444]">{saveError}</p>}
          <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm">
            <option value="">Select branch</option>
            {activeBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm">
            <option value="">Select product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Input label="Physical quantity" type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <Input label="Restock quantity" type="number" min="0" value={form.restockQuantity} onChange={(e) => setForm({ ...form, restockQuantity: e.target.value })} />
          <Input label="Restock date" type="date" value={form.restockDate} onChange={(e) => setForm({ ...form, restockDate: e.target.value })} />
          <div className="flex gap-3">
            <Button loading={saving} onClick={() => void handleAdd()} className="flex-1">Create</Button>
            <Button variant="outline" onClick={() => setAddModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
