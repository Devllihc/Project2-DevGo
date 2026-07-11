import React from "react";

const AdminPageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
    <div>
      <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-3">{children}</div>}
  </div>
);

export default AdminPageHeader;
