import React from "react";

const AdminCard = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export default AdminCard;
