"use client";

import { useRouter } from "next/navigation";
import { LogOut, Mail, Shield, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { formatDate, formatStatusLabel } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Your administrator account details.
        </p>
      </div>

      <Card>
        <CardHeader title="Account" />
        <CardBody className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <User className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{user.name}</p>
              <Badge variant="primary" className="mt-1">
                {formatStatusLabel(user.role)}
              </Badge>
            </div>
          </div>

          <dl className="space-y-4 text-sm">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3">
              <Mail className="mt-0.5 h-4 w-4 text-muted" />
              <div>
                <dt className="text-xs font-medium uppercase text-muted">
                  Email
                </dt>
                <dd className="font-medium text-foreground">{user.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3">
              <Shield className="mt-0.5 h-4 w-4 text-muted" />
              <div>
                <dt className="text-xs font-medium uppercase text-muted">
                  Status
                </dt>
                <dd>
                  <Badge
                    variant={user.status === "active" ? "success" : "neutral"}
                  >
                    {formatStatusLabel(user.status)}
                  </Badge>
                </dd>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase text-muted">
                Member since
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatDate(user.createdAt)}
              </dd>
            </div>
          </dl>

          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
