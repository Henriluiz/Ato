import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import NavBar from '../../components/navbar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

import {
    buscarApresentacoesDaOcorrencia,
    atualizarOrdemApresentacoes,
} from '../../database/programacoes';
import { buscarEventos } from '../../database/events';

import styles from './styles';


// Agrupa a lista plana em seções por segment_id.
// Se segment_id for null, a seção não tem "name" -> sem título.
function agruparPorSegmento(presentations) {
    const grupos = [];
    let grupoAtual = null;

    for (const item of presentations) {
        const pertenceAoGrupoAtual =
            grupoAtual && grupoAtual.segmentId === item.segment_id;

        if (!pertenceAoGrupoAtual) {
            grupoAtual = {
                segmentId: item.segment_id,       // pode ser null
                segmentName: item.segment_name,   // pode ser null
                items: [],
            };
            grupos.push(grupoAtual);
        }

        grupoAtual.items.push(item);
    }

    return grupos;
}

export default function Programacao() {
    const route = useRoute();
    const { occurrenceId, eventId } = route.params || {};

    const [presentations, setPresentations] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [evento, setEvento] = useState();

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        try {
            const rows = await buscarApresentacoesDaOcorrencia(occurrenceId);
            setPresentations(rows);

            const evento_atual = await buscarEventos(eventId);
            setEvento(evento_atual)

        } catch (err) {
            console.error('Erro ao carregar apresentações:', err);
        } finally {
            setCarregando(false);
        }
    }, [occurrenceId]);

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [carregarDados])
    );

    // Recalculado sempre que `presentations` muda
    const grupos = useMemo(
        () => agruparPorSegmento(presentations),
        [presentations]
    );

    // Reordenação dentro de UM grupo específico
    const handleDragEndDoGrupo = useCallback(
        async (indiceGrupo, { data: itensReordenados }) => {
            // Reconstroi os grupos, trocando só o grupo que mudou
            const novosGrupos = grupos.map((g, i) =>
                i === indiceGrupo ? { ...g, items: itensReordenados } : g
            );

            // "Achata" todos os grupos de volta numa lista única,
            // respeitando a ordem visual das seções na tela
            const listaFinal = novosGrupos.flatMap((g) => g.items);

            // Atualiza a tela imediatamente (otimista)
            setPresentations(listaFinal);

            // Persiste: position = índice na lista final e completa
            try {
                await atualizarOrdemApresentacoes(listaFinal);
            } catch (err) {
                console.error('Erro ao salvar nova ordem:', err);
                carregarDados();
            }
        },
        [grupos, carregarDados]
    );

    const renderItem = useCallback(({ item, drag, isActive }) => {
        return (
            <ScaleDecorator>
                <View style={[styles.presentation, isActive && { opacity: 0.8 }]}>
                    <View style={styles.preseTop}>
                        <Text style={styles.preseDate}>{item.start_time}</Text>
                        <Text style={styles.preseDur}>{item.duration_minutes} min</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.preseBottom}>
                        <View>
                            <Text style={styles.preseTitle}>{item.title}</Text>
                            <Text style={styles.presePerson}>{item.notes}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <Pressable onPress={() => { /* abrir modal de edição */ }}>
                                <Octicons name="pencil" size={16} color="#4B5563" />
                            </Pressable>
                            <Pressable onLongPress={drag} disabled={isActive}>
                                <FontAwesome name="bars" size={16} color="#4B5563" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ScaleDecorator>
        );
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.nameEvent}>{evento?.name || 'Evento'}</Text>
                    <Text style={styles.title}>Cronograma do Evento</Text>
                    <Text style={styles.subtitle}>Terça-feira, 24 de Março • 09:00 às 13:00</Text>
                    {/* TENTAR, extrair o primeiro horário com o último + duração dele para fazer
                    o subtitle com a hora inicial e final certo */}
                </View> 

                <ScrollView style={styles.contBody}>
                    {grupos.map((grupo, indice) => (
                        <View key={grupo.segmentId ?? `sem-segmento-${indice}`}>

                            {/* AQUI está o pedido: só renderiza se houver nome */}
                            {!!grupo.segmentName && (
                                <Text style={styles.segmentoTitle}>
                                    {grupo.segmentName.toUpperCase()}
                                </Text>
                            )}

                            <DraggableFlatList
                                data={grupo.items}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={renderItem}
                                onDragEnd={(payload) =>
                                    handleDragEndDoGrupo(indice, payload)
                                }
                                activationDistance={0}
                                scrollEnabled={false}
                            />
                        </View>
                    ))}

                    <Pressable style={styles.botton}>
                        <Ionicons name="add" size={24} color="#4F46E5" />
                        <Text style={styles.textBotton}>Adicionar Segmento</Text>
                    </Pressable>
                </ScrollView>

                <NavBar tela="Programação" />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}