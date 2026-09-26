import { Redirect } from 'expo-router';

/** Landing route for the Google sign-in redirect: just go back to the app. */
export default function AuthCallback() {
  return <Redirect href="/" />;
}
