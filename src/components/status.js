import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {useTheme} from '../theme/ThemeContext';



const STATUS = {
  feito: {
    label: "Feito",
    icon: "checkmark-circle",
  },
  planejamento: {
    label: "Em planejamento",
    icon: "calendar-outline",
  },
  iniciar: {
    label: "A iniciar",
    icon: "time-outline",
  },
  indisponivel: {
    label: "Indisponível",
    icon: "close-circle-outline",
  },
};

export default function Status({ feito, icon }) {
  const {theme} = useTheme();
  const BACKGROUND = {
    feito: { color: theme.status.feito.background },
    planejamento: { color: theme.status.planejamento.background },
    iniciar: { color: theme.status.iniciar.background },
    indisponivel: { color: theme.status.indisponivel.background },
  };
  
  const COLOR = {
    feito: { color: theme.status.feito.text },
    planejamento: { color: theme.status.planejamento.text },
    iniciar: { color: theme.status.iniciar.text },
    indisponivel: { color: theme.status.indisponivel.text },
  };
  let tipo = "iniciar";
  let icons = Boolean(false);

  if (feito === true) {
    tipo = "feito";
  } else if (feito === "planejamento") {
    tipo = "planejamento";
  } else if (feito === "indisponivel") {
    tipo = "indisponivel";
  }

  if (icon === true){
    icons = true
  }

  const status = STATUS[tipo];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: BACKGROUND[tipo].color },
      ]}
    > 
      {icons && (
      <Ionicons
        name={status.icon}
        size={18}
        color={COLOR[tipo].color}
      />)}

      <Text
        style={[
          styles.text,
          { color: COLOR[tipo].color },
        ]}
      >
        {status.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 8,
    gap: 6,
  },

  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});