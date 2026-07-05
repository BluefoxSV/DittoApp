import { apiSlice } from "./apiSlice";

const conversationTag = (userId, otherUserId) =>
  [userId, otherUserId].sort((a, b) => a - b).join("-");

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversation: builder.query({
      query: ({ userId, otherUserId }) => `/chat/users/${userId}/with/${otherUserId}`,
      providesTags: (_result, _error, { userId, otherUserId }) => [
        { type: "Chat", id: conversationTag(userId, otherUserId) },
      ],
    }),
    sendChatMessage: builder.mutation({
      query: ({ senderId, receiverId, content }) => ({
        url: `/chat/users/${senderId}/messages`,
        method: "POST",
        body: { receiver_id: receiverId, content },
      }),
      invalidatesTags: (_result, _error, { senderId, receiverId }) => [
        { type: "Chat", id: conversationTag(senderId, receiverId) },
      ],
    }),
  }),
});

export const { useGetConversationQuery, useSendChatMessageMutation } = chatApi;
