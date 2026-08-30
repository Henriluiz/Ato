import { StyleSheet} from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        flex: 0.1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: 24,
    },

    title: {
        color: "#111827",
        fontSize: 24,
        fontWeight: "bold"
    },

    boxAccount: {
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        height: 44, 
        width: 44,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB"
    },

    body: {
        paddingInline: 24,
    },
    
    card: {
        paddingVertical: 14,
        marginTop: 25,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        gap: 16,
    },

    label: {
        marginInline: 12,
        marginBottom: 7,
        color: "#111827",
        fontSize: 16,
        fontWeight: "bold",
    },

    themeContainer: {
        backgroundColor: "#F9FAFB",
        borderColor: "cyan",
        borderWidth: 1,
        borderRadius: 12,
        marginInline: 12,
        overflow: "hidden",
        height: 40,
        alignItems: "flex-start",
        justifyContent: "center",
        paddingLeft: 5
    },
    inputContainer: {
        backgroundColor: "#F9FAFB",
        borderColor: "cyan",
        borderWidth: 1,
        borderRadius: 12,
        marginInline: 12,
        overflow: "hidden",
        paddingInline: 5,
    },

    containerBottons: {
        flexDirection: "row",
        padding: 16,
        gap: 4,
        marginTop: -15,
    },

    textBotton: {
        color: "#F5F5F5",
        textAlign: "center",
        fontSize: 16,
    },

    botton: {
        width: "33%",
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        backgroundColor: "#111827"
    },

    bottonDataBase: {
        backgroundColor: "#4F46E5"
    },

    signature: {
        color: "#4B5563",
        fontSize: 12,
        fontWeight: "light",
        paddingInline: 18,
    },
})