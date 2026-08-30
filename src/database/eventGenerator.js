import { getDatabase } from "./database";


// ==========================================
// FORMATAR DATA
// YYYY-MM-DD
// ==========================================

function formatarData(data) {

    const ano = data.getFullYear();

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        data.getDate()
    ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


// ==========================================
// ADICIONAR MESES
// ==========================================

function adicionarMeses(data, quantidade) {

    return new Date(

        data.getFullYear(),

        data.getMonth() + quantidade,

        1

    );

}


// ==========================================
// VERIFICAR SE A DATA PERTENCE AO EVENTO
// ==========================================

function dataDentroDoEvento(data, evento) {

    const dataString = formatarData(data);

    console.log(
        "VERIFICANDO DATA:",
        dataString,
        "| INÍCIO:",
        evento.start_date,
        "| FIM:",
        evento.end_date
    );


    // Antes da data inicial
    if (dataString < evento.start_date) {

        return false;

    }


    // Evento sem fim
    if (!evento.end_date) {

        return true;

    }


    // Depois da data final
    if (dataString > evento.end_date) {

        return false;

    }


    return true;
}


// ==========================================
// BUSCAR OU CRIAR EVENT MONTH
// ==========================================

async function buscarOuCriarMes(
    db,
    eventId,
    ano,
    mes
) {

    // Primeiro tenta encontrar
    // o mês já existente

    let eventMonth =
        await db.getFirstAsync(

            `
            SELECT *
            FROM event_months
            WHERE
                event_id = ?
            AND year = ?
            AND month = ?
            `,

            eventId,
            ano,
            mes

        );


    // Se já existe, retorna

    if (eventMonth) {

        return eventMonth;

    }


    // Se não existe, cria

    await db.runAsync(

        `
        INSERT INTO event_months (

            event_id,

            year,

            month,

            status

        )

        VALUES (?, ?, ?, ?)
        `,

        eventId,

        ano,

        mes,

        "planning"

    );


    // Busca novamente para pegar o ID

    eventMonth =
        await db.getFirstAsync(

            `
            SELECT *
            FROM event_months
            WHERE
                event_id = ?
            AND year = ?
            AND month = ?
            `,

            eventId,
            ano,
            mes

        );


    return eventMonth;

}


// ==========================================
// CRIAR OCORRÊNCIA
// ==========================================

async function criarOcorrencia(
    db,
    eventId,
    monthId,
    data
) {

    const dataFormatada =
        formatarData(data);


    await db.runAsync(

        `
        INSERT INTO event_occurrences (

            event_id,

            month_id,

            occurrence_date,

            start_time,

            status

        )

        VALUES (?, ?, ?, ?, ?)

        ON CONFLICT(event_id, occurrence_date)

        DO UPDATE SET

            month_id = excluded.month_id
        `,

        eventId,

        monthId,

        dataFormatada,

        "00:00",

        "planned"

    );
        console.log(
        "CRIANDO OCORRÊNCIA:",
        dataFormatada,
        "MONTH ID:",
        monthId
    );
}


// ==========================================
// CRIAR OCORRÊNCIAS
// PARA EVENTO DE DIA ÚNICO
// ==========================================

async function criarOcorrenciaDiaUnico(
    db,
    evento,
    eventMonth,
    ano,
    mes
) {

    const dataEvento =
        new Date(
            `${evento.start_date}T00:00:00`
        );


    const anoEvento =
        dataEvento.getFullYear();


    const mesEvento =
        dataEvento.getMonth() + 1;


    // Só cria se o mês atual
    // for o mês do evento

    if (
        anoEvento !== ano ||
        mesEvento !== mes
    ) {

        return;

    }


    await criarOcorrencia(

        db,

        evento.id,

        eventMonth.id,

        dataEvento

    );

}


// ==========================================
// CRIAR OCORRÊNCIAS
// PARA EVENTO RECORRENTE
// ==========================================

async function criarOcorrenciasRecorrentes(
    db,
    evento,
    eventMonth,
    ano,
    mes
) {

    console.log("================================");
    console.log(
        "GERANDO OCORRÊNCIAS PARA:",
        `${ano}-${String(mes).padStart(2, "0")}`
    );
    console.log(
        "MONTH ID RECEBIDO:",
        eventMonth.id
    );


    // ======================================
    // BUSCAR RECORRÊNCIA
    // ======================================

    const recorrencia =
        await db.getFirstAsync(
            `
            SELECT *
            FROM event_recurrence
            WHERE event_id = ?
            `,
            evento.id
        );


    if (!recorrencia) {

        console.log(
            "EVENTO SEM RECORRÊNCIA:",
            evento.id
        );

        return;
    }


    // ======================================
    // MAPA DOS DIAS
    // ======================================

    const mapaDias = {

        0: Number(recorrencia.sunday),

        1: Number(recorrencia.monday),

        2: Number(recorrencia.tuesday),

        3: Number(recorrencia.wednesday),

        4: Number(recorrencia.thursday),

        5: Number(recorrencia.friday),

        6: Number(recorrencia.saturday),

    };


    console.log(
        "DIAS SELECIONADOS:",
        mapaDias
    );


    // ======================================
    // ÚLTIMO DIA DO MÊS
    //
    // IMPORTANTE:
    // new Date(ano, mes, 0)
    //
    // mes é 1 a 12
    // ======================================

    const ultimoDia = new Date(
        ano,
        mes,
        0
    ).getDate();


    // ======================================
    // PERCORRER DIAS DO MÊS
    // ======================================

    for (
        let dia = 1;
        dia <= ultimoDia;
        dia++
    ) {

        // Cria uma data totalmente baseada
        // no ano e mês recebidos

        const data = new Date(
            ano,
            mes - 1,
            dia
        );


        // Segurança:
        // garante que nunca escaparemos
        // para outro mês

        if (
            data.getFullYear() !== ano ||
            data.getMonth() + 1 !== mes
        ) {

            console.log(
                "DATA FORA DO MÊS IGNORADA:",
                formatarData(data)
            );

            continue;
        }


        const diaDaSemana =
            data.getDay();


        // Dia não selecionado

        if (
            mapaDias[diaDaSemana] !== 1
        ) {

            continue;

        }


        // Data fora do período do evento

        if (
            !dataDentroDoEvento(
                data,
                evento
            )
        ) {

            continue;

        }


        console.log(
            "CRIANDO OCORRÊNCIA:",
            formatarData(data),
            "| MÊS:",
            mes,
            "| MONTH ID:",
            eventMonth.id
        );


        await criarOcorrencia(

            db,

            evento.id,

            eventMonth.id,

            data

        );

    }


    console.log(
        "FINALIZADO:",
        `${ano}-${String(mes).padStart(2, "0")}`
    );

}

// ==========================================
// GERAR PROGRAMAÇÃO MENSAL
//
// GERA 6 MESES PARA UM EVENTO ESPECÍFICO
// ==========================================

export async function gerarProgramacaoMensal(eventId) {

    const db = await getDatabase();


    // ======================================
    // BUSCAR EVENTO
    // ======================================

    const evento = await db.getFirstAsync(
        `
        SELECT *
        FROM events
        WHERE id = ?
        AND active = 1
        `,
        eventId
    );


    if (!evento) {
        throw new Error(
            "Evento não encontrado ou inativo."
        );
    }


    // ======================================
    // MÊS ATUAL
    // ======================================

    const hoje = new Date();

    const primeiroDiaDoMes = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
    );


    // ======================================
    // SEMPRE GARANTIR 6 MESES
    // ======================================

    for (let i = 0; i < 6; i++) {

        const dataMes = adicionarMeses(
            primeiroDiaDoMes,
            i
        );


        const ano = dataMes.getFullYear();

        const mes = dataMes.getMonth() + 1;


        // ==================================
        // CRIAR OU BUSCAR O MÊS
        // ==================================

        const eventMonth =
            await buscarOuCriarMes(
                db,
                eventId,
                ano,
                mes
            );


        if (!eventMonth) {
            continue;
        }


        // ==================================
        // EVENTO DE DIA ÚNICO
        // ==================================

        if (evento.event_type === "one_time") {

            await criarOcorrenciaDiaUnico(
                db,
                evento,
                eventMonth,
                ano,
                mes
            );

            continue;
        }


        // ==================================
        // EVENTO RECORRENTE
        // ==================================

        await criarOcorrenciasRecorrentes(
            db,
            evento,
            eventMonth,
            ano,
            mes
        );
        console.log("================================");
        console.log("PROCESSANDO MÊS:", ano, mes);
        console.log("EVENT MONTH:", eventMonth);
    }

    return true;
}