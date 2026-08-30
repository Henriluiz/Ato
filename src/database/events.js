import { getDatabase } from './database';

export async function buscarEventos(eventId=false) {
    const db = await getDatabase();

    // Modo 1: Retorna APENAS o evento do ID informado
    if (eventId) {
        const evento = await db.getFirstAsync(
            `SELECT * FROM events WHERE id = ?`,
            [eventId]
        );

        if (!evento) return null;

        const event_recurrence = await db.getAllAsync(
            `SELECT * FROM event_recurrence WHERE event_id = ?`,
            [eventId]
        );

        return {
            ...evento,
            event_recurrence: event_recurrence || [],
        };
    }

    // Modo 2: Retorna TODOS os eventos com suas recorrências
    const eventos = await db.getAllAsync(
        `SELECT * FROM events ORDER BY created_at DESC`
    );

    if (!eventos || eventos.length === 0) return [];

    const recorrencias = await db.getAllAsync(
        `SELECT * FROM event_recurrence`
    );

    return eventos.map((evento) => ({
        ...evento,
        event_recurrence: recorrencias.filter(
            (rec) => rec.event_id === evento.id
        ),
    }));
}

export async function criarEvento({
    userId,
    nome,
    diaUnico,
    dataTermino,
    semFim,
    diasSelecionados,
}) {

    const db = await getDatabase();

    const agora = new Date().toISOString();

    const hoje = new Date();

    const dataAtual = hoje
        .toISOString()
        .split("T")[0];

    const data = diaUnico
        ? dataTermino.toISOString().split("T")[0]
        : dataAtual;


    // ============================
    // CRIA O EVENTO
    // ============================

    const result = await db.runAsync(

        `
        INSERT INTO events (
            user_id,
            name,
            event_type,
            start_date,
            end_date,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,

        userId,

        nome,

        diaUnico
            ? "one_time"
            : "weekly",

        data,

        diaUnico
            ? data
            : semFim
                ? null
                : data,

        agora,

        agora
    );


    const eventId =
        result.lastInsertRowId;


    // ============================
    // CRIA A RECORRÊNCIA
    // ============================

    if (!diaUnico) {

        const recorrencia = {

            monday:
                diasSelecionados.includes("monday")
                    ? 1
                    : 0,

            tuesday:
                diasSelecionados.includes("tuesday")
                    ? 1
                    : 0,

            wednesday:
                diasSelecionados.includes("wednesday")
                    ? 1
                    : 0,

            thursday:
                diasSelecionados.includes("thursday")
                    ? 1
                    : 0,

            friday:
                diasSelecionados.includes("friday")
                    ? 1
                    : 0,

            saturday:
                diasSelecionados.includes("saturday")
                    ? 1
                    : 0,

            sunday:
                diasSelecionados.includes("sunday")
                    ? 1
                    : 0,

        };


        await db.runAsync(

            `
            INSERT INTO event_recurrence (

                event_id,

                frequency,

                monday,
                tuesday,
                wednesday,
                thursday,
                friday,
                saturday,
                sunday,

                created_at

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,

            eventId,

            "weekly",

            recorrencia.monday,
            recorrencia.tuesday,
            recorrencia.wednesday,
            recorrencia.thursday,
            recorrencia.friday,
            recorrencia.saturday,
            recorrencia.sunday,

            agora
        );

    }


    return eventId;

}