# Ato — camada SQLite

## Instalação

Na raiz do projeto Expo:

```bash
npx expo install expo-sqlite
```

## Arquivos

- `database/database.js` — conexão única com SQLite.
- `database/schema.js` — schema completo.
- `database/migrations.js` — versionamento do banco.
- `database/repositories/` — acesso aos dados.
- `services/eventGenerator.js` — geração de meses e ocorrências.
- `services/assignmentService.js` — regras de elegibilidade/designação.

## Uso

```js
import { getDatabase } from './src/database';

const db = await getDatabase();
```

Para gerar as ocorrências:

```js
import { generateEventOccurrences } from './src/services';

await generateEventOccurrences(eventId);
```

Para buscar pessoas elegíveis:

```js
import { getAvailableMembers } from './src/services';

const people = await getAvailableMembers({
  userId,
  presentationId,
});
```

Para adicionar uma pessoa:

```js
import { assignPersonToPresentation } from './src/services';

await assignPersonToPresentation({
  userId,
  presentationId,
  personId,
  roleId,
});
```

`resetDatabase()` existe somente para desenvolvimento/testes e apaga o banco local.
