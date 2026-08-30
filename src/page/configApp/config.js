import React, { useState } from "react";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

// Estilo
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import styles from "./styles";

import {useNavigation} from '@react-navigation/native';
import { useTheme } from "../../theme/ThemeContext";


import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { openDatabaseSync } from 'expo-sqlite';

export default function Config() {
    const {
        themeMode,
        toggleTheme,
        theme,
    } = useTheme();
    const navigation = useNavigation();
    const [codigoAcesso, setCodigoAcesso] = useState();

    const handleRestoreBackup = async () => {
        try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['*/*', 'application/x-sqlite3', 'application/octet-stream'],
            copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return;
        }

        const dbName = 'meu_banco.db';

        Alert.alert(
            'Atenção',
            'Restaurar o backup irá sobrescrever os dados atuais. Deseja continuar?',
            [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Restaurar',
                style: 'destructive',
                onPress: async () => {
                try {
                    // 1. Abre a conexão atual e encerra para liberar o arquivo físico
                    const db = openDatabaseSync(dbName);
                    db.closeSync();

                    // 2. Aponta os caminhos do arquivo
                    const sourceFile = new File(result.assets[0].uri);
                    const targetFile = new File(Paths.document, `SQLite/${dbName}`);

                    // 3. Remove o banco antigo e copia o novo
                    if (targetFile.exists) {
                    targetFile.delete();
                    }

                    sourceFile.copy(targetFile);

                    Alert.alert(
                    'Sucesso',
                    'Backup restaurado com sucesso! Reinicie o app para recarregar os dados.'
                    );
                } catch (err) {
                    console.error(err);
                    Alert.alert('Erro', 'Falha ao substituir o arquivo de banco de dados.');
                }
                },
            },
            ]
        );
        } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
        }
    };

    // ! Deu um erro, no backup o arquivo encontrasse corropido, e por causa disso ainda não testei
    // ! o restore que coloquei no botão deslogar por enquanto.

    const handleExportBackup = async () => {
        try {
        const dbName = 'desigparts.db'; 

        // 1. Aponta para o arquivo do banco no armazenamento interno do Expo
        const dbFile = new File(Paths.document, `SQLite/${dbName}`);

        // 2. Verifica se o arquivo existe usando a propriedade .exists
        if (!dbFile.exists) {
            Alert.alert('Erro', 'Banco de dados não encontrado.');
            return;
        }

        // 3. Define o arquivo de destino para o backup
        const backupFile = new File(Paths.document, `backup_${Date.now()}.db`);

        // 4. Copia o arquivo usando o método .copy() da nova API
        dbFile.copy(backupFile);

        // 5. Compartilha o arquivo gerado
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(backupFile.uri, {
            dialogTitle: 'Salvar backup do Banco de Dados',
            mimeType: 'application/x-sqlite3',
            UTI: 'public.database',
            });
        } else {
            Alert.alert('Sucesso', `Backup salvo em: ${backupFile.uri}`);
        }
        } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível gerar o backup.');
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={[styles.container, {
                backgroundColor: theme.background
            }]}>
                <View style={styles.header}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Pressable onPress={() => navigation.navigate("inicial")}>
                            <Entypo name="chevron-left" size={40} color={theme.icon}/>
                        </Pressable>
                        <Text style={[styles.title, {color: theme.text}]}>Configuração</Text>
                    </View>
                    <Pressable
                        style={[styles.boxAccount, {backgroundColor: theme.buttonBackground, borderColor: theme.buttonBorder}]}
                        // onPress={}    
                    >
                        <MaterialIcons name="account-circle" size={24} color={theme.icon} />
                    </Pressable>
                </View>
                <View style={styles.body}>
                    <View style={[styles.card, {backgroundColor: theme.surface}]}>
                        <View>
                            <Text style={[styles.label, {color: theme.textSecondary}]}>Tema (Claro/Escuro)</Text>
                            <Pressable onPress={toggleTheme} style={[styles.themeContainer, {backgroundColor: theme.inputBackground, borderColor: theme.border}]}>
                                <Text
                                    style={{
                                        color: theme.text,
                                    }}
                                >
                                    {themeMode === "light"
                                    ? "🌙 Modo escuro"
                                    : "☀️ Modo claro"}
                                </Text>
                            </Pressable>
                        </View>
                        <View>
                            <Text style={[styles.label, {color: theme.textSecondary}]}>Código de Acesso</Text>
                            <View style={[styles.inputContainer, {backgroundColor: theme.inputBackground, borderColor: theme.border}]}>
                                <TextInput
                                    style={{ width: "100%", height: 50}}
                                    placeholder="Acesso"
                                    placeholderTextColor={theme.textSecondary}
                                    value={codigoAcesso}
                                    onChangeText={setCodigoAcesso}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                >
                                    
                                </TextInput>
                            </View>
                        </View>
                        <View style={styles.containerBottons}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.botton,
                                    {
                                    opacity: pressed ? 0.6 : 1,
                                    transform: [{ scale: pressed ? 0.95 : 1 }],
                                    },
                                ]}
                                onPress={handleExportBackup}
                            >
                                <Text style={styles.textBotton}>Backup</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.botton,
                                    {
                                    opacity: pressed ? 0.6 : 1,
                                    transform: [{ scale: pressed ? 0.95 : 1 }],
                                    },
                                ]}
                                onPress={handleRestoreBackup}
                            >
                                <Text style={styles.textBotton}>Restaurar</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.botton, styles.bottonDataBase,
                                    {
                                    opacity: pressed ? 0.6 : 1,
                                    transform: [{ scale: pressed ? 0.95 : 1 }],
                                    backgroundColor: theme.primary
                                    },
                                ]}
                                onPress={() => navigation.navigate("bancoDebug")}
                            >
                                <Text style={styles.textBotton}>Banco de Dados</Text>
                            </Pressable>
                        </View>
                        <Text style={[styles.signature, {color: theme.textSecondary}]}>Este aplicativo é um projeto extracurricular desenvolvido por Luiz Henrique entre os meses de agosto e setembro de 2026, focado em conhecer mais a ferramenta e prática de desenvolvimento.</Text>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )

}