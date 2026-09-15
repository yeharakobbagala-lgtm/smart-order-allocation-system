"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { formatDate, formatStatusLabel } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Table, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";

export default function AdminUsersPage() {
  const { users, createUser, updateUserRole, toggleUserStatus } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "customer" as UserRole,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.includes(q)
    );
  }, [users, search]);

  const submitCreate = () => {
    const result = createUser(form);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: "User created", tone: "success" });
    setForm({ name: "", email: "", role: "customer" });
    setModalOpen(false);
  };

  const changeRole = (id: number, role: UserRole) => {
    const result = updateUserRole(id, role);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: "Role updated", tone: "success" });
  };

  const toggleStatus = (id: number) => {
    const result = toggleUserStatus(id);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: "User status updated", tone: "success" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted">
            Manage customer and admin accounts.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Create user
        </Button>
      </div>

      <Card>
        <CardBody>
          <Input
            label="Search"
            placeholder="Name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            rightElement={<Search className="h-4 w-4 text-muted" />}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="User list" description={`${filtered.length} users`} />
        <CardBody className="p-0 sm:p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No users found" />
          ) : (
            <Table
              headers={[
                "Name",
                "Email",
                "Role",
                "Created",
                "Status",
                "Actions",
              ]}
              className="rounded-none border-0 border-t border-border"
            >
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80">
                  <Td className="font-semibold">{user.name}</Td>
                  <Td className="text-muted">{user.email}</Td>
                  <Td>
                    <Select
                      value={user.role}
                      onChange={(e) =>
                        changeRole(user.id, e.target.value as UserRole)
                      }
                      options={[
                        { label: "Customer", value: "customer" },
                        { label: "Admin", value: "admin" },
                      ]}
                      className="h-9 min-w-[130px]"
                    />
                  </Td>
                  <Td className="text-muted">{formatDate(user.createdAt)}</Td>
                  <Td>
                    <Badge
                      variant={user.status === "active" ? "success" : "neutral"}
                    >
                      {formatStatusLabel(user.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(user.id)}
                    >
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
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
        title="Create user"
        description="Creates an account without setting a password (demo mode)."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitCreate}>Create user</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) =>
              setForm((f) => ({ ...f, role: e.target.value as UserRole }))
            }
            options={[
              { label: "Customer", value: "customer" },
              { label: "Admin", value: "admin" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
