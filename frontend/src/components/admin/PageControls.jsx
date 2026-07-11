import React from "react";

const PageControls = ({ mode, cursor, pages }) => {
  if (mode === "cursor") {
    const { hasMore, loading, onLoadMore } = cursor;
    if (!hasMore) return null;
    return (
      <div className="flex items-center justify-center px-6 py-4 border-t border-stone-200 dark:border-stone-800">
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="px-6 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      </div>
    );
  }

  const { page, totalPages, onPageChange } = pages;
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 dark:border-stone-800">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-sm text-stone-500 dark:text-stone-400">Page {page} of {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default PageControls;
