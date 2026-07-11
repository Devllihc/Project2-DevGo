import React from "react";
import { Search } from "lucide-react";

const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => (
  <div className={`relative w-full sm:w-72 ${className}`}>
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-all dark:text-stone-100"
    />
  </div>
);

export default SearchInput;
