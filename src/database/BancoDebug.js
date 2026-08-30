import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { getDatabase } from "../database/database";

const TABELAS = [
    "users", "events", "event_recurrence", "occurrence_assignments",
    "event_months", "event_occurrences", "people", "tags",
    "person_tags", "roles", "person_roles", "absences",
    "segment_templates", "presentation_templates", "presentation_template_roles",
    "segments", "presentation_types", "presentation_type_roles",
    "presentations", "presentation_members", "assignment_history",
    "assignment_history_summary"
];

// Utilitário para validar/sanitizar nomes de colunas e tabelas para queries dinâmicas
const sanitizeIdentifier = (identifier) => {
    if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
        throw new Error("Identificador inválido contendo caracteres não permitidos.");
    }
    return identifier;
};

export default function BancoDebug() {
    const [dados, setDados] = useState({});
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    // Estados para Edição/Exclusão
    const [modalVisible, setModalVisible] = useState(false);
    const [tabelaAtual, setTabelaAtual] = useState("");
    const [registroEditando, setRegistroEditando] = useState(null);
    const [jsonTexto, setJsonTexto] = useState("");

    async function carregarDados() {
        try {
            setLoading(true);
            setErro(null);
            const db = await getDatabase();
            const novosDados = {};

            for (const tabela of TABELAS) {
                try {
                    const safeTable = sanitizeIdentifier(tabela);
                    const resultado = await db.getAllAsync(`SELECT * FROM ${safeTable}`);
                    novosDados[tabela] = resultado;
                } catch (error) {
                    novosDados[tabela] = { erro: error.message };
                }
            }
            setDados(novosDados);
        } catch (error) {
            setErro(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    // Identifica dinamicamente a chave primária
    const getPrimaryKey = (item) => {
        if ("id" in item) return "id";
        if ("uuid" in item) return "uuid";
        const keys = Object.keys(item);
        return keys.find((key) => key.endsWith("_id")) || keys[0];
    };

    // Exclui um único registro
    const confirmarExclusao = (tabela, item) => {
        const pk = getPrimaryKey(item);
        const valorPk = item[pk];

        Alert.alert(
            "Excluir Registro",
            `Deseja realmente excluir da tabela '${tabela}' onde ${pk} = ${valorPk}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const db = await getDatabase();
                            const safeTable = sanitizeIdentifier(tabela);
                            const safePk = sanitizeIdentifier(pk);

                            await db.runAsync(
                                `DELETE FROM ${safeTable} WHERE ${safePk} = ?`,
                                [valorPk]
                            );
                            carregarDados();
                        } catch (err) {
                            Alert.alert("Erro ao excluir", err.message);
                        }
                    },
                },
            ]
        );
    };

    // Nova funcionalidade: Deleta todos os dados de uma tabela específica
    const limparTabela = (tabela) => {
        Alert.alert(
            "Limpar Tabela",
            `ATENÇÃO: Tem certeza que deseja apagar TODOS os registros da tabela '${tabela}'? Esta ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Apagar Tudo",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const db = await getDatabase();
                            const safeTable = sanitizeIdentifier(tabela);

                            await db.runAsync(`DELETE FROM ${safeTable}`);
                            carregarDados();
                        } catch (err) {
                            Alert.alert("Erro ao limpar tabela", err.message);
                        }
                    },
                },
            ]
        );
    };

    // Prepara Edição
    const abrirEdicao = (tabela, item) => {
        setTabelaAtual(tabela);
        setRegistroEditando(item);
        setJsonTexto(JSON.stringify(item, null, 2));
        setModalVisible(true);
    };

    // Salva Alterações com Sanitização e PreparedStatement
    const salvarEdicao = async () => {
        try {
            const objetoAtualizado = JSON.parse(jsonTexto);
            const pk = getPrimaryKey(registroEditando);
            const valorPk = registroEditando[pk];

            const db = await getDatabase();
            const safeTable = sanitizeIdentifier(tabelaAtual);
            const safePk = sanitizeIdentifier(pk);

            const keys = Object.keys(objetoAtualizado).filter((k) => k !== pk);
            const setClause = keys
                .map((key) => `${sanitizeIdentifier(key)} = ?`)
                .join(", ");

            const values = keys.map((key) => objetoAtualizado[key]);
            values.push(valorPk);

            await db.runAsync(
                `UPDATE ${safeTable} SET ${setClause} WHERE ${safePk} = ?`,
                values
            );

            setModalVisible(false);
            carregarDados();
        } catch (err) {
            Alert.alert("Erro ao Salvar", "Certifique-se de que o JSON é válido. Detalhes: " + err.message);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Carregando banco...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Banco de Dados</Text>
                <Text style={styles.subtitle}>Inspeção e Edição do SQLite</Text>
            </View>

            <Pressable style={styles.button} onPress={carregarDados}>
                <Text style={styles.buttonText}>Atualizar Dados</Text>
            </Pressable>

            {erro && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{erro}</Text>
                </View>
            )}

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {TABELAS.map((tabela) => {
                    const tabelaDados = dados[tabela];
                    const temErro = tabelaDados && !Array.isArray(tabelaDados);
                    const quantidade = Array.isArray(tabelaDados) ? tabelaDados.length : 0;

                    return (
                        <View key={tabela} style={styles.tableBox}>
                            <View style={styles.tableHeader}>
                                <View style={styles.headerTitleGroup}>
                                    <Text style={styles.tableName}>{tabela}</Text>
                                    <Text style={styles.count}>{quantidade}</Text>
                                </View>

                                {/* Botão para Limpar a Tabela Inteira */}
                                {!temErro && quantidade > 0 && (
                                    <Pressable
                                        style={styles.clearTableBtn}
                                        onPress={() => limparTabela(tabela)}
                                    >
                                        <Text style={styles.clearTableText}>Limpar Tabela</Text>
                                    </Pressable>
                                )}
                            </View>

                            {temErro && (
                                <Text style={styles.errorText}>
                                    Erro: {tabelaDados.erro}
                                </Text>
                            )}

                            {!temErro && quantidade === 0 && (
                                <Text style={styles.emptyText}>Nenhum registro</Text>
                            )}

                            {!temErro && quantidade > 0 && (
                                <View style={styles.recordsContainer}>
                                    {tabelaDados.map((item, index) => {
                                        const pk = getPrimaryKey(item);
                                        return (
                                            <View key={index} style={styles.recordBox}>
                                                <Text style={styles.recordTitle}>
                                                    {pk}: {String(item[pk])}
                                                </Text>
                                                <Text style={styles.data}>
                                                    {JSON.stringify(item, null, 2)}
                                                </Text>
                                                <View style={styles.actionsRow}>
                                                    <Pressable
                                                        style={[styles.actionBtn, styles.editBtn]}
                                                        onPress={() => abrirEdicao(tabela, item)}
                                                    >
                                                        <Text style={styles.actionText}>Editar</Text>
                                                    </Pressable>
                                                    <Pressable
                                                        style={[styles.actionBtn, styles.deleteBtn]}
                                                        onPress={() => confirmarExclusao(tabela, item)}
                                                    >
                                                        <Text style={styles.actionText}>Excluir</Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Modal para Edição Completa */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar ({tabelaAtual})</Text>
                        <TextInput
                            style={styles.modalInput}
                            multiline
                            value={jsonTexto}
                            onChangeText={setJsonTexto}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <View style={styles.modalActions}>
                            <Pressable
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalBtnText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={salvarEdicao}
                            >
                                <Text style={styles.modalBtnText}>Salvar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FC", padding: 16 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 16, color: "#475467" },
    header: { marginBottom: 16 },
    title: { fontSize: 24, fontWeight: "700", color: "#101828" },
    subtitle: { fontSize: 14, color: "#667085", marginTop: 4 },
    button: { backgroundColor: "#4F46E5", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginBottom: 16 },
    buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
    scroll: { flex: 1 },
    tableBox: { backgroundColor: "#FFFFFF", borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden" },
    tableHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
    headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
    tableName: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
    count: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: "#EEF2FF", color: "#4F46E5", textAlign: "center", textAlignVertical: "center", fontWeight: "700" },
    clearTableBtn: { backgroundColor: "#FEE2E2", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
    clearTableText: { color: "#991B1B", fontSize: 12, fontWeight: "600" },
    emptyText: { padding: 14, color: "#98A2B3", fontStyle: "italic" },
    recordsContainer: { padding: 10 },
    recordBox: { backgroundColor: "#F9FAFB", borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#EAECF0" },
    recordTitle: { fontWeight: "700", color: "#344054", marginBottom: 4 },
    data: { fontSize: 11, fontFamily: "monospace", color: "#344054", backgroundColor: "#FFFFFF", padding: 8, borderRadius: 6 },
    actionsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, gap: 8 },
    actionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
    editBtn: { backgroundColor: "#0284C7" },
    deleteBtn: { backgroundColor: "#D97706" },
    actionText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
    errorBox: { padding: 12, backgroundColor: "#FEE2E2", borderRadius: 8, marginBottom: 16 },
    errorText: { color: "#B42318", fontSize: 13, padding: 10 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
    modalContent: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, maxHeight: "80%" },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#101828" },
    modalInput: { height: 250, borderColor: "#D0D5DD", borderWidth: 1, borderRadius: 8, padding: 10, fontFamily: "monospace", fontSize: 12, textAlignVertical: "top" },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16, gap: 12 },
    modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
    cancelBtn: { backgroundColor: "#98A2B3" },
    saveBtn: { backgroundColor: "#16A34A" },
    modalBtnText: { color: "#FFFFFF", fontWeight: "600" },
});