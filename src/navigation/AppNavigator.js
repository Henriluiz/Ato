import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Inicial from "../page/inicial/inicial";
import CriarEvento from "../page/inicial/criarEvento";
import NavBar from "../components/navbar"
import ProgramacaoMensal from "../page/programacao/mensal/programacaoMensal";
import ProgramacaoSemanal from "../page/programacao/semanal/programacaoSemanal";
import Programacao from "../page/programacao/programacao";
import Config from "../page/configApp/config";
import BancoDebug from "../database/BancoDebug";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="inicial" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="inicial" component={Inicial} />
      <Stack.Screen name="criarEvento" component={CriarEvento} />
      <Stack.Screen name="ProgramacaoMensal" component={ProgramacaoMensal} />
      <Stack.Screen name="ProgramacaoSemanal" component={ProgramacaoSemanal} />
      <Stack.Screen name="Programacao" component={Programacao} />
      <Stack.Screen name="config" component={Config} />
      <Stack.Screen name="bancoDebug" component={BancoDebug} />

    </Stack.Navigator>
  );
}