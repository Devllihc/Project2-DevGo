import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { User, Phone, Mail, Camera, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Profile = () => {
  const { user, setUser, token, backendUrl } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      if (user.photo) {
        setPhotoPreview(user.photo.startsWith("http") ? user.photo : `${backendUrl}${user.photo}`);
      }
    }
  }, [user, backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      if (photo) {
        data.append("photo", photo);
      }

      const res = await axios.put(`${backendUrl}/api/user/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setUser(res.data.user);
        // Update storage as well
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Profile Settings</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">Manage your account details and profile picture</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-stone-100 dark:border-stone-800 overflow-hidden bg-stone-200 dark:bg-stone-800 flex items-center justify-center relative shadow-lg">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-stone-400" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={24} className="text-white" />
                </div>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload profile picture"
                />
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-3">JPEG, PNG, WEBP max 5MB</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (Read-only) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-stone-400" />
                </div>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-stone-100 dark:bg-stone-800/50 border border-transparent rounded-xl text-stone-500 dark:text-stone-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Email cannot be changed here.</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-stone-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={18} className="text-stone-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9+\-() ]/g, "");
                    setFormData((prev) => ({ ...prev, phone: val }));
                  }}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-accent-500 text-white rounded-xl font-bold hover:bg-accent-600 transition-colors active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-accent-500/20"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
