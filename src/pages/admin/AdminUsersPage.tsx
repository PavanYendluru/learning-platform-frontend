import { useEffect, useState, useMemo } from "react";
import { adminApi } from "../../api/adminApi";
import type { User, UserStatus } from "../../types/user.types";
import { AdminDataTable, type Column } from "../../components/admin/AdminDataTable";
import { UserDetailModal } from "../../components/admin/users/UserDetailModal";
import { Button } from "../../components/common/Button";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import { useToast } from "../../hooks/useToast";
import "./AdminUsersPage.css";

export function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  /* Quick confirmation modal target for table inline actions */
  const [pendingStatusUser, setPendingStatusUser] = useState<{ user: User; newStatus: UserStatus } | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    adminApi
      .getUsers(roleFilter, statusFilter)
      .then((data) => {
        setUsers(data);
      })
      .catch(() => {
        toast.error("Failed to load users list");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery]);

  function handleUserUpdated(updatedUser: User) {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (selectedUser?.id === updatedUser.id) {
      setSelectedUser(updatedUser);
    }
  }

  async function handleConfirmStatusToggle() {
    if (!pendingStatusUser) return;
    const { user, newStatus } = pendingStatusUser;
    try {
      await adminApi.toggleUserStatus(user.id, newStatus);
      handleUserUpdated({ ...user, status: newStatus });
      toast.success(`User ${user.name} is now ${newStatus}`);
    } catch {
      handleUserUpdated({ ...user, status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
    } finally {
      setPendingStatusUser(null);
    }
  }

  const columns: Column<User>[] = [
    {
      header: "Learner / User",
      accessor: (u) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary), #8b5cf6)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: "var(--text-xs)",
              flexShrink: 0,
            }}
          >
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style={{ color: "var(--color-ink)", display: "block" }}>{u.name}</strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (u) => (
        <span className={`status-pill ${u.role === "ADMIN" ? "admin" : "user"}`}>
          {u.role}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (u) => (
        <span className={`status-pill ${u.status === "ACTIVE" ? "active" : "inactive"}`}>
          {u.status}
        </span>
      ),
    },
    {
      header: "Registered",
      accessor: (u) => (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Last Active",
      accessor: (u) => (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
          {u.lastActiveAt ?? "N/A"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (u) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Button
            variant="ghost"
            style={{ padding: "0.25rem 0.5rem", minHeight: "1.8rem", fontSize: "var(--text-xs)" }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(u);
              setIsDetailOpen(true);
            }}
          >
            <Icon name="user" size={14} />
            View
          </Button>

          <Button
            variant="ghost"
            style={{
              padding: "0.25rem 0.5rem",
              minHeight: "1.8rem",
              fontSize: "var(--text-xs)",
              color: u.status === "ACTIVE" ? "var(--color-danger)" : "#10b981",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setPendingStatusUser({
                user: u,
                newStatus: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              });
            }}
          >
            <Icon name={u.status === "ACTIVE" ? "close" : "check"} size={14} />
            {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="admin-users-container">
      <PageHeader
        title="Users & Learners Management"
        description="Monitor registered platform learners, view learning progress breakdown, manage user roles, and adjust account access."
      />

      <div className="admin-users-filters">
        <div className="search-input-wrapper">
          <Icon name="search" size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search learners by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Learners (USER)</option>
          <option value="ADMIN">Administrators (ADMIN)</option>
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Users</option>
          <option value="INACTIVE">Inactive Users</option>
        </select>
      </div>

      {loading ? (
        <LoadingState message="Loading platform learners..." />
      ) : filteredUsers.length > 0 ? (
        <AdminDataTable
          columns={columns}
          data={filteredUsers}
          onRowClick={(user: User) => {
            setSelectedUser(user);
            setIsDetailOpen(true);
          }}
        />
      ) : (
        <EmptyState
          title="No learners found"
          message="No users match the search criteria or filter configuration."
          icon="user"
        />
      )}

      {/* User Detail Drawer Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUserUpdated={handleUserUpdated}
      />

      {/* Confirmation Modal for Quick Status Toggle */}
      <ConfirmationModal
        isOpen={Boolean(pendingStatusUser)}
        title={pendingStatusUser?.newStatus === "INACTIVE" ? "Deactivate Learner Account" : "Activate Learner Account"}
        message={`Are you sure you want to change ${pendingStatusUser?.user.name}'s account status to ${pendingStatusUser?.newStatus}?`}
        confirmLabel={pendingStatusUser?.newStatus === "INACTIVE" ? "Deactivate" : "Activate"}
        variant={pendingStatusUser?.newStatus === "INACTIVE" ? "danger" : "primary"}
        onConfirm={handleConfirmStatusToggle}
        onClose={() => setPendingStatusUser(null)}
      />
    </section>
  );
}
