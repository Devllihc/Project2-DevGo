import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const AdminUserList = () => {
  const { token } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refresh after delete
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
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-stone-900 dark:text-stone-100">User Management</h2>

      {/* Search input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm p-3 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-accent-500 outline-none"
        />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <table className="w-full border-collapse text-stone-700 dark:text-stone-300">
          <thead>
            <tr className="bg-accent-50 dark:bg-accent-950/20 text-left text-accent-800 dark:text-accent-300 border-b border-stone-200 dark:border-stone-800">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <tr key={u._id} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors last:border-0">
                <td className="p-4">{u._id}</td>
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full text-sm font-medium">
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-8 text-stone-500 dark:text-stone-400">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default AdminUserList;
