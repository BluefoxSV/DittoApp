import { apiSlice } from "./apiSlice";

export const workersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkers: builder.query({
      query: () => "/workers",
      providesTags: ["Worker"],
    }),
    getWorkerProfileByUserId: builder.query({
      query: (userId) => `/workers/user/${userId}/profile`,
      providesTags: (_result, _error, userId) => [{ type: "Worker", id: userId }],
    }),
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

export const {
  useGetWorkersQuery,
  useGetWorkerProfileByUserIdQuery,
  useCreateWorkerProfileMutation,
} = workersApi;
