import React from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {useTheme} from '../theme/ThemeContext'

// Sintaxe para usa esse components e qualquer parte do sistema:
// 1. - import NavBar from "../components/navbar"
// Variedades:
// - <NavBar tela="Início"/>
// - <NavBar tela="Programação"/>
// - <NavBar tela="Pessoas"/>
// - <NavBar tela="Exportar"/>

export default function NavBar({ tela }) {
  const navigation = useNavigation();
  const {theme} = useTheme();

  let tabs = [
      {
        key: "Início",
        icon: tela === "Início" ? "home" : "home-outline",
        route: "inicial",
      },
      {
        key: "Programação",
        icon: tela === "Programação" ? "calendar-clear" : "calendar-clear-outline",
        route: "",
      },
      {
        key: "Pessoas",
        icon: tela === "Pessoas" ? "person" : "person-outline",
        route: "inicioChat",
      },
      {
        key: "Exportar",
        icon: tela === "exportar" ? "document" : "document-outline",
        route: "bancoDebug",
      },
    ];

  if (tela === "Início"){
    tabs = [
      {
        key: "Início",
        icon: tela === "Início" ? "home" : "home-outline",
        route: "inicial",
      },
      {
        key: "Pessoas",
        icon: tela === "Pessoas" ? "person" : "person-outline",
        route: "inicioChat",
      },
      {
        key: "Exportar",
        icon: tela === "exportar" ? "document" : "document-outline",
        route: "bancoDebug",
      },
    ];
  } 
  

  return (
    <View style={[styles.bottomNav, {backgroundColor: theme.navigationBackground, borderColor: theme.navigationBorder}]}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          hitSlop={28}
          onPress={() => tab.key !== "Programação" && navigation.navigate(tab.route)}
          style={({ pressed }) => ({
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.75 : 1 }],
          })}
        >
          <Ionicons
            name={tab.icon}
            size={24}
            color={tela === tab.key ? theme.navigationActive : theme.navigationInactive}
          />
          <Text
            style={{
                fontSize: 11,
                fontWeight: "semibold",
                marginTop: 4,
                color: tela === tab.key ? theme.navigationActive : theme.navigationInactive
            }}
          >{tab.key}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 25,
    backgroundColor: "#fff",
    marginTop: "auto",
  },
});