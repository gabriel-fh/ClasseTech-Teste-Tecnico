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
- [x] `npx expo prebuild --platform android` rodado, `expo-doctor` com 20 de 20 checagens limpas e `expo export --platform android` gerando o bundle sem erro

## Pendente

- [ ] Fase 3: wizard de cadastro (schemas zod, máscaras nos campos, CEP, CNPJ, duplicidade, rascunho no MMKV, revisão)
- [ ] Fase 4: lista com busca, filtros e estados
- [ ] Fase 5: detalhe, edição e exclusão
- [ ] Instalar `react-hook-form`, `@hookform/resolvers` e `@tanstack/react-query` quando a fase 3 começar
- [ ] Instalar `expo-image-picker`, `expo-document-picker` e `expo-file-system` na fase 6; `expo-local-authentication` na 7; `expo-print` e `expo-sharing` na 8. Cada um desses exige um novo build nativo
- [ ] Primeiro build local de debug do Android: bloqueado pelo limite de caminho do Windows, aguardando decisão
- [ ] A tela inicial ainda é a do template

## Problemas e decisões

- Sem EAS. O build é local: `npx expo prebuild --platform android` e `./gradlew assembleDebug` dentro de `android/`, com `JAVA_HOME` apontando para o JBR do Android Studio (`C:\Program Files\Android\Android Studio\jbr`), porque o JDK 23 do sistema é novo demais para o Gradle do RN 0.88
- `react-native-mmkv` 4 mudou a API: é `createMMKV({ id })` e `remove(key)`, não mais `new MMKV()` e `delete(key)`. A instância é criada em lazy load para não chamar o módulo nativo na importação
- Schema e código inteiros em inglês. O domínio em inglês, as mensagens e rótulos de tela em português
- Os repositórios não têm teste de integração: `expo-sqlite` não roda no Jest, só no device. O que é testável está isolado em funções puras (`buildSummaryQuery`, `calculateDocumentationStatus`, validadores, máscaras). A primeira execução no celular é o que valida o SQL
- Filtro de documentação pendente é aplicado em memória, depois da consulta. Busca e tipo vão no SQL
- Busca por nome usa `LIKE`, que no SQLite não ignora acento. Procurar "Jose" não acha "José"
- `expo-crypto` entrou para gerar o uuid dos registros
- O `assembleDebug` falhou compilando o C++ do `react-native-nitro-modules`, que o `react-native-mmkv` 4 exige: `ninja: error: mkdir(CMakeFiles/NitroModules.dir/C_/Users/Gabriel/...): No such file or directory`. O ninja repete o caminho de origem inteiro dentro de `CMakeFiles`, e com o projeto em `C:\Users\Gabriel\Documents\testes\ClasseTech-Teste-Tecnico` (57 caracteres) isso passa dos 260 do MAX_PATH. `LongPathsEnabled` está em 0 nesta máquina
- A junção `C:\ct` (`mklink /J`) não resolveu e foi removida: o CMake resolve o link para o caminho real e grava ele inteiro dentro de `CMakeFiles`. Com ela o nitro-modules passou, mas o `react-native-worklets` quebrou no mesmo erro, agora em `CMakeFiles/worklets.dir/C_/Users/Gabriel/.../react-native-worklets/Common/cpp`. O arquivo mais fundo dá 275 caracteres, 15 acima do limite
- Três saídas, nenhuma escolhida ainda:
  1. Mover o repositório para um caminho curto, por exemplo `C:\dev\classetech`. Economiza cerca de 100 caracteres, não precisa de admin nem de reinício. É a mais garantida
  2. Habilitar `LongPathsEnabled` no registro (admin e reinício). Menos garantido: o ninja e o Gradle ainda podem não respeitar a flag
  3. Remover `react-native-reanimated` e `react-native-worklets`, que vieram do template e o app não usa. Mais rápido, mas outro módulo C++ pode cair no mesmo problema depois

## Para o Gabriel testar no celular

- Nada ainda: o APK não saiu. O teste no celular depende de resolver o limite de caminho primeiro

## Próximo passo exato

Fase 3, começando pelo schema zod da pessoa física em `src/features/people/schema.ts`, usando os validadores que já existem em `src/lib/validators.ts`. Depois o wizard em `src/app/`, uma etapa por commit.
