import { apiSlice } from "./apiSlice";

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    getUserProfile: builder.query({
      query: (userId) => `/users/${userId}/profile`,
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),
    createProfile: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}/profile`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUserLocation: builder.mutation({
      query: ({ userId, latitude, longitude }) => ({
        url: `/users/${userId}/location`,
        method: "PATCH",
        body: { latitude, longitude },
      }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetUserProfileQuery,
  useCreateProfileMutation,
  useUpdateUserLocationMutation,
} = usersApi;
