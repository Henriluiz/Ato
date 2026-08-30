import { getDatabase } from '../database';
import {
  listEligiblePeople,
  addPresentationMember,
  removePresentationMember,
  countPresentationMembers,
  canPersonBeAssigned,
  recordAssignment,
  recordRemoval,
} from '../database/repositories/assignmentRepository';

/**
 * Retorna candidatos para uma apresentação.
 * Aplica:
 * - função exigida;
 * - pessoa ativa;
 * - ausência na data;
 * - limite de integrantes;
 * - pessoa já adicionada.
 */
export async function getAvailableMembers({
  userId,
  presentationId,
}) {
  const db = await getDatabase();

  const presentation = await db.getFirstAsync(
    `
      SELECT
        p.*,
        eo.occurrence_date,
        eo.event_id
      FROM presentations p
      INNER JOIN event_occurrences eo
        ON eo.id = p.occurrence_id
      WHERE p.id = ?
    `,
    presentationId
  );

  if (!presentation) {
    throw new Error('Apresentação não encontrada.');
  }

  if (!presentation.presentation_type_id) {
    return [];
  }

  return listEligiblePeople({
    userId,
    presentationTypeId: presentation.presentation_type_id,
    occurrenceDate: presentation.occurrence_date,
    presentationId,
  });
}

/**
 * Adiciona uma pessoa à apresentação depois de validar
 * as regras de elegibilidade.
 */
export async function assignPersonToPresentation({
  userId,
  presentationId,
  personId,
  roleId = null,
}) {
  const db = await getDatabase();

  const presentation = await db.getFirstAsync(
    `
      SELECT
        p.*,
        pt.max_members,
        eo.occurrence_date
      FROM presentations p
      LEFT JOIN presentation_types pt
        ON pt.id = p.presentation_type_id
      INNER JOIN event_occurrences eo
        ON eo.id = p.occurrence_id
      WHERE p.id = ?
    `,
    presentationId
  );

  if (!presentation) {
    throw new Error('Apresentação não encontrada.');
  }

  const person = await db.getFirstAsync(
    `
      SELECT *
      FROM people
      WHERE id = ?
        AND user_id = ?
    `,
    personId,
    userId
  );

  if (!person) {
    throw new Error('Pessoa não encontrada para este usuário.');
  }

  if (presentation.max_members) {
    const count = await countPresentationMembers(presentationId);

    if (count >= presentation.max_members) {
      throw new Error(
        `Esta apresentação permite no máximo ${presentation.max_members} integrante(s).`
      );
    }
  }

  const allowed = await canPersonBeAssigned({
    personId,
    presentationId,
    roleId,
    occurrenceDate: presentation.occurrence_date,
  });

  if (!allowed) {
    throw new Error(
      'Esta pessoa não pode ser adicionada a esta apresentação.'
    );
  }

  await addPresentationMember({
    presentationId,
    personId,
    roleId,
  });

  await recordAssignment({
    personId,
    presentationId,
    roleId,
  });

  return true;
}

export async function unassignPersonFromPresentation({
  presentationId,
  personId,
  roleId = null,
}) {
  await removePresentationMember(presentationId, personId);

  await recordRemoval({
    personId,
    presentationId,
    roleId,
  });

  return true;
}
