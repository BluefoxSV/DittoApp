import { apiSlice } from "./apiSlice";

export const workersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createWorkerProfile: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `/workers/${userId}/profile`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Worker"],
    }),
  }),
});

export const { useCreateWorkerProfileMutation } = workersApi;
