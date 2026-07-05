import { apiSlice } from "./apiSlice";

export const serviceRequestsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserServiceRequests: builder.query({
      query: (userId) => `/service-requests/users/${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ServiceRequest", id })),
              { type: "ServiceRequest", id: "USER_LIST" },
            ]
          : [{ type: "ServiceRequest", id: "USER_LIST" }],
    }),
    getWorkerServiceRequests: builder.query({
      query: ({ workerId, lat, lng } = {}) => {
        const params = new URLSearchParams();
        if (lat != null) params.set("lat", String(lat));
        if (lng != null) params.set("lng", String(lng));
        const query = params.toString();
        const base = `/service-requests/workers/${workerId}`;
        return query ? `${base}?${query}` : base;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ServiceRequest", id })),
              { type: "ServiceRequest", id: "WORKER_LIST" },
            ]
          : [{ type: "ServiceRequest", id: "WORKER_LIST" }],
    }),
    getFeedServiceRequests: builder.query({
      query: ({ lat, lng, radiusKm = 50 } = {}) => {
        const params = new URLSearchParams();
        if (lat != null) params.set("lat", String(lat));
        if (lng != null) params.set("lng", String(lng));
        if (radiusKm != null) params.set("radius_km", String(radiusKm));
        const query = params.toString();
        return query ? `/service-requests/feed?${query}` : "/service-requests/feed";
      },
      providesTags: [{ type: "ServiceRequest", id: "FEED" }],
    }),
    createServiceRequest: builder.mutation({
      query: ({ userId, description, latitude, longitude }) => ({
        url: `/service-requests/users/${userId}`,
        method: "POST",
        body: {
          description,
          ...(latitude != null ? { latitude } : {}),
          ...(longitude != null ? { longitude } : {}),
        },
      }),
      invalidatesTags: [
        { type: "ServiceRequest", id: "USER_LIST" },
        { type: "ServiceRequest", id: "WORKER_LIST" },
        { type: "ServiceRequest", id: "FEED" },
      ],
    }),
    updateServiceRequestStatus: builder.mutation({
      query: ({ requestId, status }) => ({
        url: `/service-requests/${requestId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { requestId }) => [
        { type: "ServiceRequest", id: requestId },
        { type: "ServiceRequest", id: "USER_LIST" },
        { type: "ServiceRequest", id: "WORKER_LIST" },
        { type: "ServiceRequest", id: "FEED" },
      ],
    }),
    reassignServiceRequest: builder.mutation({
      query: ({ requestId, workerId }) => ({
        url: `/service-requests/${requestId}`,
        method: "PATCH",
        body: { worker_id: workerId },
      }),
      invalidatesTags: (_result, _error, { requestId }) => [
        { type: "ServiceRequest", id: requestId },
        { type: "ServiceRequest", id: "USER_LIST" },
        { type: "ServiceRequest", id: "WORKER_LIST" },
        { type: "ServiceRequest", id: "FEED" },
      ],
    }),
    republishServiceRequest: builder.mutation({
      query: (requestId) => ({
        url: `/service-requests/${requestId}`,
        method: "PATCH",
        body: { republish: true },
      }),
      invalidatesTags: (_result, _error, requestId) => [
        { type: "ServiceRequest", id: requestId },
        { type: "ServiceRequest", id: "USER_LIST" },
        { type: "ServiceRequest", id: "WORKER_LIST" },
        { type: "ServiceRequest", id: "FEED" },
      ],
    }),
  }),
});

export const {
  useGetUserServiceRequestsQuery,
  useGetWorkerServiceRequestsQuery,
  useGetFeedServiceRequestsQuery,
  useCreateServiceRequestMutation,
  useUpdateServiceRequestStatusMutation,
  useReassignServiceRequestMutation,
  useRepublishServiceRequestMutation,
} = serviceRequestsApi;
