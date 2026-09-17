"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { User, UserRole } from "@/lib/types";
import { fetchAdminUsers, getApiBaseUrl } from "@/lib/api";
import {
  Button,
  Card,
  Modal,
  Input,
  Select,
  StatusBadge,
  EmptyState,
  Alert,
  Tabs,
  LoadingState,
  IconSearch,
  IconPlus,
  IconEdit,
  IconUsers,
} from "@/components/ui";

type RoleFilter = "all" | "customer" | "admin";

function mapApiUser(u: {
  id: number;
  name: string;
  email: string;
  role: string;
}): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: u.role === "admin" ? "admin" : "customer",
    status: "active",
    createdAt: "",
  };
}

export const AdminUsers: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "customer" as UserRole });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    if (!getApiBaseUrl()) {
      setLoadError(
        "Set NEXT_PUBLIC_API_URL (Vercel env for production, or frontend/.env.local locally) to load users from the API."
      );
      setUsers([]);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchAdminUsers();
      setUsers(data.map(mapApiUser));
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Failed to load users from the API."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchesRole =
        roleFilter === "all" ? true : u.role === roleFilter;
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const customerCount = users.filter((u) => u.role === "customer").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const activeAdminCount = users.filter(
    (u) => u.role === "admin" && u.status === "active"
  ).length;

  const openAdd = () => {
    setForm({ name: "", email: "", role: "customer" });
    setEditing(null);
    setError("");
    setModal("add");
  };

  const openEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, role: u.role });
    setEditing(u);
    setError("");
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    if (editing) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editing.id
            ? { ...u, name: form.name, email: form.email, role: form.role }
            : u
        )
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          id: `u${Date.now()}`,
          name: form.name,
          email: form.email,
          role: form.role,
          status: "active",
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    setSaving(false);
    setModal(null);
  };

  const toggleStatus = (user: User) => {
    if (user.role === "admin" && user.status === "active" && activeAdminCount <= 1) {
      alert("Cannot deactivate the last administrator account.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u
      )
    );
  };

  if (loading) {
    return <LoadingState message="Loading users…" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Users</h1>
          <p className="text-[#64748B] mt-1">
            {users.length} users · {customerCount} customer{customerCount !== 1 ? "s" : ""} ·{" "}
            {adminCount} admin{adminCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openAdd} icon={<IconPlus size={16} />}>
          Add User
        </Button>
      </div>

      <Alert variant="info">
        Admin accounts cannot have their passwords viewed or changed here for security reasons. There must always be at least one active administrator.
      </Alert>

      {loadError ? (
        <Alert variant="danger" title="Could not load users">
          {loadError}
        </Alert>
      ) : null}

      <Card className="p-4 space-y-4">
        <Tabs
          tabs={[
            { key: "all", label: "All Users", count: users.length },
            { key: "customer", label: "Customers", count: customerCount },
            { key: "admin", label: "Administrators", count: adminCount },
          ]}
          active={roleFilter}
          onChange={(key) => setRoleFilter(key as RoleFilter)}
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
            <IconSearch size={16} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={<IconUsers size={24} />}
                      title="No users found"
                      description={
                        roleFilter === "customer"
                          ? "No customer accounts match this view."
                          : roleFilter === "admin"
                            ? "No administrator accounts match this view."
                            : "Try a different search."
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-[#F8FAFC] transition-colors ${user.id === currentUser.id ? "bg-[#EEF2FF]/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-[#0F172A]">{user.name}</p>
                          {user.id === currentUser.id && (
                            <p className="text-xs text-[#4F46E5]">You</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{user.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8] text-xs whitespace-nowrap">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 rounded-lg hover:bg-[#EEF2FF] text-[#94A3B8] hover:text-[#4F46E5] transition-colors"
                        >
                          <IconEdit size={15} />
                        </button>
                        <button
                          onClick={() => toggleStatus(user)}
                          disabled={user.id === currentUser.id}
                          className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${user.status === "active" ? "hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#94A3B8]" : "hover:bg-[#ECFDF5] hover:text-[#10B981] text-[#94A3B8]"} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {user.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Add User" : "Edit User"}
        size="sm"
      >
        <div className="space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Sarah Chen"
          />
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@example.com"
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            options={[
              { value: "customer", label: "Customer" },
              { value: "admin", label: "Admin" },
            ]}
          />
          {modal === "add" && (
            <Alert variant="info" className="text-xs">
              A welcome email with login instructions will be sent to the user.
            </Alert>
          )}
          <div className="flex gap-3 pt-2">
            <Button loading={saving} onClick={handleSave} className="flex-1">
              {modal === "add" ? "Create User" : "Save Changes"}
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
