export const DATABASE_SCHEMA = `
-- ============================================================
-- DESIGPARTS - DATABASE SCHEMA
-- ============================================================
--
-- Estrutura principal:
--
-- USER
--   ├── EVENTS
--   │    ├── Event Recurrence
--   │    ├── Event Months
--   │    ├── Event Occurrences
--   │    │     ├── Segments
--   │    │     │     └── Presentations
--   │    │     │            └── Presentation Members
--   │    │     └── ...
--   │    │
--   │    ├── People
--   │    │    ├── Tags
--   │    │    ├── Roles
--   │    │    └── Absences
--   │    │
--   │    └── ...
--   │
--   └── ...
--
-- MODELS / TEMPLATES
--   └── Segment Templates
--          └── Presentation Templates
--                 └── Required Roles
--
-- IMPORTANTE:
--
-- Templates são modelos reutilizáveis.
--
-- Quando um template é usado em um evento, seus dados são
-- COPIADOS para as tabelas reais do evento.
--
-- Depois da cópia, o evento pode ser alterado sem modificar
-- o template original.
--
-- Isso permite, por exemplo:
--
-- Template 1:
-- "Tesouros da Palavra de Deus"
--   ├── Joias Espirituais
--   └── Leitura da Bíblia
--
-- Template 2:
-- "Tesouros da Palavra de Deus"
--   ├── Joias Espirituais
--   ├── Leitura da Bíblia
--   └── Perguntas e Respostas
--
-- Os dois templates podem possuir o mesmo nome.
-- A estrutura interna é que os diferencia.
--
-- NÃO EXISTE MAIS O CONCEITO DE SUBCATEGORIA.
-- ============================================================


-- ============================================================
-- USERS
-- ============================================================
-- Usuário proprietário dos dados locais.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- EVENTS
-- ============================================================
-- Evento principal.
--
-- Pode ser:
--   weekly   = semanal
--   monthly  = mensal
--   one_time = único
--
-- Um mesmo usuário pode possuir vários eventos diferentes.
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    description TEXT,

    event_type TEXT NOT NULL
        CHECK (event_type IN ('weekly', 'monthly', 'one_time')),

    start_date TEXT NOT NULL,

    end_date TEXT,

    start_time TEXT,

    default_duration_minutes INTEGER
        CHECK (
            default_duration_minutes IS NULL
            OR default_duration_minutes > 0
        ),

    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',

    active INTEGER NOT NULL DEFAULT 1
        CHECK (active IN (0,1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CHECK (
        end_date IS NULL
        OR end_date >= start_date
    )
);

CREATE INDEX IF NOT EXISTS idx_events_user_active
ON events(user_id, active);


-- ============================================================
-- EVENT RECURRENCE
-- ============================================================
-- Configuração de repetição de um evento.
--
-- Para eventos semanais:
--   monday, tuesday, etc.
--
-- Para eventos mensais:
--   week_of_month pode indicar a semana do mês.
--
-- Exemplo:
--   terça-feira + week_of_month = 2
--   significa a segunda terça-feira do mês.
-- ============================================================

CREATE TABLE IF NOT EXISTS event_recurrence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    event_id INTEGER NOT NULL UNIQUE,

    frequency TEXT NOT NULL
        CHECK (frequency IN ('weekly', 'monthly')),

    monday INTEGER NOT NULL DEFAULT 0
        CHECK (monday IN (0,1)),

    tuesday INTEGER NOT NULL DEFAULT 0
        CHECK (tuesday IN (0,1)),

    wednesday INTEGER NOT NULL DEFAULT 0
        CHECK (wednesday IN (0,1)),

    thursday INTEGER NOT NULL DEFAULT 0
        CHECK (thursday IN (0,1)),

    friday INTEGER NOT NULL DEFAULT 0
        CHECK (friday IN (0,1)),

    saturday INTEGER NOT NULL DEFAULT 0
        CHECK (saturday IN (0,1)),

    sunday INTEGER NOT NULL DEFAULT 0
        CHECK (sunday IN (0,1)),

    week_of_month INTEGER
        CHECK (
            week_of_month IS NULL
            OR week_of_month BETWEEN 1 AND 5
        ),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    CHECK (
        monday
        + tuesday
        + wednesday
        + thursday
        + friday
        + saturday
        + sunday > 0
    )
);

-- ============================
-- Responsáveis por andamento do evento
CREATE TABLE IF NOT EXISTS occurrence_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    occurrence_id INTEGER NOT NULL,

    person_id INTEGER NOT NULL,

    role_id INTEGER NOT NULL,

    position INTEGER NOT NULL DEFAULT 0,

    notes TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (occurrence_id)
        REFERENCES event_occurrences(id)
        ON DELETE CASCADE,

    FOREIGN KEY (person_id)
        REFERENCES people(id)
        ON DELETE CASCADE,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    UNIQUE (
        occurrence_id,
        role_id
    )
);

CREATE INDEX IF NOT EXISTS idx_occurrence_assignments_occurrence
ON occurrence_assignments(occurrence_id);

CREATE INDEX IF NOT EXISTS idx_occurrence_assignments_person
ON occurrence_assignments(person_id);

CREATE INDEX IF NOT EXISTS idx_occurrence_assignments_role
ON occurrence_assignments(role_id);
-- =======


-- ============================================================
-- EVENT MONTHS
-- ============================================================
-- Representa cada mês que pertence ao período de um evento.
--
-- Os meses podem ser gerados automaticamente pelo serviço
-- eventGenerator.
-- ============================================================

CREATE TABLE IF NOT EXISTS event_months (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    event_id INTEGER NOT NULL,

    year INTEGER NOT NULL
        CHECK (year BETWEEN 1900 AND 2200),

    month INTEGER NOT NULL
        CHECK (month BETWEEN 1 AND 12),

    status TEXT NOT NULL DEFAULT 'planning'
        CHECK (
            status IN (
                'planning',
                'ready',
                'archived'
            )
        ),

    generated_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(event_id, year, month),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_months_event_date
ON event_months(event_id, year, month);


-- ============================================================
-- EVENT OCCURRENCES
-- ============================================================
-- Uma ocorrência é uma realização específica do evento.
--
-- Exemplo:
--
-- Evento:
--   Reunião semanal
--
-- Ocorrências:
--   04/08/2026
--   11/08/2026
--   18/08/2026
--   25/08/2026
-- ============================================================

CREATE TABLE IF NOT EXISTS event_occurrences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    event_id INTEGER NOT NULL,

    month_id INTEGER,

    occurrence_date TEXT NOT NULL,

    start_time TEXT NOT NULL,

    end_time TEXT,

    status TEXT NOT NULL DEFAULT 'planned'
        CHECK (
            status IN (
                'planned',
                'completed',
                'cancelled'
            )
        ),

    notes TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(event_id, occurrence_date),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    FOREIGN KEY (month_id)
        REFERENCES event_months(id)
        ON DELETE SET NULL,

    CHECK (length(occurrence_date) = 10),

    CHECK (length(start_time) = 5),

    CHECK (
        end_time IS NULL
        OR length(end_time) = 5
    )
);

CREATE INDEX IF NOT EXISTS idx_occurrences_event_date
ON event_occurrences(event_id, occurrence_date);

CREATE INDEX IF NOT EXISTS idx_occurrences_month
ON event_occurrences(month_id);


-- ============================================================
-- PEOPLE
-- ============================================================
-- Pessoas que podem participar das apresentações.
-- ============================================================

CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    active INTEGER NOT NULL DEFAULT 1
        CHECK (active IN (0,1)),

    notes TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_people_user_active
ON people(user_id, active);

CREATE INDEX IF NOT EXISTS idx_people_name
ON people(user_id, name);


-- ============================================================
-- TAGS
-- ============================================================
-- Tags usadas para classificar pessoas.
--
-- Exemplo:
--   Jovem
--   Ancião
--   Experiente
--   Leitor
--   etc.
-- ============================================================

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    description TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE(user_id, name COLLATE NOCASE)
);


-- ============================================================
-- PERSON TAGS
-- ============================================================
-- Relação N:N entre pessoas e tags.
-- ============================================================

CREATE TABLE IF NOT EXISTS person_tags (
    person_id INTEGER NOT NULL,

    tag_id INTEGER NOT NULL,

    PRIMARY KEY (
        person_id,
        tag_id
    ),

    FOREIGN KEY (person_id)
        REFERENCES people(id)
        ON DELETE CASCADE,

    FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_person_tags_tag
ON person_tags(tag_id);


-- ============================================================
-- ROLES
-- ============================================================
-- Funções que uma pessoa pode exercer.
--
-- Exemplo:
--   Leitor
--   Orador
--   Presidente
--   Participante
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    description TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE(user_id, name COLLATE NOCASE)
);


-- ============================================================
-- PERSON ROLES
-- ============================================================
-- Relação N:N entre pessoas e funções.
-- ============================================================

CREATE TABLE IF NOT EXISTS person_roles (
    person_id INTEGER NOT NULL,

    role_id INTEGER NOT NULL,

    PRIMARY KEY (
        person_id,
        role_id
    ),

    FOREIGN KEY (person_id)
        REFERENCES people(id)
        ON DELETE CASCADE,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_person_roles_role
ON person_roles(role_id);


-- ============================================================
-- ABSENCES
-- ============================================================
-- Períodos em que uma pessoa não pode ser selecionada.
--
-- Exemplo:
--   10/08/2026 até 20/08/2026
-- ============================================================

CREATE TABLE IF NOT EXISTS absences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    person_id INTEGER NOT NULL,

    start_date TEXT NOT NULL,

    end_date TEXT NOT NULL,

    reason TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (person_id)
        REFERENCES people(id)
        ON DELETE CASCADE,

    CHECK (length(start_date) = 10),

    CHECK (length(end_date) = 10),

    CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_absences_person_dates
ON absences(person_id, start_date, end_date);


-- ============================================================
-- SEGMENT TEMPLATES
-- ============================================================
-- MODELOS DE SEGMENTOS.
--
-- Um template é um modelo reutilizável que pode ser usado
-- para criar segmentos dentro de eventos.
--
-- IMPORTANTE:
--
-- O nome NÃO é UNIQUE.
--
-- Isso permite:
--
-- Template 1:
--   "Tesouros da Palavra de Deus"
--
-- Template 2:
--   "Tesouros da Palavra de Deus"
--
-- Mesmo nome, mas partes diferentes.
--
-- O template NÃO é o segmento real do evento.
-- Ele serve apenas como modelo/origem.
-- ============================================================

CREATE TABLE IF NOT EXISTS segment_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    description TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- PRESENTATION TEMPLATES
-- ============================================================
-- PARTES QUE PERTENCEM A UM MODELO DE SEGMENTO.
--
-- NÃO EXISTE MAIS SUBCATEGORIA.
--
-- Estrutura:
--
-- Segment Template
--       │
--       ├── Presentation Template
--       ├── Presentation Template
--       └── Presentation Template
--
-- Exemplo:
--
-- "Tesouros da Palavra de Deus"
--       │
--       ├── Joias Espirituais
--       ├── Leitura da Bíblia
--       └── Perguntas e Respostas
--
-- Cada parte possui sua própria duração, quantidade máxima
-- de integrantes e posição.
-- ============================================================

CREATE TABLE IF NOT EXISTS presentation_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    segment_template_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    description TEXT,

    default_duration_minutes INTEGER
        CHECK (
            default_duration_minutes IS NULL
            OR default_duration_minutes > 0
        ),

    max_members INTEGER
        CHECK (
            max_members IS NULL
            OR max_members > 0
        ),

    position INTEGER NOT NULL DEFAULT 0
        CHECK (position >= 0),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (segment_template_id)
        REFERENCES segment_templates(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_presentation_templates_segment
ON presentation_templates(
    segment_template_id,
    position
);


-- ============================================================
-- PRESENTATION TEMPLATE ROLES
-- ============================================================
-- Define quais funções são necessárias para cada parte de
-- um modelo.
--
-- Exemplo:
--
-- Leitura da Bíblia
--       ↓
-- Função necessária: Leitor
--
-- Joias Espirituais
--       ↓
-- Função necessária: Participante
--
-- required = 1
--   A função é obrigatória.
--
-- required = 0
--   A função é opcional.
-- ============================================================

CREATE TABLE IF NOT EXISTS presentation_template_roles (
    presentation_template_id INTEGER NOT NULL,

    role_id INTEGER NOT NULL,

    required INTEGER NOT NULL DEFAULT 1
        CHECK (required IN (0,1)),

    PRIMARY KEY (
        presentation_template_id,
        role_id
    ),

    FOREIGN KEY (presentation_template_id)
        REFERENCES presentation_templates(id)
        ON DELETE CASCADE,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_presentation_template_roles_role
ON presentation_template_roles(role_id);


-- ============================================================
-- SEGMENTS
-- ============================================================
-- SEGMENTOS REAIS DE UM EVENTO.
--
-- Um segmento pode ser:
--
-- 1. Criado a partir de um template
--    → template_id preenchido
--
-- 2. Criado manualmente
--    → template_id NULL
--
-- IMPORTANTE:
--
-- Não existe UNIQUE(event_id, name).
--
-- Portanto, o mesmo nome pode aparecer mais de uma vez
-- no mesmo evento.
--
-- Isso é proposital.
--
-- Exemplo:
--
-- Evento:
--   Reunião de 18/08
--
--   Tesouros da Palavra de Deus
--   Tesouros da Palavra de Deus
--
-- Cada um pode possuir partes diferentes.
-- ============================================================

CREATE TABLE IF NOT EXISTS segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    event_id INTEGER NOT NULL,

    -- Template que serviu como origem.
    -- NULL quando o segmento foi criado manualmente.
    template_id INTEGER,

    name TEXT NOT NULL,

    description TEXT,

    -- Ordem do segmento dentro da ocorrência/evento.
    position INTEGER NOT NULL DEFAULT 0
        CHECK (position >= 0),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    FOREIGN KEY (template_id)
        REFERENCES segment_templates(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_segments_event_position
ON segments(event_id, position);

CREATE INDEX IF NOT EXISTS idx_segments_template
ON segments(template_id);


-- ============================================================
-- PRESENTATION TYPES
-- ============================================================
-- Tipos configuráveis de apresentação dentro de um evento.
--
-- Isso é diferente de presentation_templates.
--
-- presentation_templates:
--   modelos usados para montar segmentos.
--
-- presentation_types:
--   tipos reutilizáveis/configuráveis dentro de um evento.
--
-- Exemplo:
--   Leitura
--   Discurso
--   Perguntas e respostas
-- ============================================================

CREATE TABLE IF NOT EXISTS presentation_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    event_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    description TEXT,

    default_duration_minutes INTEGER
        CHECK (
            default_duration_minutes IS NULL
            OR default_duration_minutes > 0
        ),

    max_members INTEGER
        CHECK (
            max_members IS NULL
            OR max_members > 0
        ),

    position INTEGER NOT NULL DEFAULT 0
        CHECK (position >= 0),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    UNIQUE(event_id, name COLLATE NOCASE)
);

CREATE INDEX IF NOT EXISTS idx_presentation_types_event_position
ON presentation_types(event_id, position);


-- ============================================================
-- PRESENTATION TYPE ROLES
-- ============================================================
-- Define quais funções podem/precisam ser usadas por um tipo
-- de apresentação configurado no evento.
-- ============================================================

CREATE TABLE IF NOT EXISTS presentation_type_roles (
    presentation_type_id INTEGER NOT NULL,

    role_id INTEGER NOT NULL,

    required INTEGER NOT NULL DEFAULT 1
        CHECK (required IN (0,1)),

    PRIMARY KEY (
        presentation_type_id,
        role_id
    ),

    FOREIGN KEY (presentation_type_id)
        REFERENCES presentation_types(id)
        ON DELETE CASCADE,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_presentation_type_roles_role
ON presentation_type_roles(role_id);


-- ============================================================
-- PRESENTATIONS
-- ============================================================
-- APRESENTAÇÕES REAIS DENTRO DE UMA OCORRÊNCIA.
--
-- Uma apresentação pode ter vindo de um modelo, através de
-- template_id.
--
-- IMPORTANTE:
--
-- Quando um modelo é aplicado, os dados são COPIADOS.
--
-- Depois da cópia:
--
--   title
--   start_time
--   duration_minutes
--   position
--   notes
--
-- podem ser modificados sem alterar o template original.
--
-- template_id serve apenas para registrar a origem.
--
-- NÃO EXISTE subcategory_id.
-- ============================================================

CREATE TABLE IF NOT EXISTS presentations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    occurrence_id INTEGER NOT NULL,

    segment_id INTEGER,

    -- Template de origem desta apresentação.
    -- NULL quando criada manualmente.
    template_id INTEGER,

    -- Tipo configurável da apresentação.
    presentation_type_id INTEGER,

    title TEXT NOT NULL,

    start_time TEXT NOT NULL,

    duration_minutes INTEGER NOT NULL
        CHECK (duration_minutes > 0),

    position INTEGER NOT NULL DEFAULT 0
        CHECK (position >= 0),

    notes TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (occurrence_id)
        REFERENCES event_occurrences(id)
        ON DELETE CASCADE,

    FOREIGN KEY (segment_id)
        REFERENCES segments(id)
        ON DELETE SET NULL,

    FOREIGN KEY (template_id)
        REFERENCES presentation_templates(id)
        ON DELETE SET NULL,

    FOREIGN KEY (presentation_type_id)
        REFERENCES presentation_types(id)
        ON DELETE SET NULL,

    CHECK (length(start_time) = 5)
);

CREATE INDEX IF NOT EXISTS idx_presentations_occurrence_position
ON presentations(occurrence_id, position);

CREATE INDEX IF NOT EXISTS idx_presentations_segment
ON presentations(segment_id);

CREATE INDEX IF NOT EXISTS idx_presentations_template
ON presentations(template_id);


-- ============================================================
-- PRESENTATION MEMBERS
-- ============================================================
-- Pessoas realmente designadas para uma apresentação.
--
-- Uma apresentação pode possuir uma ou mais pessoas.
--
-- role_id registra qual função a pessoa exerce naquela
-- apresentação específica.
-- ============================================================

CREATE TABLE IF NOT EXISTS presentation_members (
    presentation_id INTEGER NOT NULL,

    person_id INTEGER NOT NULL,

    role_id INTEGER,

    position INTEGER NOT NULL DEFAULT 0
        CHECK (position >= 0),

    PRIMARY KEY (
        presentation_id,
        person_id
    ),

    FOREIGN KEY (presentation_id)
        REFERENCES presentations(id)
        ON DELETE CASCADE,

    FOREIGN KEY (person_id)
        REFERENCES people(id)
        ON DELETE CASCADE,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_presentation_members_person
ON presentation_members(person_id);

CREATE INDEX IF NOT EXISTS idx_presentation_members_role
ON presentation_members(role_id);


-- ============================================================
-- ASSIGNMENT HISTORY
-- ============================================================
-- Histórico das designações.
--
-- Permite registrar:
--   assigned
--   removed
--   completed
--   cancelled
--
-- Útil futuramente para histórico de participação e controle
-- de frequência/rodízio.
-- ============================================================

CREATE TABLE IF NOT EXISTS assignment_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    person_id INTEGER NOT NULL,

    presentation_id INTEGER,

    role_id INTEGER,

    action TEXT NOT NULL
        CHECK (
            action IN (
                'assigned',
                'removed',
                'completed',
                'cancelled'
            )
        ),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (person_id)
        REFERENCES people(id)
        ON DELETE CASCADE,

    FOREIGN KEY (presentation_id)
        REFERENCES presentations(id)
        ON DELETE SET NULL,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_assignment_history_person_date
ON assignment_history(person_id, created_at);


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;


CREATE TRIGGER IF NOT EXISTS trg_events_updated_at
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
    UPDATE events
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;


CREATE TRIGGER IF NOT EXISTS trg_people_updated_at
AFTER UPDATE ON people
FOR EACH ROW
BEGIN
    UPDATE people
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;


CREATE TRIGGER IF NOT EXISTS trg_occurrences_updated_at
AFTER UPDATE ON event_occurrences
FOR EACH ROW
BEGIN
    UPDATE event_occurrences
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;


CREATE TRIGGER IF NOT EXISTS trg_presentations_updated_at
AFTER UPDATE ON presentations
FOR EACH ROW
BEGIN
    UPDATE presentations
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;


-- ============================================================
-- ASSIGNMENT HISTORY SUMMARY VIEW
-- ============================================================
-- Facilita consultar o histórico de pessoas e apresentações.
-- ============================================================

CREATE VIEW IF NOT EXISTS assignment_history_summary AS
SELECT
    ah.id,

    ah.person_id,

    p.name AS person_name,

    ah.presentation_id,

    pr.title AS presentation_title,

    pr.start_time,

    eo.occurrence_date,

    ah.role_id,

    r.name AS role_name,

    ah.action,

    ah.created_at

FROM assignment_history ah

JOIN people p
    ON p.id = ah.person_id

LEFT JOIN presentations pr
    ON pr.id = ah.presentation_id

LEFT JOIN event_occurrences eo
    ON eo.id = pr.occurrence_id

LEFT JOIN roles r
    ON r.id = ah.role_id;
`;