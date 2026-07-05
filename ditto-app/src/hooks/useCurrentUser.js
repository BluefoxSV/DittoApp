import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useGetMeQuery, useGetUserProfileQuery } from "../store/api/usersApi";
import { useGetWorkerProfileByUserIdQuery } from "../store/api/workersApi";
import { logout, setCredentials } from "../store/slices/authSlice";

function getInitials(fullName) {
  if (!fullName) return "?";

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function useCurrentUser() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const {
    data: fetchedUser,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useGetMeQuery(undefined, { skip: !token });

  const currentUser = user ?? fetchedUser ?? null;
  const userId = currentUser?.id;
  const isWorker = currentUser?.role === "worker";

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    error: profileError,
  } = useGetUserProfileQuery(userId, { skip: !userId });

  const {
    data: workerProfile,
    isLoading: isLoadingWorkerProfile,
    isError: isWorkerProfileError,
  } = useGetWorkerProfileByUserIdQuery(userId, { skip: !userId || !isWorker });

  useEffect(() => {
    if (fetchedUser) {
      dispatch(setCredentials({ user: fetchedUser }));
    }
  }, [fetchedUser, dispatch]);

  useEffect(() => {
    if (isUserError && userError?.status === 401) {
      dispatch(logout());
    }
  }, [isUserError, userError, dispatch]);

  const isAuthenticated = Boolean(token);
  const isLoadingUserData =
    isAuthenticated && !currentUser && isLoadingUser;
  const isLoadingProfileData =
    isAuthenticated &&
    Boolean(userId) &&
    !profile &&
    isLoadingProfile &&
    !isProfileError;
  const isLoadingWorkerProfileData =
    isAuthenticated &&
    isWorker &&
    Boolean(userId) &&
    !workerProfile &&
    isLoadingWorkerProfile &&
    !isWorkerProfileError;

  const displayName = profile?.full_name ?? currentUser?.email ?? "";
  const trade = workerProfile?.bio ?? null;
  const initials = getInitials(displayName);

  return {
    user: currentUser,
    profile,
    workerProfile,
    displayName,
    trade,
    initials,
    isAuthenticated,
    isLoading: isLoadingUserData || isLoadingProfileData || isLoadingWorkerProfileData,
    error: isUserError ? userError : isProfileError ? profileError : null,
  };
}
