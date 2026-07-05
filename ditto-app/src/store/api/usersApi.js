import { apiSlice } from "./apiSlice";

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    createProfile: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}/profile`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetMeQuery, useLazyGetMeQuery, useCreateProfileMutation } =
  usersApi;
