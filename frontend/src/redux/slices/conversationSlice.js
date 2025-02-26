import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    conversations: [],
    currConversation: null,
};

export const conversationSlice = createSlice({
    name: 'conversation',
    initialState,
    reducers: {
        setConversations: (state, action) => {
            state.conversations = action.payload;
        },

        addConversation: (state, action) => {
            const exists = state.conversations.some((c) => c.id === action.payload.id);
            if (!exists) {
                state.conversations.unshift(action.payload);
            }
        },
        setCurrConversation: (state, action) => {
            state.currConversation = action.payload;
        },

        updateOnlineStatus: (state, action) => {
            state.conversations = state.conversations.map((conv) => ({
                ...conv,
                isOnline: action.payload.onlineUsers.includes(conv.otherParticipantId),
            }));
        },
        updateLastMessage: (state, action) => {
            const { conversationId, lastMessageContent } = action.payload;
            const conversation = state.conversations.find((c) => c.id === conversationId);
            if (conversation) {
                conversation.lastMessageContent = lastMessageContent;
            }
        },
    },
});

export const {
    setConversations,
    addConversation,
    updateOnlineStatus,
    updateLastMessage,
    setCurrConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;
