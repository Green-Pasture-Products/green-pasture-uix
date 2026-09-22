import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/_redux/store';
import { googleOAuthSigninAsync } from '@/_redux/actions/auth.action';
import { useRouter } from 'next/router';

export const useGoogleAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleGoogleSuccess = useCallback(
    async (credentialResponse: any) => {
      try {
        if (!credentialResponse?.credential) {
          throw new Error('No credential received from Google');
        }

        const result = await dispatch(
          googleOAuthSigninAsync({
            accessToken: credentialResponse.credential,
          })
        ).unwrap();

        // Check if it's a new user
        if (result?.data?.isNewUser) {
          // For new users, they're already authenticated by the backend
          // Just redirect to dashboard or home
          router.push('/');
        } else {
          // Existing user, redirect to home
          router.push('/');
        }
      } catch (err) {
        console.error('Google authentication failed:', err);
      }
    },
    [dispatch, router]
  );

  const handleGoogleError = useCallback(() => {
    console.error('Google Sign-In failed');
  }, []);

  return {
    handleGoogleSuccess,
    handleGoogleError,
    isLoading,
    error,
  };
};
