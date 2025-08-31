
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000" }),
  tagTypes: ["Leads","Admin-Leads"], // ✅ Declare tag types
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (credentials) => ({
        url: "/user",
        method: "GET",
        body: credentials,
      }),
    }),

    getAllLeads: builder.query({
      query: (userId) => ({
        url: `/api/user/all-leads/${userId}`,
        method: "GET",
      }),
      providesTags: ["Leads"], // ✅ Provide Leads tag
    }),

    getLeadById: builder.query({
      query: (id) => `/api/user/lead/${id}`,
      providesTags: (result, error, id) => [{ type: "Leads", id }], // single lead caching
    }),

    updateLead: builder.mutation({
      query: ({ id, lead }) => ({
        url: `/api/user/updatelead/${id}`,
        method: "PUT",
        body: lead,
      }),
      invalidatesTags: ["Leads"], // ✅ Invalidate leads after update
    }),

    getAllLeadsAppliedForClosed: builder.query({
      query: (adminId) => ({
        url: `/api/admin/all-leads-applied-for-closed/${adminId}`,
        method: "GET",
      }),
      providesTags: ["Admin-Leads"], 
    }),
  }),
});



export const {useGetUserQuery,useGetAllLeadsQuery,useGetLeadByIdQuery,useUpdateLeadMutation,useGetAllLeadsAppliedForClosedQuery}=userAPI