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
      <h2 className="text-3xl font-bold mb-4">
        {editId ? "Edit Tour" : "Add New Tour"}
      </h2>

      {/* Add/Edit Tour Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white p-6 rounded shadow"
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
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        ))}

        {/* Available Dates */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">
            Available Dates (comma-separated)
          </label>
          <input
            type="text"
            name="availableDates"
            value={formData.availableDates}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g. 5-1-2025, 10-2-2025"
          />
        </div>

        {/* Featured */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Featured Tour</label>
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600"
          />
        </div>

        {/* Photo Upload */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium mb-1">Photo</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            {...(!editId && { required: true })}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
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
              className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 mt-2"
            >
              Cancel Edit
            </button>
          </div>
        )}
      </form>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title, city, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm p-2 border border-gray-300 rounded shadow-sm"
        />
      </div>

      {/* Tour List */}
      <table className="w-full border-collapse border border-gray-300 bg-white shadow rounded overflow-hidden">
        <thead>
          <tr className="bg-indigo-100 text-left">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">City</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Distance</th>
            <th className="p-2 border">Group Size</th>
            <th className="p-2 border">Featured</th>
            <th className="p-2 border">Available Dates</th>
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTours.length > 0 ? (
            filteredTours.map((tour) => (
              <tr key={tour._id} className="hover:bg-gray-50 border">
                <td className="p-2 border">{tour.title}</td>
                <td className="p-2 border">{tour.city}</td>
                <td className="p-2 border">${tour.price}</td>
                <td className="p-2 border">{tour.distance} km</td>
                <td className="p-2 border">{tour.maxGroupSize}</td>
                <td className="p-2 border">{tour.featured ? "Yes" : "No"}</td>
                <td className="p-2 border">{tour.availableDates?.join(", ")}</td>
                <td className="p-2 border">
                  {tour.photo ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${tour.photo}`}
                      alt={tour.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleEdit(tour)}
                    className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tour._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center p-4 text-gray-500">
                No tours found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTourManagement;
