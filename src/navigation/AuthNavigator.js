import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../page/entrada/login";
import cadastro from "../page/entrada/cadastro";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="cadastro" component={cadastro} />
    </Stack.Navigator>
  );
}