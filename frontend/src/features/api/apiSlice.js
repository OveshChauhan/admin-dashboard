// Defines the RTK Query API layer, JWT refresh flow, server-side query parameters, and cache invalidation tags.
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials, setCredentials } from "../auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5001/api",
  prepareHeaders: function (headers, api) {
    const token = api.getState().auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  }
});

const baseQueryWithRefresh = async function (args, api, extraOptions) {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken }
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        api.dispatch(setCredentials(refreshResult.data.data));
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearCredentials());
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["User", "Event", "Dashboard"],
  endpoints: function (builder) {
    return {
      login: builder.mutation({
        query: function (body) {
          return {
            url: "/auth/login",
            method: "POST",
            body
          };
        }
      }),
      logout: builder.mutation({
        query: function () {
          return {
            url: "/auth/logout",
            method: "POST"
          };
        }
      }),
      getMe: builder.query({
        query: function () {
          return "/auth/me";
        }
      }),
      getUsers: builder.query({
        query: function (params) {
          const query = new URLSearchParams();

          Object.entries(params || {}).forEach(function (entry) {
            const key = entry[0];
            const value = entry[1];

            if (value !== undefined && value !== null && value !== "") {
              query.set(key, String(value));
            }
          });

          return `/users?${query.toString()}`;
        },
        providesTags: function (result) {
          if (!result) return ["User"];

          return [
            "User",
            ...result.data.items.map(function (user) {
              return { type: "User", id: user.id };
            })
          ];
        }
      }),
      getUserById: builder.query({
        query: function (id) {
          return `/users/${id}`;
        },
        providesTags: function (result, error, id) {
          return [{ type: "User", id }];
        }
      }),
      createUser: builder.mutation({
        query: function (body) {
          return {
            url: "/users",
            method: "POST",
            body
          };
        },
        invalidatesTags: ["User", "Dashboard"]
      }),
      updateUser: builder.mutation({
        query: function (args) {
          return {
            url: `/users/${args.id}`,
            method: "PUT",
            body: args.body
          };
        },
        invalidatesTags: function (result, error, args) {
          return ["User", "Dashboard", { type: "User", id: args.id }];
        }
      }),
      deleteUser: builder.mutation({
        query: function (id) {
          return {
            url: `/users/${id}`,
            method: "DELETE"
          };
        },
        invalidatesTags: ["User", "Dashboard"]
      }),
      getEvents: builder.query({
        query: function (params) {
          const query = new URLSearchParams();

          Object.entries(params || {}).forEach(function (entry) {
            const key = entry[0];
            const value = entry[1];

            if (value !== undefined && value !== null && value !== "") {
              query.set(key, String(value));
            }
          });

          return `/events?${query.toString()}`;
        },
        providesTags: function (result) {
          if (!result) return ["Event"];

          return [
            "Event",
            ...result.data.items.map(function (event) {
              return { type: "Event", id: event._id };
            })
          ];
        }
      }),
      createEvent: builder.mutation({
        query: function (body) {
          return {
            url: "/events",
            method: "POST",
            body
          };
        },
        invalidatesTags: ["Event", "Dashboard"]
      }),
      updateEvent: builder.mutation({
        query: function (args) {
          return {
            url: `/events/${args.id}`,
            method: "PUT",
            body: args.body
          };
        },
        invalidatesTags: ["Event", "Dashboard"]
      }),
      deleteEvent: builder.mutation({
        query: function (id) {
          return {
            url: `/events/${id}`,
            method: "DELETE"
          };
        },
        invalidatesTags: ["Event", "Dashboard"]
      }),
      getDashboardStats: builder.query({
        query: function () {
          return "/dashboard/stats";
        },
        providesTags: ["Dashboard"],
        pollingInterval: 30000
      })
    };
  }
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetDashboardStatsQuery
} = apiSlice;
