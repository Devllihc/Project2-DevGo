import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { Trash2, Mail, Search } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminCard from "../../components/admin/AdminCard";
import SearchInput from "../../components/admin/SearchInput";
import StatusBadge from "../../components/admin/StatusBadge";
import PageControls from "../../components/admin/PageControls";

const AdminUserList = () => {
  const { token } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Cursor-based (keyset) pagination: fetching page N+1 costs the same as
  // page 1 no matter how many rows exist, unlike skip/limit which gets
  // slower the deeper an admin scrolls.
  const fetchUsers = async (cursor = null) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
        params: { limit: 20, ...(cursor ? { cursor } : {}) },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => (cursor ? [...prev, ...(res.data.users || [])] : res.data.users || []));
      setNextCursor(res.data.nextCursor || null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchUsers(nextCursor);
    setLoadingMore(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.role].some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <AdminPageHeader title="Users" subtitle="Manage all registered users and their roles.">
        <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search users..." />
      </AdminPageHeader>

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 font-medium">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/20 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400 font-semibold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-stone-900 dark:text-stone-100">{u.name}</div>
                          <div className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5 text-xs">
                            <Mail className="w-3.5 h-3.5" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={u.role === "admin" ? "admin" : "user"} />
                    </td>
                    <td className="px-6 py-3 text-xs font-mono text-stone-400">
                      {u._id}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="inline-flex flex-col items-center justify-center text-stone-400">
                      <Search className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm">No users found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PageControls mode="cursor" cursor={{ hasMore: !!nextCursor, loading: loadingMore, onLoadMore: loadMore }} />
      </AdminCard>
    </div>
  );
};

export default AdminUserList;
