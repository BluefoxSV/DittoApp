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
    getRequestConversation: builder.query({
      query: (requestId) => `/chat/service-requests/${requestId}/messages`,
      providesTags: (_result, _error, requestId) => [
        { type: "Chat", id: `request-${requestId}` },
      ],
    }),
    sendChatMessage: builder.mutation({
      query: ({ senderId, receiverId, content, serviceRequestId }) => ({
        url: `/chat/users/${senderId}/messages`,
        method: "POST",
        body: {
          receiver_id: receiverId,
          content,
          ...(serviceRequestId != null ? { service_request_id: serviceRequestId } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { senderId, receiverId, serviceRequestId }) => [
        ...(serviceRequestId != null
          ? [{ type: "Chat", id: `request-${serviceRequestId}` }]
          : [{ type: "Chat", id: conversationTag(senderId, receiverId) }]),
      ],
    }),
    sendRequestChatMessage: builder.mutation({
      query: ({ requestId, content }) => ({
        url: `/chat/service-requests/${requestId}/messages`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (_result, _error, { requestId }) => [
        { type: "Chat", id: `request-${requestId}` },
      ],
    }),
  }),
});

export const {
  useGetConversationQuery,
  useGetRequestConversationQuery,
  useSendChatMessageMutation,
  useSendRequestChatMessageMutation,
} = chatApi;
