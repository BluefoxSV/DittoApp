import { apiSlice } from "./apiSlice";

export const coursesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: (body) => ({
        url: "/courses",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),
    getCourses: builder.query({
      query: () => "/courses",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Course", id })),
              { type: "Course", id: "LIST" },
            ]
          : [{ type: "Course", id: "LIST" }],
    }),
    getCourse: builder.query({
      query: (courseId) => `/courses/${courseId}`,
      providesTags: (_result, _error, courseId) => [
        { type: "Course", id: courseId },
      ],
    }),
    getCourseLessons: builder.query({
      query: (courseId) => `/courses/${courseId}/lessons`,
      providesTags: (_result, _error, courseId) => [
        { type: "Course", id: `LESSONS-${courseId}` },
      ],
    }),
    getWorkerCourseEnrollments: builder.query({
      query: (workerId) => `/courses/workers/${workerId}/enrollments`,
      providesTags: (result, _error, workerId) =>
        result
          ? [
              ...result.map(({ course_id: courseId }) => ({
                type: "Course",
                id: `ENROLLMENT-${workerId}-${courseId}`,
              })),
              { type: "Course", id: `ENROLLMENTS-${workerId}` },
            ]
          : [{ type: "Course", id: `ENROLLMENTS-${workerId}` }],
    }),
    enrollWorkerInCourse: builder.mutation({
      query: ({ workerId, courseId }) => ({
        url: `/courses/workers/${workerId}/enrollments`,
        method: "POST",
        body: { course_id: courseId },
      }),
      invalidatesTags: (_result, _error, { workerId, courseId }) => [
        { type: "Course", id: `ENROLLMENT-${workerId}-${courseId}` },
        { type: "Course", id: `ENROLLMENTS-${workerId}` },
      ],
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetCourseLessonsQuery,
  useGetWorkerCourseEnrollmentsQuery,
  useEnrollWorkerInCourseMutation,
} = coursesApi;
