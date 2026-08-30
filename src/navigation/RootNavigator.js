import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import Splash from "../page/entrada/splash";
import { useAuth } from "../context/AuthContext";

export default function RootNavigator() {
  // const { user, loading } = useAuth();
  
  const user = true
  const loading = false

  if (loading) {
    return <Splash />;
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}