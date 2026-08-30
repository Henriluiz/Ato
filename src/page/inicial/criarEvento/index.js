import React, { useMemo, useState, useRef } from 'react';

import {
    View,
    Text,
    TextInput,
    Pressable,
    Switch,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import {
    Ionicons,
    Feather,
} from '@expo/vector-icons';


import DateTimePicker from '@react-native-community/datetimepicker';

import { useNavigation } from '@react-navigation/native';

import styles from './styles';

import { criarEvento } from '../../../database/events';
import { useAuth } from '../../../context/AuthContext';
import {useTheme} from '../../../theme/ThemeContext'
import { THEMES } from '../../../theme/colors';


export default function CriarEvento() {

    const navigation = useNavigation();
    const {theme} = useTheme();


    // ==========================================
    // ESTADOS
    // ==========================================

    const [nomeEvento, setNomeEvento] = useState('');

    const [diaUnico, setDiaUnico] = useState(false);

    const [diasSelecionados, setDiasSelecionados] =
    useState([
        'tuesday',
        'thursday',
        'saturday',
    ]);

    const [semFim, setSemFim] = useState(false);

    const [dataTermino, setDataTermino] =
        useState(new Date(2026, 11, 30));

    const [mostrarData, setMostrarData] =
        useState(false);

    const [tagInput, setTagInput] = useState('');

    const [tags, setTags] = useState([
        'Presidente',
        'Sumplete',
        'Apresentador',
    ]);

    const { user } = useAuth();


    // =========================================
    // Centralizar o inputs no centro da tela, (onde o teclado não esconda)
    // =========================================
    const scrollRef = useRef(null);

    const centralizarInput = (event) => {
        const inputY = event.nativeEvent.target;

        // Aguarda o teclado começar a aparecer
        setTimeout(() => {
        scrollRef.current?.scrollTo({
            y: inputY,
            animated: true,
        });
        }, 300);
    };

    // ==========================================
    // DIAS DA SEMANA
    // ==========================================

    const dias = [

        {
            id: 'sunday',
            label: 'D',
        },

        {
            id: 'monday',
            label: 'S',
        },

        {
            id: 'tuesday',
            label: 'T',
        },

        {
            id: 'wednesday',
            label: 'Q',
        },

        {
            id: 'thursday',
            label: 'Q',
        },

        {
            id: 'friday',
            label: 'S',
        },

        {
            id: 'saturday',
            label: 'S',
        },

    ];

    // ==========================================
    // ALTERAR DIA
    // ==========================================

    function alternarDia(id) {

        setDiasSelecionados((atual) => {

            if (atual.includes(id)) {

                return atual.filter(
                    (dia) => dia !== id
                );

            }

            return [
                ...atual,
                id,
            ];

        });

    }

    // ==========================================
    // TODO DIA
    // ==========================================

    function selecionarTodosDias() {

    setDiasSelecionados([

        'sunday',

        'monday',

        'tuesday',

        'wednesday',

        'thursday',

        'friday',

        'saturday',

    ]);

}

    // ==========================================
    // DIAS ÚTEIS
    // ==========================================

    function selecionarDiasUteis() {

        setDiasSelecionados([

            'monday',

            'tuesday',

            'wednesday',

            'thursday',

            'friday',

        ]);

    }


    // ==========================================
    // FINS DE SEMANA
    // ==========================================

    function selecionarFimDeSemana() {

        setDiasSelecionados([

            'sunday',

            'saturday',

        ]);

    }


    // ==========================================
    // VERIFICAR PRESET ATIVO
    // ==========================================

    const presetAtivo = useMemo(() => {

        const todosDias = [

            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',

        ];


        const diasUteis = [

            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',

        ];


        const finsDeSemana = [

            'sunday',
            'saturday',

        ];


        const verificarDias = (diasPreset) => {

            return (

                diasSelecionados.length ===
                    diasPreset.length &&

                diasPreset.every((dia) =>
                    diasSelecionados.includes(dia)
                )

            );

        };


        if (verificarDias(todosDias)) {

            return 'todo';

        }


        if (verificarDias(diasUteis)) {

            return 'uteis';

        }


        if (verificarDias(finsDeSemana)) {

            return 'fimSemana';

        }


        return null;

    }, [diasSelecionados]);


    // ==========================================
    // ADICIONAR TAG
    // ==========================================

    function adicionarTag() {

        const tag = tagInput.trim();

        if (!tag) {
            return;
        }

        const existe = tags.some(
            (item) =>
                item.toLowerCase() ===
                tag.toLowerCase()
        );

        if (existe) {

            Alert.alert(
                'Tag já adicionada',
                'Essa tag já está na lista.'
            );

            return;
        }

        setTags((atual) => [
            ...atual,
            tag,
        ]);

        setTagInput('');

    }


    // ==========================================
    // REMOVER TAG
    // ==========================================

    function removerTag(tagRemover) {

        setTags((atual) =>
            atual.filter(
                (tag) => tag !== tagRemover
            )
        );

    }


    // ==========================================
    // DATA
    // ==========================================

    function alterarData(event, date) {

        setMostrarData(false);

        if (date) {

            setDataTermino(date);

        }

    }


    // ==========================================
    // CRIAR EVENTO
    // ==========================================

    async function handleCriarEvento() {

        if (!nomeEvento.trim()) {

            Alert.alert(
                'Nome obrigatório',
                'Digite o nome do evento.'
            );

            return;
        }


        if (
            !diaUnico &&
            diasSelecionados.length === 0
        ) {

            Alert.alert(
                'Repetição',
                'Selecione pelo menos um dia da semana.'
            );

            return;
        }


        try {

            const eventId = await criarEvento({

                userId: user.id,

                nome: nomeEvento.trim(),

                diaUnico,

                dataTermino,

                semFim,

                diasSelecionados,

            });


            console.log(
                'Evento criado com ID:',
                eventId
            );


            Alert.alert(
                'Evento criado',
                'O evento foi criado com sucesso.',
                [
                    {
                        text: 'OK',

                        onPress: () =>
                            navigation.goBack(),
                    },
                ]
            );

        } catch (error) {

            console.error(
                'Erro ao criar evento:',
                error
            );


            Alert.alert(
                'Erro',
                'Não foi possível criar o evento.'
            );

        }

    }

    // ==========================================
    // DATA FORMATADA
    // ==========================================

    const dataFormatada =
        dataTermino.toLocaleDateString(
            'pt-BR'
        );


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <SafeAreaProvider>
            <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                
                {/* ================================= */}
                {/* CABEÇALHO */}
                {/* ================================= */}

                <View style={styles.header}>

                    <Text style={[styles.title, {color: theme.text}]}>
                        Criar Evento
                    </Text>


                    <Pressable
                        onPress={() =>
                            navigation.goBack()
                        }

                        style={({ pressed }) => [
                            styles.closeButton,
                            {
                                opacity: pressed
                                    ? 0.6
                                    : 1,
                                backgroundColor: theme.buttonBackground,
                                borderColor: theme.buttonBorder
                            },
                        ]}
                    >

                        <Ionicons
                            name="close-circle-outline"
                            size={20}
                            color={theme.icon}
                        />

                    </Pressable>

                </View>


                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                        styles.scrollContent
                    }
                    ref={scrollRef}
                    keyboardShouldPersistTaps="handled"
                >

                    {/* ================================= */}
                    {/* NOME */}
                    {/* ================================= */}

                    <Text style={[styles.sectionTitle, {color: theme.textSecondary}]}>
                        Nome do Evento
                    </Text>

                    <TextInput
                        value={nomeEvento}
                        onChangeText={setNomeEvento}
                        placeholder="Nome do evento"
                        placeholderTextColor={theme.textSecondary}
                        style={[styles.input, {backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.textSecondary}]}
                        maxLength={100}
                    />


                    {/* ================================= */}
                    {/* REPETIR */}
                    {/* ================================= */}

                    <Text
                        style={[
                            styles.sectionTitle,
                            styles.repeatTitle, {color: theme.textSecondary}
                        ]}
                    >
                        Repetir
                    </Text>

                    <Pressable
                        onPress={() => setDiaUnico((atual) => !atual)}
                        style={[ 
                            styles.presetButton, 
                            {marginBottom: 8, backgroundColor: theme.buttonBackground, borderColor: theme.border},
                            diaUnico && styles.presetSelected, {backgroundColor: theme.buttonBackground}
                        ]}
                    >
                        <Text
                            style={[
                                styles.presetText, {color: theme.textSecondary},
                                diaUnico && styles.presetTextSelected,
                            ]}
                        >
                            Dia Único
                        </Text>
                    </Pressable>

                    {/* DIAS */}
                    {!diaUnico && (
                    <View>
                        <View style={styles.daysRow}>

                            {dias.map((dia) => {

                                const selecionado =
                                    diasSelecionados.includes(
                                        dia.id
                                    );

                                return (

                                    <Pressable
                                        key={dia.id}

                                        onPress={() =>
                                            alternarDia(
                                                dia.id
                                            )
                                        }

                                        style={[
                                            styles.dayButton, {backgroundColor: theme.buttonBackground, borderColor: theme.border},
                                            selecionado &&
                                                styles.dayButtonSelected,
                                        ]}
                                    >

                                        <Text
                                            style={[
                                                styles.dayText,{color: theme.textSecondary},
                                                selecionado &&
                                                styles.dayTextSelected, 
                                            ]}
                                        >
                                            {dia.label}
                                        </Text>

                                    </Pressable>

                                );

                            })}

                        </View>


                        {/* PRESETS */}

                        <View style={styles.presetsRow}>

                            <Pressable
                                onPress={
                                    selecionarTodosDias
                                }

                                style={[
                                    styles.presetButton,
                                    {backgroundColor: theme.buttonBackground, borderColor: theme.border},
                                    presetAtivo === 'todo' &&
                                        styles.presetSelected, {backgroundColor: theme. buttonBackground}
                                ]}
                            >

                                <Text
                                    style={[
                                        styles.presetText, {color: theme.textSecondary},
                                        presetAtivo === 'todo' &&
                                            styles.presetTextSelected,
                                    ]}
                                >
                                    Todo Dia
                                </Text>

                            </Pressable>


                            <Pressable
                                onPress={
                                    selecionarDiasUteis
                                }

                                style={[
                                    styles.presetButton,
                                    {backgroundColor: theme.buttonBackground, borderColor: theme.border},
                                    presetAtivo === 'uteis' &&
                                        styles.presetSelected,
                                        {backgroundColor: theme. buttonBackground}
                                ]}
                            >

                                <Text
                                    style={[
                                        styles.presetText,{color: theme.textSecondary},
                                        presetAtivo === 'uteis' &&
                                            styles.presetTextSelected,
                                    ]}
                                >
                                    Dias Úteis
                                </Text>

                            </Pressable>


                            <Pressable
                                onPress={
                                    selecionarFimDeSemana
                                }

                                style={[
                                    styles.presetButton,
                                    {backgroundColor: theme.buttonBackground, borderColor: theme.border},
                                    presetAtivo === 'fimSemana' &&
                                        styles.presetSelected,
                                        {backgroundColor: theme. buttonBackground}
                                ]}
                            >

                                <Text
                                    style={[
                                        styles.presetText,{color: theme.textSecondary},
                                        presetAtivo === 'fimSemana' &&
                                            styles.presetTextSelected,
                                    ]}
                                >
                                    Fins de Semana
                                </Text>

                            </Pressable>

                        </View>
                    </View>)}

                    {/* ================================= */}
                    {/* DATA DE TÉRMINO */}
                    {/* ================================= */}

                    <Text
                        style={[
                            styles.sectionTitle,
                            styles.endTitle,
                            {color: theme.textSecondary}
                        ]}
                    >
                        {diaUnico ? 'Data do Evento' : 'Data de Término'}
                    </Text>

                    <View style={styles.endDateRow}>

                        <Pressable
                            disabled={!diaUnico && semFim}
                            onPress={() => setMostrarData(true)}
                            style={[
                                styles.dateInput, {backgroundColor: theme.buttonBackground, borderColor: theme.border},
                                !diaUnico &&
                                    semFim &&
                                    styles.dateInputDisabled
                            ]}
                        >

                            <Feather
                                name="calendar"
                                size={17}
                                color={
                                    !diaUnico && semFim
                                        ? '#BFC5D0'
                                        : '#667085'
                                }
                            />

                            <Text
                                style={[
                                    styles.dateText,
                                    !diaUnico &&
                                        semFim &&
                                        styles.dateTextDisabled,
                                ]}
                            >
                                {dataFormatada}
                            </Text>

                        </Pressable>


                        {!diaUnico && (
                            <View style={{flexDirection: "row"}}>
                                <Text style={[styles.semFimText, {color: theme.textSecondary}]}>
                                    Sem Fim
                                </Text>

                                <Switch
                                    value={semFim}
                                    onValueChange={setSemFim}
                                    trackColor={{
                                        false: theme.navigationInactive,
                                        true: theme.navigationActive
                                    }}
                                    thumbColor="#FFFFFF"
                                    ios_backgroundColor="#D1D5DB"
                                    style={styles.switch}
                                />
                            </View>
                        )}

                    </View>


                    {mostrarData && (

                        <DateTimePicker
                            value={dataTermino}
                            mode="date"
                            display={
                                Platform.OS === 'ios'
                                    ? 'spinner'
                                    : 'default'
                            }
                            onChange={
                                alterarData
                            }

                            minimumDate={
                                new Date()
                            }
                        />

                    )}


                    {/* ================================= */}
                    {/* TAGS */}
                    {/* ================================= */}

                    <Text
                        style={[
                            styles.sectionTitle,
                            styles.tagsTitle, {color: theme.textSecondary}
                        ]}
                    >
                        Tags e Funções
                    </Text>


                    <View style={styles.tagInputRow}>

                        <TextInput
                            value={tagInput}
                            onChangeText={setTagInput}
                            placeholder="Adicionar tag ou função..."
                            onFocus={centralizarInput}
                            placeholderTextColor={theme.textSecondary}
                            style={[styles.tagInput, {backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.textSecondary}]}
                            onSubmitEditing={
                                adicionarTag
                            }
                            returnKeyType="done"
                        />


                        <Pressable
                            onPress={adicionarTag}

                            style={({ pressed }) => [
                                styles.addTagButton,
                                {
                                    opacity: pressed
                                        ? 0.7
                                        : 1,
                                    backgroundColor: theme.primary
                                },
                            ]}
                        >

                            <Ionicons
                                name="add"
                                size={30}
                                color="#FFFFFF"
                            />

                        </Pressable>

                    </View>


                    {/* TAGS */}

                    <View style={styles.tagsContainer}>

                        {tags.map((tag) => (

                            <View
                                key={tag}
                                style={[styles.tag, {backgroundColor: theme.buttonBackground}]}
                            >

                                <Text style={[styles.tagText, {color: theme.primary}]}>
                                    {tag}
                                </Text>


                                <Pressable
                                    onPress={() =>
                                        removerTag(tag)
                                    }

                                    hitSlop={8}
                                >

                                    <Ionicons
                                        name="close-circle"
                                        size={13}
                                        color={theme.primary}
                                    />

                                </Pressable>

                            </View>

                        ))}

                    </View>

                </ScrollView>


                {/* ================================= */}
                {/* BOTÃO */}
                {/* ================================= */}

                <View style={styles.footer}>

                    <Pressable
                        onPress={
                            handleCriarEvento
                        }

                        style={({ pressed }) => [
                            styles.createButton,
                            {
                                opacity: pressed
                                    ? 0.85
                                    : 1,
                            },
                        ]}
                    >

                        <Text style={styles.createButtonText}>
                            Criar Evento
                        </Text>

                    </Pressable>

                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    </SafeAreaProvider>
    );
}