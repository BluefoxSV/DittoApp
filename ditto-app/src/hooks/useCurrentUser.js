import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useGetMeQuery } from "../store/api/usersApi";
import { logout, setCredentials } from "../store/slices/authSlice";

export function useCurrentUser() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const {
    data: fetchedUser,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (fetchedUser) {
      dispatch(setCredentials({ user: fetchedUser }));
    }
  }, [fetchedUser, dispatch]);

  useEffect(() => {
    if (isError && error?.status === 401) {
      dispatch(logout());
    }
  }, [isError, error, dispatch]);

  const currentUser = user ?? fetchedUser ?? null;
  const isAuthenticated = Boolean(token);

  return {
    user: currentUser,
    isAuthenticated,
    isLoading: isAuthenticated && !currentUser && (isLoading || isFetching),
    error: isError ? error : null,
  };
}
