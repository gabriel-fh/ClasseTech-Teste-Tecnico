# Progresso

## Dia atual

Sábado 24/10

## Feito

- [x] Fase 1: dependências de base (expo-sqlite, react-native-mmkv + nitro-modules, zod, jest-expo), scripts `typecheck`, `lint` e `test` (b4b5c32)
- [x] Validadores de CPF e CNPJ com dígito verificador, incluindo o CNPJ alfanumérico da Receita, mais e-mail, telefone, CEP, UF, data e maioridade (131c25e)
- [x] Máscaras progressivas de CPF, CNPJ, telefone, CEP e data, mais as versões ocultadas para a lista (6ac8b2a)
- [x] Schema e migration do SQLite por `PRAGMA user_version` (b28499a)
- [x] Modelo de domínio de pessoa física, jurídica e representante legal (35216d4)
- [x] Nomes de código e schema traduzidos para inglês (2f1a4f9)
- [x] Repositório de pessoas: lista com busca e filtros, detalhe, criação, edição, exclusão e checagem de CPF/CNPJ duplicado (db8c59e, d753c85)
- [x] Repositório de documentos e cálculo do status da documentação (260159f)
- [x] Banco aberto pelo `SQLiteProvider` com `Suspense` e MMKV configurado (b669fdd)
- [x] Identidade nativa do app e scripts de build local (6bcaf63, 315c3e8)
- [x] 44 testes passando, `typecheck`, `lint` e `expo-doctor` limpos
- [x] `npx expo prebuild --platform android` rodando e `expo-doctor` com 20 de 20 checagens limpas

## Pendente

- [ ] Fase 3: wizard de cadastro (schemas zod, máscaras nos campos, CEP, CNPJ, duplicidade, rascunho no MMKV, revisão)
- [ ] Fase 4: lista com busca, filtros e estados
- [ ] Fase 5: detalhe, edição e exclusão
- [ ] Instalar `react-hook-form`, `@hookform/resolvers` e `@tanstack/react-query` quando a fase 3 começar
- [ ] Instalar `expo-image-picker`, `expo-document-picker` e `expo-file-system` na fase 6; `expo-local-authentication` na 7; `expo-print` e `expo-sharing` na 8. Cada um desses exige um novo build nativo
- [ ] Primeiro build local de debug do Android (`./gradlew assembleDebug`) ainda rodando
- [ ] A tela inicial ainda é a do template

## Problemas e decisões

- Sem EAS. O build é local: `npx expo prebuild --platform android` e `./gradlew assembleDebug` dentro de `android/`, com `JAVA_HOME` apontando para o JBR do Android Studio (`C:\Program Files\Android\Android Studio\jbr`), porque o JDK 23 do sistema é novo demais para o Gradle do RN 0.88
- `react-native-mmkv` 4 mudou a API: é `createMMKV({ id })` e `remove(key)`, não mais `new MMKV()` e `delete(key)`. A instância é criada em lazy load para não chamar o módulo nativo na importação
- Schema e código inteiros em inglês. O domínio em inglês, as mensagens e rótulos de tela em português
- Os repositórios não têm teste de integração: `expo-sqlite` não roda no Jest, só no device. O que é testável está isolado em funções puras (`buildSummaryQuery`, `calculateDocumentationStatus`, validadores, máscaras). A primeira execução no celular é o que valida o SQL
- Filtro de documentação pendente é aplicado em memória, depois da consulta. Busca e tipo vão no SQL
- Busca por nome usa `LIKE`, que no SQLite não ignora acento. Procurar "Jose" não acha "José"
- `expo-crypto` entrou para gerar o uuid dos registros

## Para o Gabriel testar no celular

- Instalar o APK de debug em `android/app/build/outputs/apk/debug/app-debug.apk`, rodar `npx expo start --dev-client` e conferir que o app abre sem travar na tela de carregamento. É isso que prova que o banco foi criado e a migration rodou
- Não tem tela ainda, então o teste é só esse: abrir sem erro

## Próximo passo exato

Fase 3, começando pelo schema zod da pessoa física em `src/features/people/schema.ts`, usando os validadores que já existem em `src/lib/validators.ts`. Depois o wizard em `src/app/`, uma etapa por commit.
