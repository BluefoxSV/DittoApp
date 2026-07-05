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
      query: (workerId) => `/service-requests/workers/${workerId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ServiceRequest", id })),
              { type: "ServiceRequest", id: "WORKER_LIST" },
            ]
          : [{ type: "ServiceRequest", id: "WORKER_LIST" }],
    }),
    createServiceRequest: builder.mutation({
      query: ({ userId, workerId, description }) => ({
        url: `/service-requests/users/${userId}`,
        method: "POST",
        body: { worker_id: workerId, description },
      }),
      invalidatesTags: [
        { type: "ServiceRequest", id: "USER_LIST" },
        { type: "ServiceRequest", id: "WORKER_LIST" },
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
      ],
    }),
  }),
});

export const {
  useGetUserServiceRequestsQuery,
  useGetWorkerServiceRequestsQuery,
  useCreateServiceRequestMutation,
  useUpdateServiceRequestStatusMutation,
} = serviceRequestsApi;
