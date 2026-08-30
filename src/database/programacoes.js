import { getDatabase } from './database';

export async function buscarProgramacoesDoMes(eventId, ano, mes) {
    const db = await getDatabase();

    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;

    let proximoAno = ano;
    let proximoMes = mes + 1;

    if (proximoMes > 12) {
        proximoMes = 1;
        proximoAno++;
    }

    const fim = `${proximoAno}-${String(proximoMes).padStart(2, '0')}-01`;

    const programacoes = await db.getAllAsync(
        `
        SELECT
            id,
            event_id,
            month_id,
            occurrence_date,
            start_time,
            end_time,
            status,
            notes
        FROM event_occurrences
        WHERE event_id = ?
          AND occurrence_date >= ?
          AND occurrence_date < ?
        ORDER BY occurrence_date ASC
        `,
        eventId,
        inicio,
        fim
    );

    return programacoes;
}

export async function adicionarDataExtra(
    eventId,
    data,
    horaInicio = '00:00'
) {
    const db = await getDatabase();

    const result = await db.runAsync(
        `
        INSERT INTO event_occurrences (
            event_id,
            month_id,
            occurrence_date,
            start_time,
            status,
            notes
        )
        VALUES (?, NULL, ?, ?, 'planned', ?)
        `,
        eventId,
        data,
        horaInicio,
        'Adicionada manualmente'
    );

    return result.lastInsertRowId;
}


export async function buscarApresentacoesDaOcorrencia(occurrenceId) {
    const db = await getDatabase();

    // LEFT JOIN é o segredo aqui: se segment_id for NULL,
    // segment_name também vem NULL, sem quebrar a query.
    return db.getAllAsync(
        `
        SELECT
            p.*,
            s.id   AS segment_id_real,
            s.name AS segment_name,
            s.position AS segment_position
        FROM presentations p
        LEFT JOIN segments s
            ON s.id = p.segment_id
        WHERE p.occurrence_id = ?
        ORDER BY
            s.position ASC,
            p.position ASC
        `,
        [occurrenceId]
    );
}

export async function atualizarOrdemApresentacoes(apresentacoesOrdenadas) {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
        for (let i = 0; i < apresentacoesOrdenadas.length; i++) {
            const item = apresentacoesOrdenadas[i];
            await db.runAsync(
                `UPDATE presentations SET position = ? WHERE id = ?`,
                [i, item.id]
            );
        }
    });
}