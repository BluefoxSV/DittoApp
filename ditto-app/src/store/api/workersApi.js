import { apiSlice } from "./apiSlice";

export const workersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkers: builder.query({
      query: ({ lat, lng, radiusKm } = {}) => {
        const params = new URLSearchParams();
        if (lat != null) params.set("lat", String(lat));
        if (lng != null) params.set("lng", String(lng));
        if (radiusKm != null) params.set("radius_km", String(radiusKm));
        const query = params.toString();
        return query ? `/workers?${query}` : "/workers";
      },
      providesTags: ["Worker"],
    }),
    getWorkerProfileByUserId: builder.query({
      query: (userId) => `/workers/user/${userId}/profile`,
      providesTags: (_result, _error, userId) => [{ type: "Worker", id: userId }],
    }),
    getWorker: builder.query({
      query: (workerId) => `/workers/${workerId}`,
      providesTags: (_result, _error, workerId) => [{ type: "Worker", id: workerId }],
    }),
    createWorkerProfile: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `/workers/${userId}/profile`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Worker"],
    }),
    updateWorkerLocation: builder.mutation({
      query: ({ workerId, latitude, longitude }) => ({
        url: `/workers/${workerId}/location`,
        method: "PATCH",
        body: { latitude, longitude },
      }),
      invalidatesTags: ["Worker"],
    }),
  }),
});

export const {
  useGetWorkersQuery,
  useGetWorkerQuery,
  useGetWorkerProfileByUserIdQuery,
  useCreateWorkerProfileMutation,
  useUpdateWorkerLocationMutation,
} = workersApi;
