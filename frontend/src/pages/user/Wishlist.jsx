import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, DollarSign, HeartCrack } from "lucide-react";
import { AppContext } from "../../context/AppContext";

const Wishlist = () => {
  const { user, token, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/user/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setWishlist(data.wishlist);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, token, baseUrl, navigate]);

  const handleRemove = async (tourId, e) => {
    e.stopPropagation(); // Prevent navigating to tour details
    try {
      const res = await fetch(`${baseUrl}/api/user/wishlist/${tourId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(prev => prev.filter(tour => tour._id !== tourId));
        // Update user context
        setUser({ ...user, wishlist: data.wishlist });
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-xl text-stone-600 dark:text-stone-400">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-2 text-lg">
            Tours you've saved for later.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center shadow-sm">
            <HeartCrack className="w-16 h-16 mx-auto text-stone-300 dark:text-stone-600 mb-6" />
            <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-md mx-auto">
              Looks like you haven't saved any tours yet. Explore our destinations and find your next adventure!
            </p>
            <button
              onClick={() => navigate("/tours")}
              className="bg-accent-700 hover:bg-accent-800 text-white px-8 py-3.5 rounded-full font-semibold transition-all active:scale-95 shadow-lg shadow-accent-700/20"
            >
              Explore Tours
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((tour) => (
              <div
                key={tour._id}
                onClick={() => navigate(`/tours/${tour._id}`)}
                className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                <div className="relative">
                  <img
                    src={tour.photo?.startsWith("http") ? tour.photo : `${baseUrl}${tour.photo}`}
                    alt={tour.title}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={(e) => handleRemove(tour._id, e)}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm p-2.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                    title="Remove from wishlist"
                  >
                    <HeartCrack className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                      {tour.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full shrink-0">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {tour.avgRating ? tour.avgRating.toFixed(1) : "New"}
                    </div>
                  </div>
                  
                  <p className="text-stone-500 dark:text-stone-400 text-sm mb-5 line-clamp-2 leading-relaxed">
                    {tour.desc}
                  </p>
                  
                  <div className="flex justify-between items-center pt-5 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-0.5">Price</span>
                      <p className="font-black text-lg text-accent-600 dark:text-accent-500 flex items-center">
                        <DollarSign className="w-4 h-4 mr-0.5" />
                        {tour.price}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-0.5">Location</span>
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-stone-400" />
                        {tour.city}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
