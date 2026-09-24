import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    addNotification: (state, { payload }) => {
      state.items.unshift(payload);
      state.unreadCount += 1;
    },
    setNotifications: (state, { payload }) => {
      state.items = payload.notifications;
      state.unreadCount = payload.unreadCount;
    },
    markRead: (state, { payload }) => {
      const n = state.items.find((i) => i._id === payload);
      if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
    },
    markAllRead: (state) => {
      state.items.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
    },
    setUnreadCount: (state, { payload }) => { state.unreadCount = payload; },
  },
});

export const { addNotification, setNotifications, markRead, markAllRead, setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
