import { apiSlice } from "./apiSlice";

export const elevenlabsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSignedUrl: builder.query({
      query: () => "/elevenlabs/signed-url",
    }),
  }),
});

export const { useGetSignedUrlQuery, useLazyGetSignedUrlQuery } = elevenlabsApi;
