"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Branch } from "@/lib/types";
import { createBranch, fetchBranches, type ApiBranch, ApiError } from "@/lib/api";
import { BranchLocationPicker } from "@/components/BranchLocationPicker";
import {
  Button,
  Card,
  Modal,
  Input,
  Alert,
  LoadingState,
  ErrorState,
  IconPlus,
  IconEdit,
  IconBranch,
  IconMapPin,
} from "@/components/ui";

interface BranchFormState {
  name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  capacity: string;
}

const emptyForm = (): BranchFormState => ({
  name: "",
  address: "",
  city: "",
  latitude: null,
  longitude: null,
  capacity: "",
});

function mapApiBranch(b: ApiBranch, orderCount = 0): Branch {
  return {
    id: String(b.id),
    name: b.name,
    address: b.address,
    city: b.address,
    lat: b.latitude,
    lng: b.longitude,
    capacity: b.capacity,
    active: b.active,
    currentWorkload: orderCount,
  };
}

export const AdminBranches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchBranches();
      setBranches(data.map((b) => mapApiBranch(b)));
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : "Failed to load branches."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openAdd = () => {
    setForm(emptyForm());
    setEditing(null);
    setError("");
    setModal("add");
  };

  const openEdit = (b: Branch) => {
    setForm({
      name: b.name,
      address: b.address,
      city: b.city,
      latitude: b.lat,
      longitude: b.lng,
      capacity: String(b.capacity),
    });
    setEditing(b);
    setError("");
    setModal("edit");
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Branch name is required.");
      return;
    }
    if (!form.address.trim()) {
      setError("Branch address is required.");
      return;
    }
    if (form.latitude == null || form.longitude == null) {
      setError(
        "Latitude and longitude are required. Use Find Location or pick a location on the map."
      );
      return;
    }
    const capacity = Number(form.capacity);
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setError("Capacity must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      if (modal === "add") {
        const created = await createBranch({
          name: form.name.trim(),
          address: form.address.trim(),
          latitude: form.latitude,
          longitude: form.longitude,
          capacity,
        });
        setBranches((prev) => [
          {
            ...mapApiBranch(created),
            city: form.city.trim() || created.address,
          },
          ...prev,
        ]);
      } else if (editing) {
        setBranches((prev) =>
          prev.map((b) =>
            b.id === editing.id
              ? {
                  ...b,
                  name: form.name.trim(),
                  address: form.address.trim(),
                  city: form.city.trim(),
                  lat: form.latitude!,
                  lng: form.longitude!,
                  capacity,
                }
              : b
          )
        );
      }
      setModal(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to save the branch."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (id: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  if (loading) return <LoadingState message="Loading branches…" />;
  if (loadError && branches.length === 0) {
    return <ErrorState message={loadError} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Branches</h1>
          <p className="text-[#64748B] mt-1">
            {branches.filter((b) => b.active).length} active branches
          </p>
        </div>
        <Button onClick={openAdd} icon={<IconPlus size={16} />}>
          Add Branch
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-5">
        {branches.map((branch) => {
          const workloadPct = branch.active
            ? Math.round((branch.currentWorkload / branch.capacity) * 100)
            : 0;
          return (
            <Card key={branch.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-xl flex items-center justify-center shrink-0">
                    <IconBranch size={18} className="text-[#4F46E5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[#0F172A]">
                      {branch.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[#94A3B8] mt-0.5">
                      <IconMapPin size={12} />
                      {branch.city}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${branch.active ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}
                  >
                    {branch.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#64748B] mb-4">{branch.address}</p>

              {branch.active && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#64748B]">Workload</span>
                    <span
                      className={`font-bold ${workloadPct > 80 ? "text-[#EF4444]" : workloadPct > 60 ? "text-[#F59E0B]" : "text-[#10B981]"}`}
                    >
                      {workloadPct}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(workloadPct, 100)}%`,
                        backgroundColor:
                          workloadPct > 80
                            ? "#EF4444"
                            : workloadPct > 60
                              ? "#F59E0B"
                              : "#10B981",
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {branch.currentWorkload} / {branch.capacity} capacity
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="bg-[#F8FAFC] rounded-lg p-2.5 border border-[#E2E8F0]">
                  <p className="text-[#94A3B8]">Capacity</p>
                  <p className="font-bold text-[#0F172A] mt-0.5">{branch.capacity}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-2.5 border border-[#E2E8F0]">
                  <p className="text-[#94A3B8]">Location</p>
                  <p className="font-mono-data text-[#64748B] mt-0.5 text-[11px]">
                    {branch.lat.toFixed(3)}, {branch.lng.toFixed(3)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(branch)}
                  icon={<IconEdit size={14} />}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant={branch.active ? "danger" : "success"}
                  size="sm"
                  onClick={() => toggleActive(branch.id)}
                  className="flex-1"
                >
                  {branch.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Add Branch" : "Edit Branch"}
        size="lg"
      >
        <div className="space-y-4">
          {error ? <Alert variant="danger">{error}</Alert> : null}
          <Input
            label="Branch Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Downtown Hub"
          />
          <Input
            label="City / Region (optional label)"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Colombo"
            hint="Display label only. Coordinates come from the map location or Find Location."
          />

          {modal !== null ? (
            <BranchLocationPicker
              address={form.address}
              onAddressChange={(address) => setForm((f) => ({ ...f, address }))}
              latitude={form.latitude}
              longitude={form.longitude}
              onCoordinatesChange={(latitude, longitude) =>
                setForm((f) => ({ ...f, latitude, longitude }))
              }
              disabled={saving}
            />
          ) : null}

          <Input
            label="Capacity"
            type="number"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            placeholder="200"
            hint="Must be greater than 0."
          />
          <div className="flex gap-3 pt-2">
            <Button loading={saving} onClick={() => void handleSave()} className="flex-1">
              {modal === "add" ? "Add Branch" : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setModal(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
