"use client";

import React from "react";

import { SectionHeader } from "../../../components/common/SectionHeader";
import { DataTable } from "../../../components/tables/DataTable";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { Select } from "../../../components/ui/Select";
import { Spinner } from "../../../components/ui/Spinner";
import { deleteAdminUser, listAdminUsers, updateAdminUser, type UserProfile } from "../../../services/users";

export default function UsersPage(): JSX.Element {
  const [busy, setBusy] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(25);
  const [rows, setRows] = React.useState<UserProfile[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "suspended">("all");
  const [selected, setSelected] = React.useState<UserProfile | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editRole, setEditRole] = React.useState<"admin" | "learner">("learner");
  const pageSizeOptions = [10, 25, 50, 100];

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setRows(await listAdminUsers());
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = React.useMemo(() => {
    if (statusFilter === "all") return rows;
    return rows.filter((user) => user.status === statusFilter);
  }, [rows, statusFilter]);

  async function toggleStatus(user: UserProfile) {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    const result = await updateAdminUser(user.userId, { status: nextStatus });
    setRows((previous) => previous.map((item) => (item.userId === user.userId ? { ...item, ...result.user } : item)));
  }

  async function removeUser(user: UserProfile) {
    await deleteAdminUser(user.userId);
    setRows((previous) => previous.filter((item) => item.userId !== user.userId));
  }

  return (
    <div>
      <SectionHeader
        title="Users"
        subtitle="Manage real learner accounts from the shared backend API."
        right={
          <Button variant="ghost" onClick={() => void load()} disabled={busy}>
            {busy ? <Spinner size={16} /> : null} Refresh
          </Button>
        }
      />

      <Card>
        {error ? (
          <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(239, 68, 68, 0.35)", background: "rgba(239, 68, 68, 0.10)" }}>
            <div style={{ fontWeight: 900 }}>Failed to load users</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>{error}</div>
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>Page size</span>
            <Select value={String(pageSize)} onChange={(event) => setPageSize(Number(event.target.value))}>
              {pageSizeOptions.map((value) => (
                <option key={value} value={value}>
                  {value} rows
                </option>
              ))}
            </Select>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>Status</span>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              <option value="all">all</option>
              <option value="active">active</option>
              <option value="suspended">suspended</option>
            </Select>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            {filteredRows.length} accounts visible from the persistent profile store.
          </div>
        </div>

        <DataTable<UserProfile>
          rows={filteredRows}
          searchKeys={["userId", "displayName", "email", "role", "status"]}
          pageSize={pageSize}
          columns={[
            {
              key: "userId",
              header: "User ID",
              render: (user) => <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>{user.userId}</span>,
            },
            {
              key: "displayName",
              header: "Name",
              render: (user) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "linear-gradient(135deg, rgba(0, 180, 216, 0.22), rgba(245, 158, 11, 0.12))",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 900 }}>{user.displayName}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{user.email ?? "email hidden"}</div>
                  </div>
                </div>
              ),
            },
            {
              key: "role",
              header: "Role",
              render: (user) => <Badge tone={user.role === "admin" ? "warning" : "info"}>{user.role ?? "learner"}</Badge>,
            },
            {
              key: "status",
              header: "Status",
              render: (user) => <Badge tone={user.status === "suspended" ? "warning" : "success"}>{user.status ?? "active"}</Badge>,
            },
            {
              key: "metrics",
              header: "Progress",
              render: (user) => (
                <div style={{ display: "grid", gap: 4, color: "var(--muted)", fontSize: 12 }}>
                  <span>XP {user.points ?? 0}</span>
                  <span>Level {user.level ?? 1}</span>
                  <span>Attempts {user.attempts ?? 0}</span>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (user) => (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelected(user);
                      setEditName(user.displayName);
                      setEditRole(user.role ?? "learner");
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => void toggleStatus(user)}>
                    {user.status === "suspended" ? "Unsuspend" : "Suspend"}
                  </Button>
                  <Button variant="danger" onClick={() => void removeUser(user)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal open={Boolean(selected)} title={selected ? `Edit ${selected.userId}` : "Edit user"} onClose={() => setSelected(null)} width={640}>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>Display name</span>
            <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>Role</span>
            <Select value={editRole} onChange={(event) => setEditRole(event.target.value as "admin" | "learner")}>
              <option value="learner">learner</option>
              <option value="admin">admin</option>
            </Select>
          </label>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Button
              variant="solid"
              onClick={async () => {
                if (!selected) return;
                const result = await updateAdminUser(selected.userId, { displayName: editName, role: editRole });
                setRows((previous) => previous.map((item) => (item.userId === selected.userId ? { ...item, ...result.user } : item)));
                setSelected(null);
              }}
            >
              Save
            </Button>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Changes are saved to the backend user/profile store.</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
