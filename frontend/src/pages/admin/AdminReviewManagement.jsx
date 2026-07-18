import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { Trash2, Star, Eye, EyeOff, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminCard from "../../components/admin/AdminCard";
import SearchInput from "../../components/admin/SearchInput";
import PageControls from "../../components/admin/PageControls";

const AdminReviewManagement = () => {
  const { token, backendUrl } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/reviews/admin`, {
        params: { limit: 1000 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toggleHide = async (id, currentIsHidden) => {
    try {
      const targetIsHidden = !currentIsHidden;
      await axios.put(
        `${backendUrl}/api/reviews/admin/${id}/hide`,
        { isHidden: targetIsHidden },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isHidden: targetIsHidden } : r))
      );
      toast.success(targetIsHidden ? "Review hidden successfully" : "Review made visible successfully");
    } catch (err) {
      console.error("Failed to toggle review visibility:", err);
      toast.error(err.response?.data?.message || "Failed to update review visibility");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`${backendUrl}/api/reviews/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Review deleted successfully");
    } catch (err) {
      console.error("Failed to delete review:", err);
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = searchTerm.trim() === "" || [
      r.userId?.name,
      r.userId?.email,
      r.tourId?.title,
      r.comment
    ].some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRating = filterRating === "all" || r.rating === parseInt(filterRating);

    const matchesVisibility = filterVisibility === "all" || 
      (filterVisibility === "visible" && !r.isHidden) ||
      (filterVisibility === "hidden" && r.isHidden);

    return matchesSearch && matchesRating && matchesVisibility;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRating, filterVisibility]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <tr key={idx} className="border-b border-stone-100 dark:border-stone-800/50">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-stone-200 dark:bg-stone-800 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="w-28 h-4 bg-stone-200 dark:bg-stone-800 animate-pulse rounded" />
              <div className="w-20 h-3 bg-stone-200 dark:bg-stone-800 animate-pulse rounded" />
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="w-24 h-4 bg-stone-200 dark:bg-stone-800 animate-pulse rounded" />
            <div className="w-32 h-3 bg-stone-200 dark:bg-stone-800 animate-pulse rounded" />
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 bg-stone-200 dark:bg-stone-800 animate-pulse rounded-full" />
              ))}
            </div>
            <div className="w-48 h-3 bg-stone-200 dark:bg-stone-800 animate-pulse rounded" />
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="w-20 h-4 bg-stone-200 dark:bg-stone-800 animate-pulse rounded" />
        </td>
        <td className="px-6 py-4">
          <div className="w-16 h-5 bg-stone-200 dark:bg-stone-800 animate-pulse rounded-full" />
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            <div className="w-9 h-9 bg-stone-200 dark:bg-stone-800 animate-pulse rounded-lg" />
            <div className="w-9 h-9 bg-stone-200 dark:bg-stone-800 animate-pulse rounded-lg" />
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div>
      <AdminPageHeader title="Reviews" subtitle="Manage and moderate all tour reviews.">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search reviews..." />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm text-stone-700 dark:text-stone-300"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm text-stone-700 dark:text-stone-300"
          >
            <option value="all">All Statuses</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </AdminPageHeader>

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 font-medium">
              <tr>
                <th className="px-6 py-3">Tour Details</th>
                <th className="px-6 py-3">Reviewer</th>
                <th className="px-6 py-3">Rating & Comment</th>
                <th className="px-6 py-3">Created On</th>
                <th className="px-6 py-3">Visibility</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
              {loading ? (
                renderSkeletons()
              ) : paginatedReviews.length > 0 ? (
                paginatedReviews.map((r) => (
                  <tr key={r._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {r.tourId?.photo ? (
                          <img
                            src={r.tourId.photo.startsWith("http") ? r.tourId.photo : `${backendUrl}${r.tourId.photo}`}
                            alt={r.tourId?.title}
                            className="w-12 h-12 object-cover rounded-lg border border-stone-200 dark:border-stone-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 shrink-0">
                            <MessageSquare size={16} />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-stone-900 dark:text-stone-100 max-w-[180px] truncate" title={r.tourId?.title}>
                            {r.tourId?.title || "Deleted Tour"}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {r.tourId?.city || "Unknown City"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-stone-900 dark:text-stone-100">{r.userId?.name || "Anonymous"}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-mono">{r.userId?.email || "No email"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-stone-300 dark:text-stone-600"}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 max-w-[280px] whitespace-normal break-words">
                          {r.comment || <span className="italic text-stone-500 dark:text-stone-400">No comment</span>}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {r.isHidden ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                          <EyeOff size={12} />
                          Hidden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                          <Eye size={12} />
                          Visible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleHide(r._id, r.isHidden)}
                          className={`p-2 rounded-lg transition-all active:scale-95 border ${
                            r.isHidden
                              ? "bg-accent-700 hover:bg-accent-800 text-white border-accent-700"
                              : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-700"
                          }`}
                          title={r.isHidden ? "Make review visible" : "Hide review"}
                        >
                          {r.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => deleteReview(r._id)}
                          className="p-2 bg-white dark:bg-stone-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-stone-200 dark:border-stone-700 hover:border-red-200 dark:hover:border-red-900/30 rounded-lg transition-all active:scale-95"
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="inline-flex flex-col items-center justify-center text-stone-400">
                      <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm">
                        {searchTerm || filterRating !== "all" || filterVisibility !== "all"
                          ? `No reviews found matching "${searchTerm}"`
                          : "No reviews available"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PageControls
          mode="pages"
          pages={{
            page: currentPage,
            totalPages: totalPages,
            onPageChange: (nextPage) => setCurrentPage(nextPage),
          }}
        />
      </AdminCard>
    </div>
  );
};

export default AdminReviewManagement;
