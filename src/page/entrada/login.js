import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    Image,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

export default function Login() {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();
    const { signIn } = useAuth();

    const validarCampos = () => {
        const user = login.trim();
        const senhaLimpa = senha.trim();

        setErro('');

        if (!user) {
            setErro('Digite seu usuário.');
            return false;
        }

        if (!senhaLimpa) {
            setErro('Digite sua senha.');
            return false;
        }

        if (senhaLimpa.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return false;
        }

        return true;
    };

    const handleSignIn = async () => {
        setLoading(true);
        // Primeiro valida
        if (!validarCampos()) {
            setLoading(false)
            return;
        }

        try {
            await signIn(login.trim(), senha);
        } catch (e) {
            const mensagem =
                e instanceof Error
                    ? e.message
                    : 'Usuário ou senha inválidos.';

            setErro(mensagem);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>

                <View style={styles.conttitle}>
                    <View style={styles.boxMic}>
                        <Image
                            style={{ width: 35, height: 35 }}
                            source={require('../../../assets/mic-vocal.png')}
                        />
                    </View>

                    <Text style={styles.title}>
                        Bem vindo de volta!
                    </Text>

                    <Text style={styles.description}>
                        O painel definitivo para organizar seus eventos,
                        apresentações e palestrantes com agilidade.
                    </Text>
                </View>
                {erro !== '' && (
                        <Text style={styles.mensagemErro}>
                            {erro}
                        </Text>
                    )}
                <View style={styles.body}>

                    <Text style={styles.subtitlebody}>
                        Usuário
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="carlosEventos"
                        placeholderTextColor="#666"
                        value={login}
                        onChangeText={(text) => {
                            setLogin(text);
                            setErro('');
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.subtitlebody}>
                        Senha
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="******"
                        placeholderTextColor="#666"
                        value={senha}
                        onChangeText={(text) => {
                            setSenha(text);
                            setErro('');
                        }}
                        secureTextEntry
                    />

                    

                    <Pressable
                        onPress={handleSignIn}
                        style={({ pressed }) => [
                            styles.button,
                            loading && styles.buttonDisabled,
                            pressed && !loading && styles.buttonPressed,
                        ]}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Text>
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={styles.hint}>
                            Esqueceu a senha?
                        </Text>

                        <Pressable
                            onPress={() => navigation.navigate('cadastro')}
                        >
                            <Text style={styles.link}>
                                Criar Conta
                            </Text>
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
        backgroundColor: '#F9FAFB',
    },

    conttitle: {
        flex: 0.35,
    },

    boxMic: {
        backgroundColor: '#4F46E5',
        width: 65,
        height: 65,
        justifyContent: 'center',
        alignItems: 'center',
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
    },

    body: {
        flex: 0.4,
    },

    subtitlebody: {
        color: '#111827',
        fontWeight: '500',
        fontSize: 18,
    },

    input: {
        borderWidth: 1,
        borderColor: '#9CA3AF',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginVertical: 18,
    },

    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    hint: {
        marginTop: 12,
        color: '#666',
    },

    link: {
        marginTop: 12,
        color: '#4F46E5',
    },

    mensagemErro: {
        color: 'red',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 10,
        fontSize: 14,
    },
});