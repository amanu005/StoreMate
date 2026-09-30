'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Sparkles, 
  Package, 
  TrendingUp, 
  Clock, 
  Trash2, 
  Check,
  Plus
} from 'lucide-react';
import { useStoreMate } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotification, 
    addStock, 
    products, 
    language 
  } = useStoreMate();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'LOW_STOCK'>('ALL');
  const [restockedMap, setRestockedMap] = useState<Record<string, boolean>>({});

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return !n.is_read;
    if (activeFilter === 'LOW_STOCK') return n.type === 'LOW_STOCK' || n.type === 'CRITICAL_STOCK';
    return true;
  });

  const handleRestockFromNotif = async (notifId: string, productId?: string) => {
    if (!productId) return;
    await addStock(productId, 10, 'MANUAL', 'Restocked from Low-Stock Alert');
    markNotificationAsRead(notifId);
    setRestockedMap((prev) => ({ ...prev, [notifId]: true }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ta' ? 'அறிவிப்புகள் மையம்' : 'Notification Center'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {notifications.filter((n) => !n.is_read).length} unread alerts requiring attention
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={markAllNotificationsAsRead}
          leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
        >
          {language === 'ta' ? 'அனைத்தும் படித்ததாகக் குறிக்கவும்' : 'Mark All as Read'}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('UNREAD')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeFilter === 'UNREAD'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Unread ({notifications.filter((n) => !n.is_read).length})
        </button>
        <button
          onClick={() => setActiveFilter('LOW_STOCK')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeFilter === 'LOW_STOCK'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Low Stock ({notifications.filter((n) => n.type === 'LOW_STOCK' || n.type === 'CRITICAL_STOCK').length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Bell className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-slate-700">No notifications in this filter</p>
          <p className="text-xs text-slate-400">All alerts have been reviewed or resolved.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isLowStock = notif.type === 'LOW_STOCK' || notif.type === 'CRITICAL_STOCK';
            const isCritical = notif.type === 'CRITICAL_STOCK';
            const isRestocked = Boolean(restockedMap[notif.id]);

            return (
              <Card
                key={notif.id}
                className={`p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notif.is_read ? 'border-l-4 border-l-emerald-500 bg-white' : 'bg-slate-50/70 border-slate-200/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : isLowStock
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {isLowStock ? <AlertTriangle className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    {language === 'ta' && notif.tamil_message && (
                      <p className="text-xs font-semibold text-emerald-800 bg-emerald-50/70 px-2 py-1 rounded-lg">
                        {notif.tamil_message}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>

                {/* Right action controls */}
                <div className="flex items-center gap-2 sm:self-center shrink-0 pl-13 sm:pl-0">
                  {isLowStock && notif.product_id && (
                    <Button
                      size="sm"
                      variant={isRestocked ? 'secondary' : 'primary'}
                      disabled={isRestocked}
                      onClick={() => handleRestockFromNotif(notif.id, notif.product_id)}
                      leftIcon={isRestocked ? <Check className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4" />}
                      className="text-xs font-bold whitespace-nowrap"
                    >
                      {isRestocked ? 'Restocked (+10)' : '+10 Restock'}
                    </Button>
                  )}

                  {!notif.is_read && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => clearNotification(notif.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
