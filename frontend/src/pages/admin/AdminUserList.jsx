import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { Search, Trash2, Mail, Shield, User } from "lucide-react";

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
    [u.name, u.email, u.role]
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">User Management</h2>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Manage all registered users and their roles.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-all dark:text-stone-100"
          />
        </div>
      </div>

      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50/50 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={u._id} 
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400 font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            {u.name}
                          </div>
                          <div className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}>
                        {u.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-stone-400">
                      {u._id}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="inline-flex flex-col items-center justify-center text-stone-400">
                      <Search className="w-12 h-12 mb-3 opacity-20" />
                      <p>No users found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {nextCursor && (
          <div className="flex items-center justify-center px-6 py-4 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminUserList;
