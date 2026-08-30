import { StyleSheet} from "react-native";

export default StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F9FAFB'
	},

	// NAVBAR - HEADER (I)

	header: {
		flex: 0.1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		// backgroundColor: "blue",
		paddingTop: 10,
		paddingInline: 20,
	},

	subtitle: {
		fontSize: 14,
		color: "#4B5563"
	},

	title: {
		fontSize: 24,
		color: "#111827",
		fontWeight: "bold",
	},

	boxSettings: {
		backgroundColor: "#F3F4F6",
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#E5E7EB",
		padding: 5,
        width: 42,
        height: 44,
        alignItems: "center",
        justifyContent: "center"
	},

	input: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		backgroundColor: "#FFF",
		borderWidth: 2,
		borderColor: "#E5E7EB",
		borderRadius: 12,
		height: 50,
		marginInline: 15,
		paddingInline: 10
	},

	// Body: Titulo e Cards, 15


	contBody: {
		flex: 0.85,
		gap: 15,
        paddingTop: 15,
		// alignItems: "center",

	},

	// Card

	cardEvento: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		borderWidth: 2,
		borderColor: "#E5E7EB",
		justifyContent: "space-between",


		height: 60,
		marginInline: 25,
	},

	// Parte acima da linha divisora do card.
	cardTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 10,
		paddingInline: 15

	},

	textCardTop: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
	},

	// Divisora
	divider: {
		height: 1,
		backgroundColor: "#E5E7EB",
		width: "100%",
	},

	// Parte de baixo da linha divisora do card


	boxAdd: {
		position: 'absolute',
		left: 325,
		bottom: 0,
	},

	add: {
		backgroundColor: "#4F46E5",
		borderRadius: 36,
		padding: 18,
	},
});
