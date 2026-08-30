import React, {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    View,
    Text,
    Pressable,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
    FlatList
} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import { useAuth } from '../../../context/AuthContext';

// Icons
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

// Componentes
import Status from '../../../components/status';
import NavBar from '../../../components/navbar';

// Banco
import {
    buscarProgramacoesDoMes,
    adicionarDataExtra
} from '../../../database/programacoes';
import { buscarEventos } from '../../../database/events';

import styles from './styles';


export default function ProgramacaoSemanal() {

    const { signOut, user } = useAuth();

    const navigation = useNavigation();
    const route = useRoute();

    const {
        eventId,
        year,
        month
    } = route.params || {};

    const [buscar, setBuscar] = useState('');

    const [programacoes, setProgramacoes] = useState([]);

    const [loading, setLoading] = useState(true);

    const [modalAdicionar, setModalAdicionar] = useState(false);

    const [novaData, setNovaData] = useState('');

    const [adicionando, setAdicionando] = useState(false);
    const [evento, setEvento] = useState('');


    // ==========================================
    // CARREGAR PROGRAMAÇÕES
    // ==========================================

    const carregarProgramacoes = useCallback(async () => {

        if (!eventId || !year || !month) {
            console.warn(
                'ProgramacaoSemanal: eventId, year ou month não foram enviados.'
            );

            return;
        }

        try {

            setLoading(true);

            const dados = await buscarProgramacoesDoMes(
                eventId,
                year,
                month
            );

            setProgramacoes(dados);

            const evento =
                await buscarEventos(eventId);

            setEvento(evento);

        } catch (error) {

            console.error(
                'Erro ao carregar programações:',
                error
            );

            Alert.alert(
                'Erro',
                'Não foi possível carregar as programações.'
            );

        } finally {

            setLoading(false);

        }

    }, [eventId, year, month]);


    useEffect(() => {
        carregarProgramacoes();
    }, [carregarProgramacoes]);


    // ==========================================
    // RECARREGAR QUANDO VOLTAR PARA A TELA
    // ==========================================

    useFocusEffect(
        useCallback(() => {

            carregarProgramacoes();

        }, [carregarProgramacoes])
    );


    // ==========================================
    // FORMATAR DATA
    // ==========================================

    function formatarData(data) {

        if (!data) {
            return '';
        }

        const [ano, mes, dia] = data.split('-');

        const dataObj = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia)
        );

        const diasSemana = [
            'Domingo',
            'Segunda-feira',
            'Terça-feira',
            'Quarta-feira',
            'Quinta-feira',
            'Sexta-feira',
            'Sábado'
        ];

        return `${dia} - ${diasSemana[dataObj.getDay()]}`;
    }


    // ==========================================
    // FILTRAR BUSCA
    // ==========================================

    const programacoesFiltradas = programacoes.filter(item => {

        const textoData = formatarData(
            item.occurrence_date
        ).toLowerCase();

        return textoData.includes(
            buscar.toLowerCase()
        );

    });


    // ==========================================
    // ADICIONAR DATA EXTRA
    // ==========================================

    async function handleAdicionarData() {

        if (!novaData.trim()) {

            Alert.alert(
                'Data obrigatória',
                'Informe a data da programação.'
            );

            return;
        }

        // Aceita DD/MM/AAAA
        const partes = novaData.split('/');

        if (partes.length !== 3) {

            Alert.alert(
                'Data inválida',
                'Use o formato DD/MM/AAAA.'
            );

            return;
        }

        const [dia, mesData, anoData] = partes;

        const dataSQL =
            `${anoData}-${mesData.padStart(2, '0')}-${dia.padStart(2, '0')}`;

        try {

            setAdicionando(true);

            await adicionarDataExtra(
                eventId,
                dataSQL
            );

            setNovaData('');

            setModalAdicionar(false);

            await carregarProgramacoes();

        } catch (error) {

            console.error(
                'Erro ao adicionar data:',
                error
            );

            if (
                error?.message?.includes(
                    'UNIQUE constraint failed'
                )
            ) {

                Alert.alert(
                    'Data já cadastrada',
                    'Já existe uma programação para essa data.'
                );

            } else {

                Alert.alert(
                    'Erro',
                    'Não foi possível adicionar a programação.'
                );

            }

        } finally {

            setAdicionando(false);

        }
    }


    // ==========================================
    // RENDER CARD
    // ==========================================

    function renderProgramacao({ item }) {

        const statusVisual =
            item.status === 'completed'
                ? 'Feito'
                : item.status === 'cancelled'
                    ? 'Cancelado'
                    : 'A Iniciar';


        return (
            <Pressable
                onPress={() => {
                    navigation.navigate(
                        'Programacao',
                        {
                            occurrenceId: item.id,
                            eventId: item.event_id
                        }
                    );
                }}

                style={({ pressed }) => [
                    styles.cardEvento,
                    {
                        opacity: pressed ? 0.6 : 1,

                        transform: [
                            {
                                scale: pressed
                                    ? 0.98
                                    : 1
                            }
                        ]
                    }
                ]}
            >

                <View style={styles.cardTop}>

                    <Text
                        style={styles.textCardTop}
                        numberOfLines={1}
                    >
                        {formatarData(
                            item.occurrence_date
                        )}
                    </Text>


                    <Status
                        feito={statusVisual}
                        icon={true}
                    />

                </View>

            </Pressable>
        );
    }

    function formatarMesAno(dataStr) {
		if (!dataStr || !dataStr.includes("/")) return "";

		// Separa o mês e os 2 dígitos do ano
		const [mes, anoCurto] = dataStr.split("/");

		// Converte para o ano completo (ex: 26 -> 2026) e cria o objeto Date
		const anoCompleto = `${anoCurto}`;
		const data = new Date(anoCompleto, parseInt(mes, 10) - 1, 1);

		// Formata o mês por extenso em português
		const mesExtenso = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(data);

		// Capitaliza a primeira letra do mês (ex: "agosto" -> "Agosto")
		const mesCapitalizado = mesExtenso.charAt(0).toUpperCase() + mesExtenso.slice(1);

		return `${mesCapitalizado}/${anoCompleto}`;
	}

    return (
        <SafeAreaProvider>

            <SafeAreaView style={styles.container}>

                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}
                
                <View style={styles.header}>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={styles.title}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                        >
                            {evento?.name || 'Semanal'}
                        </Text>

                    </View>


                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 8
                        }}
                    >

                        <Pressable
                            style={({ pressed }) => [
                                styles.boxSettings,
                                {
                                    opacity: pressed
                                        ? 0.6
                                        : 1,

                                    transform: [
                                        {
                                            scale: pressed
                                                ? 0.95
                                                : 1
                                        }
                                    ]
                                }
                            ]}
                        >
                            <Ionicons
                                name="person-outline"
                                size={24}
                                color="#4B5563"
                            />
                        </Pressable>


                        <Pressable
                            style={({ pressed }) => [
                                styles.boxSettings,
                                {
                                    opacity: pressed
                                        ? 0.6
                                        : 1,

                                    transform: [
                                        {
                                            scale: pressed
                                                ? 0.95
                                                : 1
                                        }
                                    ]
                                }
                            ]}
                        >
                            <Ionicons
                                name="calendar-clear-outline"
                                size={24}
                                color="#4B5563"
                            />
                        </Pressable>


                        <Pressable
                            onPress={signOut}
                            style={({ pressed }) => [
                                styles.boxSettings,
                                {
                                    opacity: pressed
                                        ? 0.6
                                        : 1,

                                    transform: [
                                        {
                                            scale: pressed
                                                ? 0.95
                                                : 1
                                        }
                                    ]
                                }
                            ]}
                        >
                            <Ionicons
                                name="settings-outline"
                                size={24}
                                color="#4B5563"
                            />
                        </Pressable>

                    </View>

                </View>


                {/* ================================= */}
                {/* BUSCA */}
                {/* ================================= */}

                <View style={styles.input}>

                    <Feather
                        name="search"
                        size={24}
                        color="#9CA3AF"
                    />

                    <TextInput
                        style={{
                            outlineWidth: 0,
                            width: '100%',
                            paddingVertical: 8
                        }}

                        placeholder="Buscar Eventos..."
                        placeholderTextColor="#9CA3AF"

                        value={buscar}

                        onChangeText={setBuscar}

                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                </View>


                {/* ================================= */}
                {/* BODY */}
                {/* ================================= */}

                <View style={styles.contBody}>

                    {/* CONTADOR */}

                    <View style={styles.contadorContainer}>

                        <Text style={styles.mesTitulo}>
                            {formatarMesAno(month + "/" + year)}
                        </Text>

                        <Text style={styles.contador}>
                            {programacoes.length}{' '}
                            {programacoes.length === 1
                                ? 'programação'
                                : 'programações'}
                        </Text>

                    </View>


                    {/* CARDS */}

                    {loading ? (
                        <View style={styles.loading}>
                            <ActivityIndicator
                                size="large"
                                color="#4F46E5"
                            />
                        </View>
                    ) : (

                        <FlatList
                            data={programacoesFiltradas}
                            keyExtractor={(item) =>
                                String(item.id)
                            }
                            renderItem={renderProgramacao}
                            contentContainerStyle={{
                                gap: 15,
                                paddingBottom: 100
                            }}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.vazio}>
                                    <Text style={styles.vazioTitulo}>
                                        Nenhuma programação
                                    </Text>
                                    <Text style={styles.vazioTexto}>
                                        Adicione uma nova data
                                        usando o botão +
                                    </Text>
                                </View>
                            }

                        />

                    )}


                    {/* ================================= */}
                    {/* BOTÃO + */}
                    {/* ================================= */}

                    <View style={styles.boxAdd}>

                        <Pressable

                            onPress={() =>
                                setModalAdicionar(true)
                            }

                            style={({ pressed }) => [
                                styles.add,
                                {
                                    opacity: pressed
                                        ? 0.6
                                        : 1,

                                    transform: [
                                        {
                                            scale: pressed
                                                ? 0.95
                                                : 1
                                        }
                                    ]
                                }
                            ]}
                        >

                            <Ionicons
                                name="add"
                                size={30}
                                color="#FFFFFF"
                            />

                        </Pressable>

                    </View>

                </View>


                {/* ================================= */}
                {/* MODAL ADICIONAR DATA */}
                {/* ================================= */}

                <Modal
                    visible={modalAdicionar}
                    transparent
                    animationType="fade"
                    onRequestClose={() =>
                        setModalAdicionar(false)
                    }
                >

                    <View style={styles.modalBackground}>

                        <View style={styles.modal}>

                            <Text style={styles.modalTitulo}>
                                Adicionar outra data
                            </Text>

                            <Text style={styles.modalDescricao}>
                                Essa data será adicionada somente
                                para este evento e não alterará
                                a recorrência.
                            </Text>


                            <Text style={styles.label}>
                                Data
                            </Text>

                            <TextInput
                                style={styles.inputModal}
                                placeholder="DD/MM/AAAA"
                                placeholderTextColor="#9CA3AF"
                                value={novaData}
                                onChangeText={setNovaData}
                                keyboardType="numeric"
                                maxLength={10}
                            />


                            <View style={styles.modalBotoes}>

                                <Pressable
                                    onPress={() => {
                                        setNovaData('');
                                        setModalAdicionar(false);
                                    }}

                                    style={styles.botaoCancelar}
                                >

                                    <Text
                                        style={styles.textoCancelar}
                                    >
                                        Cancelar
                                    </Text>

                                </Pressable>


                                <Pressable

                                    onPress={handleAdicionarData}

                                    disabled={adicionando}

                                    style={[
                                        styles.botaoAdicionar,
                                        {
                                            opacity:
                                                adicionando
                                                    ? 0.6
                                                    : 1
                                        }
                                    ]}
                                >

                                    {adicionando ? (

                                        <ActivityIndicator
                                            color="#FFFFFF"
                                        />

                                    ) : (

                                        <Text
                                            style={styles.textoAdicionar}
                                        >
                                            Adicionar
                                        </Text>

                                    )}

                                </Pressable>

                            </View>

                        </View>

                    </View>

                </Modal>


                <NavBar tela="Programação" />

            </SafeAreaView>
        </SafeAreaProvider>
    );
}
