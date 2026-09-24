import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: { chats: [], activeChat: null, messages: {}, typingUsers: {} },
  reducers: {
    setChats: (state, { payload }) => { state.chats = payload; },
    setActiveChat: (state, { payload }) => { state.activeChat = payload; },
    setMessages: (state, { payload: { chatId, messages } }) => { state.messages[chatId] = messages; },
    addMessage: (state, { payload: { chatId, message } }) => {
      if (!state.messages[chatId]) state.messages[chatId] = [];
      state.messages[chatId].push(message);
      const chat = state.chats.find((c) => c._id === chatId);
      if (chat) { chat.lastMessageContent = message.content; chat.lastMessageAt = message.createdAt; }
    },
    setTyping: (state, { payload: { chatId, userId, isTyping } }) => {
      if (!state.typingUsers[chatId]) state.typingUsers[chatId] = {};
      if (isTyping) state.typingUsers[chatId][userId] = true;
      else delete state.typingUsers[chatId][userId];
    },
  },
});

export const { setChats, setActiveChat, setMessages, addMessage, setTyping } = chatSlice.actions;
export default chatSlice.reducer;
