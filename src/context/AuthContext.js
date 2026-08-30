import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import AsyncStorage from
    "@react-native-async-storage/async-storage";

import { getDatabase } from "../database/database";
// AJUSTE O CAMINHO ACIMA PARA O SEU ARQUIVO


const AuthContext = createContext({});


export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    // ==========================================
    // CARREGAR SESSÃO
    // ==========================================

    useEffect(() => {

        async function loadSession() {

            try {

                const userStr =
                    await AsyncStorage.getItem(
                        "@app:user"
                    );


                if (userStr) {

                    const userObj =
                        JSON.parse(userStr);

                    setUser(userObj);

                }

            } catch (error) {

                console.log(
                    "Erro ao carregar sessão:",
                    error
                );

            } finally {

                setLoading(false);

            }

        }


        loadSession();

    }, []);


    // ==========================================
    // CADASTRAR USUÁRIO
    // ==========================================

    async function signUp(login, senha) {

        const db = await getDatabase();

        const loginLimpo =
            login.trim();


        if (!loginLimpo) {

            throw new Error(
                "Digite um usuário."
            );

        }


        if (!senha) {

            throw new Error(
                "Digite uma senha."
            );

        }


        // Verifica se o usuário já existe

        const usuarioExistente =
            await db.getFirstAsync(

                `
                SELECT id
                FROM users
                WHERE name = ?
                `,

                [loginLimpo]

            );


        if (usuarioExistente) {

            throw new Error(
                "Este usuário já existe."
            );

        }


        const agora =
            new Date().toISOString();


        // Cria o usuário

        const result =
            await db.runAsync(

                `
                INSERT INTO users (
                    name,
                    password_hash,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?)
                `,

                [
                    loginLimpo,
                    senha,
                    agora,
                    agora,
                ]

            );


        const userObj = {

            id: result.lastInsertRowId,

            name: loginLimpo,

        };


        // Salva a sessão localmente

        await AsyncStorage.setItem(
            "@app:user",
            JSON.stringify(userObj)
        );


        setUser(userObj);


        return userObj;

    }


    // ==========================================
    // LOGIN
    // ==========================================

    async function signIn(login, senha) {

        const db = await getDatabase();

        const loginLimpo =
            login.trim();


        const usuario =
            await db.getFirstAsync(

                `
                SELECT
                    id,
                    name,
                    password_hash
                FROM users
                WHERE name = ?
                `,

                [loginLimpo]

            );


        if (!usuario) {

            throw new Error(
                "Usuário não encontrado."
            );

        }


        if (
            usuario.password_hash !== senha
        ) {

            throw new Error(
                "Senha incorreta."
            );

        }


        const userObj = {

            id: usuario.id,

            name: usuario.name,

        };


        // Salva a sessão

        await AsyncStorage.setItem(
            "@app:user",
            JSON.stringify(userObj)
        );


        setUser(userObj);


        return userObj;

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    async function signOut() {

        await AsyncStorage.removeItem(
            "@app:user"
        );


        setUser(null);

    }


    return (

        <AuthContext.Provider
            value={{

                user,

                loading,

                signIn,

                signUp,

                signOut,

            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


export function useAuth() {

    return useContext(
        AuthContext
    );

}