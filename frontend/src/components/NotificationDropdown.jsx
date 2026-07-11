import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="text-emerald-500 w-5 h-5" />;
      case 'WARNING': return <AlertTriangle className="text-amber-500 w-5 h-5" />;
      default: return <Info className="text-blue-500 w-5 h-5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6 text-stone-700 dark:text-stone-200" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-rose-500 rounded-full border-2 border-white dark:border-stone-950 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="flex justify-between items-center p-4 border-b border-stone-200/60 dark:border-stone-800/80">
            <h3 className="font-semibold text-lg text-stone-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-stone-500 dark:text-stone-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id);
                    if (notif.actionUrl) window.location.href = notif.actionUrl;
                  }}
                  className={`p-4 flex gap-3 cursor-pointer transition-all border-b border-stone-100/80 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800/40 ${!notif.isRead ? 'bg-stone-50/80 dark:bg-stone-800/25' : ''}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? 'font-semibold text-stone-900 dark:text-white' : 'font-medium text-stone-600 dark:text-stone-300'}`}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                      {notif.body}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
                      {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now'}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
