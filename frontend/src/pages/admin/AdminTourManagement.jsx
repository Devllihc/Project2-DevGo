import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { Edit2, Trash2, Plus, ImageIcon, MapPin, Users, Calendar, DollarSign, X, Search } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminCard from "../../components/admin/AdminCard";
import SearchInput from "../../components/admin/SearchInput";
import StatusBadge from "../../components/admin/StatusBadge";

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
    availableDates: [],
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
      if (key === "availableDates") {
        data.append("availableDates", JSON.stringify(formData[key]));
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
      maxGroupSize: "", photo: null, availableDates: [], featured: false,
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
      availableDates: tour.availableDates || [],
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
    <div>
      <AdminPageHeader title="Tours" subtitle="Create, update, and organize your tour catalog.">
        <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tours..." />
        <button
          onClick={() => { setShowForm(!showForm); if (editId) resetForm(); }}
          className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-accent-600 transition-all whitespace-nowrap"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Tour'}
        </button>
      </AdminPageHeader>

      {showForm && (
        <AdminCard className="p-8 mb-6">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
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
                      className={`w-full bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all ${icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3'}`}
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Available Dates & Slots
                </label>
                {formData.availableDates.map((dateObj, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={dateObj.date}
                      onChange={(e) => {
                        const newDates = [...formData.availableDates];
                        newDates[index].date = e.target.value;
                        setFormData({ ...formData, availableDates: newDates });
                      }}
                      placeholder="Date (e.g. 5-1-2025)"
                      className="w-1/2 px-4 py-3 bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all"
                      required
                    />
                    <input
                      type="number"
                      value={dateObj.maxSlots}
                      onChange={(e) => {
                        const newDates = [...formData.availableDates];
                        newDates[index].maxSlots = e.target.value;
                        setFormData({ ...formData, availableDates: newDates });
                      }}
                      placeholder="Max Slots"
                      className="w-1/3 px-4 py-3 bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newDates = formData.availableDates.filter((_, i) => i !== index);
                        setFormData({ ...formData, availableDates: newDates });
                      }}
                      className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      availableDates: [...formData.availableDates, { date: "", maxSlots: formData.maxGroupSize || "" }]
                    });
                  }}
                  className="mt-2 flex items-center gap-1 text-sm text-accent-500 font-semibold hover:text-accent-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Date
                </button>
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all resize-none"
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
                  className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-stone-900 dark:text-stone-100 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-50 file:text-accent-700 dark:file:bg-accent-900/30 dark:file:text-accent-400 hover:file:bg-accent-100 dark:hover:file:bg-accent-900/50 cursor-pointer"
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
              <button type="submit" className="flex-1 bg-accent-500 text-white py-3 px-6 rounded-lg font-semibold shadow hover:bg-accent-600 transition-all">
                {editId ? "Update Tour" : "Publish Tour"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 font-medium">
              <tr>
                <th className="px-6 py-3">Tour</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Featured</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
              {filteredTours.length > 0 ? (
                filteredTours.map((tour) => (
                  <tr key={tour._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/20 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-4">
                        {tour.photo ? (
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL}${tour.photo}`}
                            alt={tour.title}
                            className="w-16 h-12 object-cover rounded-lg border border-stone-100 dark:border-stone-800"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center text-stone-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-stone-900 dark:text-stone-100 line-clamp-1">{tour.title}</div>
                          <div className="text-stone-500 dark:text-stone-400 text-xs mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {tour.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-stone-600 dark:text-stone-300 flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-stone-400" /> {tour.distance} km</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-stone-400" /> max {tour.maxGroupSize}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-stone-400" /> {tour.price}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={tour.featured ? "featured" : "standard"} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tour)}
                          className="p-2 text-stone-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-500/10 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                          title="Edit Tour"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tour._id)}
                          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                          title="Delete Tour"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="inline-flex flex-col items-center justify-center text-stone-400">
                      <Search className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm">No tours found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
};

export default AdminTourManagement;
