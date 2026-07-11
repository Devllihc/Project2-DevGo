import React from "react";

const StatCard = ({ icon: Icon, label, value, accent = false }) => (
  <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-5 flex items-center gap-4">
    <div
      className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
        accent
          ? "bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400"
          : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
      }`}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="text-2xl font-semibold text-stone-900 dark:text-stone-100">{value}</div>
      <div className="text-xs text-stone-500 dark:text-stone-400">{label}</div>
    </div>
  </div>
);

export default StatCard;
