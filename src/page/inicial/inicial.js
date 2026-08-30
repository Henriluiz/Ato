import React, {
    useCallback,
    useEffect,
    useState
} from 'react';
import { View, Text, Pressable, TextInput, FlatList,
    Modal,
    Alert,
    ActivityIndicator } from 'react-native';
import {
    useFocusEffect,
    useNavigation
} from '@react-navigation/native';
import {
    buscarEventos,
    criarEvento
} from '../../database/events';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import styles from './styles';

// Icons
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

// Módulo Próprio
import { useAuth } from '../../context/AuthContext';
import Status from '../../components/status';
import NavBar from '../../components/navbar';
import {useTheme} from '../../theme/ThemeContext'

export default function Inicial() {
	const { signOut, user } = useAuth();
	const {theme} = useTheme();

	const navigation = useNavigation();

	const [buscar, setBuscar] = useState('');
	const [eventos, setEventos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalCriar, setModalCriar] = useState(false);
	const [nomeEvento, setNomeEvento] = useState('');
	const [criando, setCriando] = useState(false);

	const carregarEventos = useCallback(async () => {
		try {
			setLoading(true);

			const dados = await buscarEventos();

			console.log('Eventos encontrados:', dados);

			setEventos(dados || []);

		} catch (error) {
			console.error('Erro ao carregar eventos:', error);

			setEventos([]);

		} finally {
			setLoading(false);
		}
	}, []);
		
	const eventosFiltrados = eventos.filter(evento => {

		const nome = (
			evento.name || ''
		).toLowerCase();

		return nome.includes(
			buscar.toLowerCase()
		);
	});

	function formatarRecorrencia(eventRecurrence) {
		if (!eventRecurrence || eventRecurrence.length === 0) return "";

		const item = eventRecurrence[0];

		// Caso seja Mensal
		if (item.frequency === "monthly") {
			return "Todo Mês";
		}

		// Caso seja Semanal
		if (item.frequency === "weekly") {
			const diasSemana = [
			{ key: "sunday", label: "Domingo" },
			{ key: "monday", label: "Segunda" },
			{ key: "tuesday", label: "Terça" },
			{ key: "wednesday", label: "Quarta" },
			{ key: "thursday", label: "Quinta" },
			{ key: "friday", label: "Sexta" },
			{ key: "saturday", label: "Sábado" },
			];

			// Filtra apenas os dias ativados (valor === 1)
			const diasAtivos = diasSemana
			.filter((dia) => item[dia.key] === 1)
			.map((dia) => dia.label);

			if (diasAtivos.length === 0) return "Toda semana";
			if (diasAtivos.length === 1) return `Toda ${diasAtivos[0]}`;

			// Junta os dias com vírgula e substitui a última vírgula por " e "
			const ultimodDia = diasAtivos.pop();
			return `Toda ${diasAtivos.join(", ")} e ${ultimodDia}`;
		}

		return "";
		}


	useFocusEffect(
		useCallback(() => {
			carregarEventos();
		}, [carregarEventos])
	);

	return (
		<SafeAreaProvider>
			<SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
				
				<View style={styles.header}>
					<View>
						<Text style={[styles.subtitle, {color: theme.textSecondary}]}>Bem-vindo de volta!</Text>
						<Text style={[styles.name, {color: theme.text}]}>{user?.name || 'Luiz Henrique'} 👋🏼</Text>
					</View>
					
					<Pressable title="Configuração" onPress={() => navigation.navigate("config")}
						style={({ pressed }) => [
							styles.boxSettings,
							{
							opacity: pressed ? 0.6 : 1,
							transform: [{ scale: pressed ? 0.95 : 1 }],
							backgroundColor: theme.buttonBackground,
							borderColor: theme.buttonBorder
							},
						]}
					>
						<Ionicons name="settings-outline" size={24} color={theme.icon} />
					</Pressable>
				</View>
				{/* INPUT DE BUSCAR */}
				{/* Todo o estilo está dentro dessa View Mãe */}
				<View style={[styles.input, {backgroundColor: theme.inputBackground, borderColor: theme.border}]}> 
					<Feather name="search" size={24} color="#9CA3AF" />

					<TextInput
						style={{outlineWidth: 0, width: "100%"}} // útil em React Native Web
						placeholder="Buscar Eventos..."
						placeholderTextColor={theme.textSecondary}
						value={buscar}
						onChangeText={setBuscar}
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>
				<View style={styles.contBody}>
					<Text style={[styles.title, {color: theme.textSecondary}]}>Criar Eventos</Text>

					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator
								size="large"
								color={theme.primary}
							/>
						</View>
					) : (
						<FlatList
							data={eventosFiltrados}
							keyExtractor={(item) => String(item.id)}

							contentContainerStyle={{
								gap: 15,
								paddingBottom: 100
							}}

							showsVerticalScrollIndicator={false}

							renderItem={({ item }) => (
								<Pressable
									onPress={() => {item.event_type === "one_time" ?
										navigation.navigate(
											'Programacao', // Já vai direto para a tela principal
											{
												eventId: item.id
											}
										) : navigation.navigate(
											'ProgramacaoMensal',
											{
												eventId: item.id
											}
										)
									}}

									style={[styles.cardEvento, {backgroundColor: theme.surface, borderColor: theme.surfaceSecondary}]}
								>
									<View style={styles.cardTop}>
										<Text style={[styles.textCardTop, {color: theme.text}]}>
											{item.name}
										</Text>

										<Status
											feito={
												item.status === 'planning'
													? 'planejamento'
													: item.status
											}
										/>
									</View>
									<View style={[styles.divider, {backgroundColor: theme.surfaceSecondary}]} />
									<View style={styles.cardBotton}>
										<Text style={[styles.textCardBotton, {color: theme.textSecondary}]}>
											<Feather
												name="calendar"
												size={17}
												color={theme.textSecondary}
											/>

											{'  '}

											{item.created_at
												? new Date(
												item.created_at
												).toLocaleDateString('pt-BR')
												: 'Sem data'
											}
										</Text>
										<Text style={[styles.textCardBotton, {color: theme.textSecondary}]}>
											{item.event_type === "one_time"
												? "Dia Único"
												: formatarRecorrencia(item.event_recurrence)
											}
										</Text>
									</View>
								</Pressable>
							)}

							ListEmptyComponent={
								<View style={styles.emptyContainer}>
									<Text style={styles.emptyText}>
										Nenhum evento encontrado.
									</Text>
								</View>
							}
						/>
					)}


					
					<View style={styles.boxAdd}>
						<Pressable
							onPress={() => navigation.navigate("criarEvento")}
							style={({ pressed }) => [
								styles.add, 
								{
								opacity: pressed ? 0.6 : 1,
								transform: [{ scale: pressed ? 0.95 : 1 }],
								backgroundColor: theme.primary
								},
							]}
						>
							<Ionicons name="add" size={30} color="#FFFFFF" />
						</Pressable>
					</View>
				</View>

				<NavBar tela="Início"/>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

