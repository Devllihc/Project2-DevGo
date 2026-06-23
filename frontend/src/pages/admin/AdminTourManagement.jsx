import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Edit2, Trash2, Plus, ImageIcon, MapPin, Users, Calendar, DollarSign, X } from "lucide-react";

const AdminTourManagement = () => {
  const { token } = useContext(AppContext);
  const [tours, setTours] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: "",
    city: "",
    distance: "",
    maxGroupSize: "",
    photo: null,
    availableDates: "",
    featured: false,
  });

  const fetchTours = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tours`);
      setTours(res.data || []);
    } catch (err) {
      console.error("Failed to fetch tours:", err);
      toast.error("Failed to load tours");
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "photo") {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      if (key === "availableDates" && formData[key]) {
        const datesArray = formData[key].split(",").map((d) => d.trim());
        data.append("availableDates", JSON.stringify(datesArray));
      } else if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      if (editId) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/tours/${editId}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Tour updated successfully!");
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/tours`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Tour added successfully!");
      }

      resetForm();
      fetchTours();
    } catch (err) {
      console.error(err);
      toast.error(editId ? "Failed to update tour" : "Failed to add tour");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "", desc: "", price: "", city: "", distance: "",
      maxGroupSize: "", photo: null, availableDates: "", featured: false,
    });
    setEditId(null);
    setShowForm(false);
  }

  const handleEdit = (tour) => {
    setFormData({
      title: tour.title,
      desc: tour.desc,
      price: tour.price,
      city: tour.city,
      distance: tour.distance,
      maxGroupSize: tour.maxGroupSize,
      photo: null,
      availableDates: tour.availableDates?.join(", "),
      featured: tour.featured || false,
    });
    setEditId(tour._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/tours/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Tour deleted successfully!");
      fetchTours();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete tour");
    }
  };

  const filteredTours = tours.filter((tour) =>
    [tour.title, tour.city, tour.desc]
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Tour Management</h2>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Create, update, and organize your tour catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-all dark:text-stone-100"
            />
          </div>
          <button 
            onClick={() => { setShowForm(!showForm); if(editId) resetForm(); }}
            className="flex items-center gap-2 bg-accent-500 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-sm hover:bg-accent-600 hover:shadow transition-all whitespace-nowrap"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancel' : 'Add Tour'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-8"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-lg"
              encType="multipart/form-data"
            >
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
                {editId ? <Edit2 className="w-5 h-5 text-accent-500" /> : <Plus className="w-5 h-5 text-accent-500" />}
                {editId ? "Edit Tour" : "Add New Tour"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "title", label: "Tour Title", icon: <MapPin className="w-4 h-4" /> },
                  { name: "city", label: "City", icon: <MapPin className="w-4 h-4" /> },
                  { name: "price", label: "Price ($)", type: "number", icon: <DollarSign className="w-4 h-4" /> },
                  { name: "distance", label: "Distance (km)", type: "number" },
                  { name: "maxGroupSize", label: "Max Group Size", type: "number", icon: <Users className="w-4 h-4" /> },
                ].map(({ name, label, type = "text", icon }) => (
                  <div key={name} className="relative">
                    <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider">{label}</label>
                    <div className="relative">
                      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">{icon}</div>}
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className={`w-full bg-stone-50/50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all ${icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3'}`}
                        required
                      />
                    </div>
                  </div>
                ))}

                <div className="relative">
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Available Dates
                  </label>
                  <input
                    type="text"
                    name="availableDates"
                    value={formData.availableDates}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all"
                    placeholder="e.g. 5-1-2025, 10-2-2025"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Tour Photo
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-stone-50/50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-50 file:text-accent-700 dark:file:bg-accent-900/30 dark:file:text-accent-400 hover:file:bg-accent-100 dark:hover:file:bg-accent-900/50 cursor-pointer"
                    {...(!editId && { required: true })}
                  />
                </div>

                <div className="col-span-1 flex items-center mt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-stone-200 dark:bg-stone-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500 shadow-inner"></div>
                    </div>
                    <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                      Featured Tour
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-stone-100 dark:border-stone-800/50">
                <button type="submit" className="flex-1 bg-accent-500 text-white py-3 px-6 rounded-xl font-bold shadow hover:bg-accent-600 hover:shadow-md transition-all">
                  {editId ? "Update Tour" : "Publish Tour"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50/50 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 font-medium">
              <tr>
                <th className="px-6 py-4">Tour</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
              {filteredTours.length > 0 ? (
                filteredTours.map((tour, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={tour._id} 
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {tour.photo ? (
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL}${tour.photo}`}
                            alt={tour.title}
                            className="w-16 h-12 object-cover rounded-xl shadow-sm border border-stone-100 dark:border-stone-800"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center text-stone-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">{tour.title}</div>
                          <div className="text-stone-500 dark:text-stone-400 text-xs mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {tour.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-stone-600 dark:text-stone-300 flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-stone-400" /> {tour.distance} km</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-stone-400" /> max {tour.maxGroupSize}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-stone-400" /> {tour.price}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tour.featured ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 border border-accent-200 dark:border-accent-800/50">
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tour)}
                          className="p-2 text-stone-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Edit Tour"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tour._id)}
                          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Tour"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="inline-flex flex-col items-center justify-center text-stone-400">
                      <Search className="w-12 h-12 mb-3 opacity-20" />
                      <p>No tours found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminTourManagement;
