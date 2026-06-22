import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const AdminTourManagement = () => {
  const { token } = useContext(AppContext);
  const [tours, setTours] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

      setFormData({
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
      setEditId(null);
      fetchTours();
    } catch (err) {
      console.error(err);
      toast.error(editId ? "Failed to update tour" : "Failed to add tour");
    }
  };

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/tours/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-stone-900 dark:text-stone-100">
        {editId ? "Edit Tour" : "Add New Tour"}
      </h2>

      {/* Add/Edit Tour Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm"
        encType="multipart/form-data"
      >
        {[
          { name: "title", label: "Title" },
          { name: "desc", label: "Description" },
          { name: "price", label: "Price", type: "number" },
          { name: "city", label: "City" },
          { name: "distance", label: "Distance (km)", type: "number" },
          { name: "maxGroupSize", label: "Max Group Size", type: "number" },
        ].map(({ name, label, type = "text" }) => (
          <div key={name} className="col-span-1">
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none text-stone-900 dark:text-stone-100"
              required
            />
          </div>
        ))}

        {/* Available Dates */}
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Available Dates (comma-separated)
          </label>
          <input
            type="text"
            name="availableDates"
            value={formData.availableDates}
            onChange={handleChange}
            className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none text-stone-900 dark:text-stone-100"
            placeholder="e.g. 5-1-2025, 10-2-2025"
          />
        </div>

        {/* Featured */}
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Featured Tour</label>
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="h-5 w-5 text-accent-600 rounded border-stone-300 focus:ring-accent-500"
          />
        </div>

        {/* Photo Upload */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Photo</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none text-stone-900 dark:text-stone-100"
            {...(!editId && { required: true })}
          />
        </div>

        <div className="col-span-1 md:col-span-2 mt-4">
          <button type="submit" className="w-full bg-accent-500 text-white p-3 rounded-xl font-bold hover:bg-accent-600 transition-colors">
            {editId ? "Update Tour" : "Add Tour"}
          </button>
        </div>

        {editId && (
          <div className="col-span-1 md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormData({
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
                }}
                className="w-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold p-3 rounded-xl hover:bg-stone-300 dark:hover:bg-stone-700 mt-2 transition-colors"
              >
                Cancel Edit
              </button>
          </div>
        )}
      </form>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title, city, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-accent-500 outline-none text-stone-900 dark:text-stone-100"
        />
      </div>

      {/* Tour List */}
      <div className="overflow-x-auto bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <table className="w-full border-collapse text-stone-700 dark:text-stone-300">
          <thead>
            <tr className="bg-accent-50 dark:bg-accent-950/20 text-left text-accent-800 dark:text-accent-300 border-b border-stone-200 dark:border-stone-800">
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">City</th>
              <th className="p-4 font-semibold">Price</th>
              <th className="p-4 font-semibold">Distance</th>
              <th className="p-4 font-semibold">Group Size</th>
              <th className="p-4 font-semibold">Featured</th>
              <th className="p-4 font-semibold">Available Dates</th>
              <th className="p-4 font-semibold">Image</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTours.length > 0 ? (
              filteredTours.map((tour) => (
                <tr key={tour._id} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors last:border-0">
                  <td className="p-4 font-medium">{tour.title}</td>
                  <td className="p-4">{tour.city}</td>
                  <td className="p-4">${tour.price}</td>
                  <td className="p-4">{tour.distance} km</td>
                  <td className="p-4">{tour.maxGroupSize}</td>
                  <td className="p-4">
                    {tour.featured ? (
                      <span className="bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-400 px-2 py-1 rounded-md text-xs font-bold">Yes</span>
                    ) : (
                      <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-1 rounded-md text-xs font-bold">No</span>
                    )}
                  </td>
                  <td className="p-4">{tour.availableDates?.join(", ")}</td>
                  <td className="p-4">
                    {tour.photo ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${tour.photo}`}
                        alt={tour.title}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-stone-400 dark:text-stone-500 italic text-sm">No image</span>
                    )}
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(tour)}
                      className="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-500 px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tour._id)}
                      className="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-8 text-stone-500 dark:text-stone-400">
                  No tours found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTourManagement;
