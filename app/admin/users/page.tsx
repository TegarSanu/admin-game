"use client";

import { useEffect, useState } from "react";
import {
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Filter,
  Users as UsersIcon,
  Eye,
  User as UserIcon,
  Shield,
  KeyRound,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import UserDetails from "@/components/admin/users/UserDetails";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  password?: string;
};

type RoleOption = {
  _id: string;
  name: string;
};

const tableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Detail state
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Dropdown state for actions
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [password, setPassword] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (roleFilter) params.append("role", roleFilter);
    if (statusFilter) params.append("status", statusFilter);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    
    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch users", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter, statusFilter, page]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetch('/api/admin/roles')
      .then(res => res.json())
      .then(data => setRoles(data.roles || []))
      .catch(err => console.error('Failed to fetch roles', err));
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    const defaultRole = roles.find(r => r.name === 'User');
    setCurrentUser({ role: defaultRole?._id || '', status: "Active" });
    setPassword("");
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    // Find the role ObjectId by name for the select
    const matchedRole = roles.find(r => r.name === user.role);
    setCurrentUser({ ...user, role: matchedRole?._id || '' });
    setPassword("");
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const openUserDetails = (user: User) => {
    setDetailUser(user);
    setIsDetailOpen(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
    setPassword("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url =
        modalMode === "create"
          ? "/api/admin/users"
          : `/api/admin/users/${currentUser.id}`;

      const method = modalMode === "create" ? "POST" : "PUT";

      const payload: any = { ...currentUser };
      if (password) payload.password = password;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        closeModal();
        fetchUsers(); // Refresh list
        toast.success(
          modalMode === "create"
            ? "User created successfully"
            : "User updated successfully",
        );
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || "Failed to save"}`);
      }
    } catch (error) {
      console.error("Failed to save user", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setOpenDropdownId(null);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers(); // Refresh list
        toast.success("User deleted successfully");
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const from = total > 0 ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-gradient">
            System Users
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Manage platform access, roles, and profiles.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 border px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${showFilters ? "bg-muted border-foreground/20 text-foreground" : "bg-transparent border-border text-foreground hover:bg-muted/50"}`}
          >
            <Filter className="w-4 h-4 text-muted-foreground" />
            Filter
          </motion.button>

          <motion.button
            onClick={openCreateModal}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-lg font-medium text-sm transition-all hover:bg-foreground/90 flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            Add User
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-2xl overflow-hidden min-h-100 relative"
      >
        {/* Table Toolbar */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3 border-b border-border flex items-center justify-between bg-muted/20 overflow-hidden"
            >
              <div className="flex items-center gap-3 w-full max-w-2xl flex-wrap">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-foreground"
                  />
                </div>
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-background border border-border rounded-md text-xs font-bold px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-foreground/20 text-foreground cursor-pointer"
                >
                  <option value="">All Roles</option>
                  {roles.map(r => (
                    <option key={r._id} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-background border border-border rounded-md text-xs font-bold px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-foreground/20 text-foreground cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded border border-border hidden sm:inline-block">
                  {total} Records
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-border bg-muted/10">
              <tr>
                <th className="px-5 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border bg-background text-foreground focus:ring-foreground/20 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">
                  User Profile
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">
                  Security Role
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">
                  Account Status
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
              className="divide-y divide-border/50"
            >
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                      <p className="font-medium text-xs">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-muted-foreground"
                  >
                    <div className="w-12 h-12 bg-muted/50 border border-border rounded-full flex items-center justify-center mx-auto mb-3">
                      <UsersIcon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      No users found
                    </p>
                    <p className="text-xs">
                      Add a new user to populate the table.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <motion.tr
                    variants={tableRowVariants}
                    key={user.id}
                    className={`hover:bg-muted/30 transition-colors group border-b border-border last:border-0 ${
                      selectedUsers.includes(user.id) ? "bg-muted/40" : ""
                    }`}
                  >
                    <td className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-border bg-background text-foreground focus:ring-foreground/20 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground leading-none">
                            {user.name}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground mt-1">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-black bg-muted/50 border border-border/50 text-muted-foreground">
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border backdrop-blur-md ${
                          user.status === "Active"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20"
                            : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"}`}
                        ></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openUserDetails(user)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === user.id ? null : user.id,
                            )
                          }
                          className="text-slate-400 hover:text-accent p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Animated Action Dropdown */}
                      <AnimatePresence>
                        {openDropdownId === user.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-8 top-10 w-44 glass-panel py-1.5 z-20 overflow-hidden rounded-xl shadow-2xl border border-border/50"
                          >
                            <button
                              onClick={() => openEditModal(user)}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold tracking-wide text-foreground hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />{" "}
                              Edit Record
                            </button>
                            <button
                              onClick={() => openUserDetails(user)}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold tracking-wide text-foreground hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                            >
                              <UserIcon className="w-3.5 h-3.5 text-slate-400" />{" "}
                              View Profile
                            </button>
                            <div className="h-px bg-border/50 my-1 mx-2"></div>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold tracking-wide text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />{" "}
                              Purge User
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl z-30 flex items-center gap-6 border border-background/10 backdrop-blur-md"
            >
              <div className="flex items-center gap-2 border-r border-background/20 pr-6 mr-2">
                <span className="w-5 h-5 rounded-full bg-background text-foreground flex items-center justify-center text-[10px] font-black">
                  {selectedUsers.length}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  Selected
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={async () => {
                    if (!confirm(`Delete ${selectedUsers.length} selected users?`)) return;
                    for (const uid of selectedUsers) {
                      await fetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
                    }
                    setSelectedUsers([]);
                    fetchUsers();
                    toast.success(`${selectedUsers.length} users deleted`);
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-widest"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button
                  onClick={() => {
                    const csv = ['Name,Email,Role,Status', ...users.filter(u => selectedUsers.includes(u.id)).map(u => `${u.name},${u.email},${u.role},${u.status}`)].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'users_export.csv'; a.click();
                    toast.success('Exported selected users');
                  }}
                  className="flex items-center gap-2 text-xs font-bold hover:opacity-70 transition-opacity uppercase tracking-widest"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
              <button
                onClick={() => setSelectedUsers([])}
                className="ml-4 p-1.5 hover:bg-background/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-widest">
          <span>
            Displaying{" "}
            <span className="font-bold text-foreground">{from} - {to}</span> of{" "}
            <span className="font-bold text-foreground">{total}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-border rounded-lg bg-card disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shadow-sm text-foreground font-bold cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 border border-border rounded-lg bg-card disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shadow-sm text-foreground font-bold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
              className="bg-card w-full max-w-md overflow-hidden relative z-10 rounded-2xl shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                <h2 className="text-base font-semibold text-foreground">
                  {modalMode === "create" ? "Add new user" : "Edit user"}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={currentUser.name || ""}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={currentUser.email || ""}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                    Password {modalMode === 'edit' && <span className="text-muted-foreground/60">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    required={modalMode === 'create'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                    placeholder={modalMode === 'create' ? 'Enter password' : '••••••••'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        value={currentUser.role || ""}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            role: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-foreground appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select Role</option>
                        {roles.map(r => (
                          <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={currentUser.status || "Active"}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-foreground appearance-none cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-2 flex items-center justify-end gap-2 border-t border-border">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-background bg-foreground hover:bg-foreground/90 rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Detail Slide-over */}
      <UserDetails
        user={detailUser}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={fetchUsers}
      />
    </div>
  );
}
