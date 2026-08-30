import React, { useCallback, useEffect,useState } from 'react';
import {
    View,
    Text,
    Pressable,
    TextInput,
    FlatList,
    Modal,
    ActivityIndicator,
    Alert
} from 'react-native';
import {
    useFocusEffect,
    useNavigation,
    useRoute
} from '@react-navigation/native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';


// Icons
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

// Módulo Próprio
import Status from '../../../components/status';
import NavBar from '../../../components/navbar';
import { useAuth } from '../../../context/AuthContext';
import {
    buscarMesesDoEvento,
    criarMesDoEvento
} from '../../../database/months';
import { buscarEventos } from '../../../database/events';
import styles from './styles';
import {
    gerarProgramacaoMensal
} from "../../../database/eventGenerator";

export default function ProgramacaoMensal() {
	const { signOut, user } = useAuth();

	const navigation = useNavigation();

	const route = useRoute();

	const { eventId } = route.params || {};

	const [buscar, setBuscar] = useState('');

	const [evento, setEvento] = useState('');

	const [meses, setMeses] = useState([]);

	const [loading, setLoading] = useState(true);

	const [modalAdicionar, setModalAdicionar] = useState(false);

	const carregarMeses = useCallback(async () => {

		if (!eventId) {
			return;
		}

		try {

			setLoading(true);

			const dados =
				await buscarMesesDoEvento(eventId);

			setMeses(dados);

			const evento =
				await buscarEventos(eventId);

			setEvento(evento);
		} catch (error) {

			console.error(
				'Erro ao carregar meses:',
				error
			);

			Alert.alert(
				'Erro',
				'Não foi possível carregar os meses.'
			);

		} finally {

			setLoading(false);

		}

	}, [eventId]);
	
	useEffect(() => {

        async function carregarProgramacao() {

            try {

                // ==========================
                // GARANTE OS 6 MESES
                // DESTE EVENTO
                // ==========================

                await gerarProgramacaoMensal(
                    eventId
                );


                console.log(
                    "Programação gerada para o evento:",
                    eventId
                );

            } catch (error) {

                console.error(

                    "Erro ao gerar programação:",

                    error

                );

            }

        }


        carregarProgramacao();

    }, [eventId]);
	
	useFocusEffect(
		useCallback(() => {
			carregarMeses();
		}, [carregarMeses])
	);

	const mesesFiltrados = meses.filter(item => {

		const texto =
			`${item.month}/${item.year}`
				.toLowerCase();

		return texto.includes(
			buscar.toLowerCase()
		);
	});

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

				<View style={styles.header}>
					<View style={{flex: 1}}>
						<Text style={styles.title}
						numberOfLines={1}
						adjustsFontSizeToFit
						minimumFontScale={0.7}
						>{evento?.name || 'Programação'}</Text>
					</View>
					<View style={{flexDirection: "row", gap: 8,}}>
						<Pressable title="Pessoas" 
						// onPress={signOut}
							style={({ pressed }) => [
								styles.boxSettings,
								{
								opacity: pressed ? 0.6 : 1,
								transform: [{ scale: pressed ? 0.95 : 1 }],
								},
							]}
						>
							<Ionicons name="person-outline" size={24} color="#4B5563" />
						</Pressable>
						<Pressable title="Calendar"
						// onPress={signOut}
							style={({ pressed }) => [
								styles.boxSettings,
								{
								opacity: pressed ? 0.6 : 1,
								transform: [{ scale: pressed ? 0.95 : 1 }],
								},
							]}
						>
							<Ionicons name="calendar-clear-outline" size={24} color="#4B5563" />
						</Pressable>
						<Pressable title="Sair" onPress={signOut}
							style={({ pressed }) => [
								styles.boxSettings,
								{
								opacity: pressed ? 0.6 : 1,
								transform: [{ scale: pressed ? 0.95 : 1 }],
								},
							]}
						>
							<Ionicons name="settings-outline" size={24} color="#4B5563" />
						</Pressable>
					</View>
				</View>
				{/* INPUT DE BUSCAR */}
				{/* Todo o estilo está dentro dessa View Mãe */}
				<View style={styles.input}> 
					<Feather name="search" size={24} color="#9CA3AF" />

					<TextInput
						style={{outlineWidth: 0, width: "100%", paddingVertical: 8}} // útil em React Native Web
						placeholder="Buscar Eventos..."
						placeholderTextColor="#9CA3AF"
						value={buscar}
						onChangeText={(text) => {
							setLogin(text);
							setErro('');
						}}
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>
				<View style={styles.contBody}>
					<FlatList
						data={mesesFiltrados}
						keyExtractor={(item) =>
							String(item.id)
						}
						contentContainerStyle={{
							gap: 15,
							paddingBottom: 100
						}}

						renderItem={({ item }) => (
							<Pressable
								onPress={() => {
									navigation.navigate(
										'ProgramacaoSemanal',
										{
											eventId,
											year: item.year,
											month: item.month
										}
									);
								}}
								style={({ pressed }) => [
									styles.cardEvento,
									{
										opacity: pressed
											? 0.6
											: 1,
										transform: [
											{
												scale: pressed
													? 0.97
													: 1
											}
										]
									}
								]}>
								<View style={styles.cardTop}>

									<Text
										style={styles.textCardTop}
									>
										{formatarMesAno(item.month + "/" + item.year)}
									</Text>

									<Status
										feito={
											item.status ||
											'planejamento'
										}
									/>

								</View>

							</Pressable>
						)}

						ListEmptyComponent={

							<View style={{
								alignItems: 'center',
								paddingTop: 40
							}}>

								<Text>
									Nenhum mês cadastrado.
								</Text>

							</View>
						}

					/>
					
					<View style={styles.boxAdd}>
						<Pressable
							style={({ pressed }) => [
								styles.add,
								{
								opacity: pressed ? 0.6 : 1,
								transform: [{ scale: pressed ? 0.95 : 1 }],
								},
							]}
						>
							<Ionicons name="add" size={30} color="#FFFFFF" />
						</Pressable>
					</View>
				</View>
				<NavBar tela="Programação"/>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

