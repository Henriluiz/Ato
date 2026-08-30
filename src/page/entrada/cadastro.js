import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Pressable, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

export default function Cadastro() {
	const [login, setLogin] = useState('');
	const [senha, setSenha] = useState('');
	const [Confirmarsenha, setConfirmarSenha] = useState('');
	const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

	const { signUp } = useAuth();

	async function handleSignIn() {
		setLoading(true);
		try {
			await signUp(login.trim(), senha);
		} catch (e) {
			Alert.alert('Erro', e.message || 'Falha ao entrar');
		} finally {
			setLoading(false);
		}
	}

	return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.conttitle}>
                    <View style={styles.boxMic}>
                        <Image style={{width: 35, height: 35}} source={require("../../../assets/mic-vocal.png")}/>
                    </View>
                    <Text style={styles.title}>Bem vindo!</Text>
                    <Text style={styles.description}>Crie uma conta para salvar as informações dos seus eventos!</Text>
                </View>
                
                


                <View style={styles.body}>
                    <Text style={styles.subtitlebody}>Usuário</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="carlosEventos"
                        placeholderTextColor={"#666"}
                        value={login}
                        onChangeText={setLogin}
                        autoCapitalize="none"
                        />
                    <Text style={styles.subtitlebody}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="******"
                        placeholderTextColor={"#666"}
                        value={senha}
                        onChangeText={setSenha}
                        // secureTextEntry
                    />
                    <Text style={styles.subtitlebody}>Confirmar a Senha</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="******"
                        placeholderTextColor={"#666"}
                        value={Confirmarsenha}
                        onChangeText={setConfirmarSenha}
                        // secureTextEntry
                    />
                    <Pressable
                        onPress={handleSignIn}
                        style={styles.button}
                        disabled={loading}
                        >
                        <Text style={styles.buttonText}>
                            {loading ? 'Criando...' : 'Criar Conta'}
                        </Text>
                    </Pressable>
                    <View style={{flexDirection: "row",justifyContent: "space-between"}}>
                        <Text style={styles.hint}>Já tem conta?</Text>
                        <Pressable onPress={() => navigation.navigate("login")}>
                            <Text style={styles.link}>Logar</Text>
                        </Pressable>
                    </View>

                </View>
            </SafeAreaView>
        </SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		backgroundColor: '#F9FAFB'
	},
    conttitle: {
        flex: 0.3,
        textAlign: "left"
    },
    boxMic: {
        backgroundColor: "#d9ee54",
        width: 65,
        height: 65,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
    },
    title: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 10,
	},
    description: {
        fontSize: 18,
        color: '#666',
        fontFamily: "Roboto",
    },


    body: {
        flex: 0.5
    },
    subtitlebody: {
        color: "#111827",
        fontFamily: "Roboto",
        fontWeight: "500",
        fontSize: 18,
    },
	
	input: {
		borderWidth: 1,
		borderColor: '#9CA3AF',
        backgroundColor: "#FFFFFF",
		padding: 15 ,
		borderRadius: 12,
		marginVertical: 15
	},
     button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },

    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
	hint: {
		marginTop: 12,
		textAlign: 'center',
		color: '#666'
	},
    link: {
        marginTop: 12,
        textAlign: 'center',
        color: '#4F46E5'
    },
});
