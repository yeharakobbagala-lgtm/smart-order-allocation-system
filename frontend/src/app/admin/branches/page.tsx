"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import type { Branch } from "@/lib/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Table, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";

type BranchForm = {
  name: string;
  address: string;
  capacity: string;
  latitude: string;
  longitude: string;
  active: boolean;
};

const emptyForm: BranchForm = {
  name: "",
  address: "",
  capacity: "30",
  latitude: "",
  longitude: "",
  active: true,
};

export default function AdminBranchesPage() {
  const { branches, upsertBranch, toggleBranchActive } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyForm);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
    );
  }, [branches, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setForm({
      name: branch.name,
      address: branch.address,
      capacity: String(branch.capacity),
      latitude: String(branch.latitude),
      longitude: String(branch.longitude),
      active: branch.active,
    });
    setModalOpen(true);
  };

  const save = () => {
    const capacity = Number(form.capacity);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (!form.name.trim() || !form.address.trim()) {
      toast({ title: "Name and address are required", tone: "error" });
      return;
    }
    if (!Number.isFinite(capacity) || capacity <= 0) {
      toast({ title: "Enter a valid capacity", tone: "error" });
      return;
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      toast({ title: "Enter valid coordinates", tone: "error" });
      return;
    }
    upsertBranch({
      id: editing?.id,
      name: form.name.trim(),
      address: form.address.trim(),
      capacity,
      latitude,
      longitude,
      active: form.active,
    });
    toast({
      title: editing ? "Branch updated" : "Branch created",
      tone: "success",
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branches</h1>
          <p className="mt-1 text-sm text-muted">
            Fulfillment locations and workload capacity.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add branch
        </Button>
      </div>

      <Card>
        <CardBody>
          <Input
            label="Search"
            placeholder="Name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            rightElement={<Search className="h-4 w-4 text-muted" />}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Branch list" description={`${filtered.length} branches`} />
        <CardBody className="p-0 sm:p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No branches found" />
          ) : (
            <Table
              headers={[
                "Name",
                "Address",
                "Capacity",
                "Workload",
                "Coordinates",
                "Status",
                "Actions",
              ]}
              className="rounded-none border-0 border-t border-border"
            >
              {filtered.map((branch) => {
                const pct = Math.round(
                  (branch.currentWorkload / branch.capacity) * 100
                );
                return (
                  <tr key={branch.id} className="hover:bg-slate-50/80">
                    <Td className="font-semibold">{branch.name}</Td>
                    <Td className="max-w-xs text-muted">{branch.address}</Td>
                    <Td>{branch.capacity}</Td>
                    <Td>
                      <span className="font-medium">
                        {branch.currentWorkload}
                      </span>
                      <span className="text-muted"> ({pct}%)</span>
                    </Td>
                    <Td className="text-xs text-muted">
                      {branch.latitude.toFixed(4)},{" "}
                      {branch.longitude.toFixed(4)}
                    </Td>
                    <Td>
                      <Badge variant={branch.active ? "success" : "neutral"}>
                        {branch.active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(branch)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toggleBranchActive(branch.id);
                            toast({
                              title: branch.active
                                ? "Branch deactivated"
                                : "Branch activated",
                              tone: "info",
                            });
                          }}
                        >
                          {branch.active ? "Deactivate" : "Activate"}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit branch" : "Add branch"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Save changes" : "Create branch"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            className="sm:col-span-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Address"
            className="sm:col-span-2"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />
          <Input
            label="Capacity"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) =>
              setForm((f) => ({ ...f, capacity: e.target.value }))
            }
          />
          <Input
            label="Latitude"
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) =>
              setForm((f) => ({ ...f, latitude: e.target.value }))
            }
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) =>
              setForm((f) => ({ ...f, longitude: e.target.value }))
            }
          />
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            Active for allocation
          </label>
        </div>
      </Modal>
    </div>
  );
}
