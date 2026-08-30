import { StyleSheet} from "react-native";

export default StyleSheet.create({
    container: {
		flex: 1,
		backgroundColor: '#F9FAFB'
	},

    // HEADER (CABEÇA DA TELA)
    header: {
        flex: 0.1,
        padding: 24, // Fica igual o projeto
        
    },

    nameEvent: {
        color: "#4F46E5",
        fontSize: 13,
        fontWeight: "500"
    },

    title: {
        color: "#111827",
        fontSize: 24,
        fontWeight: "bold"
    },

    subtitle: {
        color: "#4B5563",
        fontSize: 14,
    },

    // -- Container Body --

    botton: {
        flexDirection: "row",
        borderColor: "#4F46E5",
        borderWidth: 2,
        borderStyle: "dashed",
        borderRadius: 12,
        marginInline: 24,
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
        height: 44,
    },

    textBotton: {
        color: "#4F46E5"
    },

    // Segmento

    segmentoTitle: {
        color: "#4F46E5",
        fontSize: 18,
        fontWeight: "700",
        paddingInline: 24,
    },

    // Card da Apresentação:
    presentation: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        marginInline: 24,
        // paddingInline: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        height: 64,
        marginVertical: 15,
    },

    preseTop: {
        alignItems: "center",
        justifyContent: "center",
        width: "17%"
    },

    preseDate: {
        color: "#4F46E5",
        fontSize: 14,
        fontWeight: "bold"
    },

    preseDur: {
        color: "#4B5563",
        fontSize: 11,
        fontWeight: "medium",
        textAlign: "left"
    },

    divider: {
		height: "100%",
		backgroundColor: "#E5E7EB",
		width: 1,
        marginInline: 5
	},

    preseBottom: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "75%",
    },

    preseTitle: {
        color: "#111827",
        fontSize: 14,
        fontWeight: "600"
    },

    presePerson: {
        color: "#4B5563",
        fontWeight: "regular",
        fontSize: 12
    },
})