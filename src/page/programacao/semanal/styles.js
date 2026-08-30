import { StyleSheet} from "react-native";

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F9FAFB'
    },


    header: {
        flex: 0.1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20
    },


    title: {
        fontSize: 24,
        color: '#111827',
        fontWeight: 'bold'
    },


    boxSettings: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        padding: 5,
        width: 42,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center'
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


    contBody: {
        flex: 0.85,
        paddingTop: 15,
        paddingHorizontal: 25
    },


    contadorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },


    mesTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827'
    },


    contador: {
        fontSize: 14,
        color: '#6B7280'
    },


    cardEvento: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        height: 60,
        justifyContent: 'center'
    },


    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15
    },


    textCardTop: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827'
    },


    boxAdd: {
        position: 'absolute',
        right: 20,
        bottom: 20
    },


    add: {
        backgroundColor: '#4F46E5',
        borderRadius: 36,
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',

        elevation: 5
    },


    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },


    vazio: {
        alignItems: 'center',
        paddingTop: 50
    },


    vazioTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827'
    },


    vazioTexto: {
        marginTop: 5,
        color: '#6B7280'
    },


    // ==============================
    // MODAL
    // ==============================

    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },


    modal: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20
    },


    modalTitulo: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#111827'
    },


    modalDescricao: {
        marginTop: 8,
        marginBottom: 20,
        color: '#6B7280',
        lineHeight: 20
    },


    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8
    },


    inputModal: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#111827'
    },


    modalBotoes: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 20
    },


    botaoCancelar: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 10
    },


    textoCancelar: {
        color: '#4B5563',
        fontWeight: '600'
    },


    botaoAdicionar: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 10,
        minWidth: 90,
        alignItems: 'center'
    },


    textoAdicionar: {
        color: '#FFFFFF',
        fontWeight: '600'
    }

});