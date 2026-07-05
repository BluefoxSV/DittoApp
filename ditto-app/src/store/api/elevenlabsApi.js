import { apiSlice } from "./apiSlice";

export const elevenlabsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversationConfig: builder.query({
      query: () => "/elevenlabs/conversation-config",
    }),
    getSignedUrl: builder.query({
      query: () => "/elevenlabs/signed-url",
    }),
  }),
});

export const {
  useGetConversationConfigQuery,
  useLazyGetConversationConfigQuery,
  useGetSignedUrlQuery,
  useLazyGetSignedUrlQuery,
} = elevenlabsApi;
