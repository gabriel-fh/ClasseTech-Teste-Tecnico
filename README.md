# Cadastro ClasseTech

App Android de cadastro de pessoa física e jurídica para o contexto de imobiliária: locadores, locatários e fiadores. Tudo fica no aparelho. Os cadastros vão para um SQLite local e os documentos são copiados para a pasta privada do app; o banco guarda só o caminho do arquivo.

Teste técnico. Expo SDK 58, React Native 0.88, React 19.3, TypeScript estrito, Expo Router.

## Instalar o APK

1. Baixe `app-release.apk` no celular.
2. Abra o arquivo. O Android vai pedir para liberar a instalação de fontes desconhecidas para o app que abriu o arquivo (WhatsApp, navegador ou gerenciador de arquivos). Libere e volte.
3. Confirme a instalação.

A APK é assinada com chave de debug, não com chave de publicação. Serve para testar, não para subir na Play Store.

Permissões: câmera (pedida na primeira foto) e internet (busca de CEP e CNPJ). A galeria usa o seletor de fotos do sistema, que não exige permissão de armazenamento.

## Rodar do código

```bash
npm install
npx expo run:android
```

`npx expo start` sozinho não serve: o app usa `react-native-mmkv`, que tem código nativo e não roda no Expo Go. Precisa de development build.

As pastas `android/` e `ios/` são geradas (Continuous Native Generation). Elas não estão no repositório; `expo run:android` gera a primeira vez. Configuração nativa fica em `app.json`.

## O que o app faz

**Lista.** Busca por nome, razão social, CPF ou CNPJ, filtro por tipo e filtro de documentação pendente. Cada cartão mostra nome, documento mascarado, cidade e o status da documentação.

**Cadastro em etapas.** Tipo, dados principais, contato e endereço, representante legal (só PJ) e revisão. Cada etapa valida os próprios campos antes de liberar o Continuar. A revisão mostra tudo antes de gravar.

**Rascunho.** O que foi digitado é salvo a cada tecla no MMKV. Fechar o app ou sair da tela no meio do cadastro não perde nada: ao abrir um cadastro novo o app oferece retomar. Sair da tela com conteúdo preenchido pede confirmação, pela seta do header e pelo botão físico do Android.

**Preenchimento automático.** CEP pelo ViaCEP e CNPJ pela BrasilAPI, com timeout de 8 segundos. Sem internet ou com documento não encontrado o app avisa na própria tela e deixa preencher à mão.

**Documentos.** Checklist do que cada tipo exige, com badge de enviado ou faltando por item e status geral no topo. Anexar abre câmera, galeria ou PDF. Limite de 10 MB por arquivo. Abrir usa o preview nativo do sistema. Remover apaga o arquivo do disco junto com o registro.

**Ficha, edição e exclusão.** A ficha mostra os dados completos com CPF e CNPJ parcialmente ocultos. Editar reaproveita os mesmos componentes do cadastro em uma tela única. Excluir pede confirmação e apaga os arquivos e a pasta do cadastro.

## Validação

A validação é um schema Zod por tipo de cadastro (`src/features/people/schema.ts`), ligado ao react-hook-form por um resolver que escolhe o schema conforme o tipo escolhido na primeira etapa. O erro aparece em vermelho embaixo do input, com a borda do campo em vermelho, e substitui a dica do campo enquanto existir.

- **Obrigatório.** Campo vazio ou só com espaços é barrado. Sem campo obrigatório preenchido não se passa de etapa.
- **Quando o erro aparece.** Na saída do campo (`onTouched`) e, depois da primeira tentativa de envio, a cada tecla. Tentar avançar de etapa valida todos os campos dela de uma vez e leva o foco para o primeiro inválido.
- **Dígito verificador.** CPF e CNPJ são conferidos de verdade, não só pelo tamanho. O CNPJ aceita o formato alfanumérico que entra em vigor em 2026. Sequência repetida (`111.111.111-11`) é rejeitada.
- **Duplicado.** CPF e CNPJ são únicos no banco. Salvar um documento que já existe mostra o erro no próprio campo e volta para a etapa dos dados.
- **Máscara na digitação.** CPF, CNPJ, CEP, telefone (fixo e celular) e datas são mascarados enquanto se digita, com `maxLength` no tamanho da máscara. O banco guarda só os dígitos; a máscara volta na leitura.
- **Sem máscara, de propósito.** RG e inscrição estadual mudam de formato conforme o estado, e ISENTO é valor válido para inscrição estadual. Máscara ali rejeitaria dado legítimo, então os dois são texto livre, com o limite de tamanho e a dica explicando o formato.
- **Data.** Rejeita data que não existe (`31/02`), exige maior de 18 anos no nascimento, rejeita ano implausível e não aceita data de abertura no futuro.
- **E-mail, telefone, CEP e UF.** E-mail por formato, telefone com 10 ou 11 dígitos, CEP com 8, UF conferida contra a lista das 27.
- **Tamanho.** Cada campo tem limite (`FIELD_LIMITS`). O `maxLength` do input corta na digitação e o schema barra o que chega colado ou de um rascunho antigo, usando a mesma tabela.
- **Envio inválido.** Se sobrar erro ao salvar, o app mostra um toast e volta para a etapa que tem o campo errado. Botão que não faz nada é pior que erro na tela.

`npx jest` cobre validadores, máscaras, schema, rascunho, repositório e checklist de documentos: 7 arquivos, 80 casos.

## Decisões

**SQLite e não AsyncStorage.** Os dados são relacionais: pessoa tem representante legal e vários documentos. Com SQLite a unicidade de CPF e CNPJ é restrição do banco, a exclusão em cascata apaga representante e documentos sem código extra, e a busca com filtro é uma query em vez de um `filter` em memória.

**Arquivo no disco, caminho no banco.** Documento anexado é copiado para `Paths.document/documents/<id do cadastro>` e o banco guarda o caminho. Guardar o conteúdo em blob inflaria o banco e deixaria a lista lenta por nada.

**Rascunho em MMKV.** O formulário é longo e cadastro de locatário acontece em pé, na vistoria, com interrupção. MMKV é síncrono, então ler na abertura da tela não pisca e escrever a cada tecla não trava a digitação.

**Wizard e não formulário único.** São mais de 20 campos. Em etapas o erro aparece perto de onde foi digitado, a validação é por etapa e o progresso fica visível. A edição usa tela única, porque ali o usuário já sabe o que quer mudar e quer chegar direto no campo.

**NativeWind.** Estilo junto do componente, com os tokens de cor e tipografia no `tailwind.config.js`. Fonte Montserrat.

**Fora do escopo entregue.** Biometria na abertura e exportação da ficha em PDF estavam no plano e ficaram de fora por prazo. Com elas saíram os módulos nativos sem uso (`expo-local-authentication`, `expo-print`, `expo-sharing`) e as permissões de biometria, para o app não pedir acesso que não usa.

## Campos e o motivo

O cadastro representa quem assina contrato de locação, então o critério foi: só entra campo que aparece em contrato, em ficha de análise de crédito ou na cobrança.

**Pessoa física.** Nome completo, CPF, RG com órgão emissor, data de nascimento, estado civil, profissão e nacionalidade. RG e órgão emissor porque a qualificação das partes no contrato pede os dois. Estado civil porque muda quem precisa assinar: cônjuge de locador casado costuma ser anuente, e união estável aparece na lista por isso. Profissão porque entra na análise de renda. Maior de 18 porque menor não assina contrato de locação sozinho.

**Pessoa jurídica.** Razão social, nome fantasia, CNPJ, inscrição estadual, data de abertura e representante legal com nome, CPF, cargo, e-mail e telefone. Razão social é o nome do contrato e nome fantasia é como a imobiliária reconhece o cliente, então os dois ficam. Inscrição estadual é opcional porque empresa de serviço não tem. O representante legal é obrigatório: sem saber quem assina pela empresa o contrato não fecha.

**Contato e endereço.** E-mail e telefone, mais CEP, logradouro, número, complemento, bairro, cidade e UF. Endereço completo e separado porque é o que vai no contrato e o que a cobrança usa. O número aceita S/N.

**Documentos exigidos.** PF: identidade, comprovante de residência e comprovante de renda. PJ: contrato social, cartão CNPJ, comprovante de endereço da empresa e identidade do representante. É o conjunto que uma imobiliária pede para análise, e o status da documentação na lista existe para achar rápido o cadastro que está parado esperando papel.

## Limites conhecidos

- Só Android. Não houve máquina macOS para gerar e testar iOS, e entregar iOS sem rodar em aparelho seria entregar no escuro.
- Tela travada em retrato.
- Sem sincronização: dois aparelhos não compartilham cadastro.
- Documentos ficam na pasta privada do app, sem criptografia em repouso.
- `android/` é gerado. Regerar com `expo prebuild --clean` descarta ajuste feito à mão nessa pasta.

## Com mais tempo

- Sincronização com API, com fila de envio e resolução de conflito, para o cadastro feito na rua subir sozinho quando a conexão voltar.
- Criptografia dos documentos em repouso e biometria na abertura. São RG, comprovante de renda e contrato social no aparelho de quem faz vistoria na rua.
- Teste E2E do fluxo de cadastro em aparelho, com Maestro.
- Versão iOS.
- Exportação da ficha em PDF para anexar no processo de análise.

## Estrutura

```
src/
  app/                      rotas do Expo Router
    index.tsx               lista com busca e filtros
    person/new.tsx          cadastro em etapas
    person/[id].tsx         ficha
    person/edit/[id].tsx    edição
    person/documents/[id].tsx  checklist de documentos
  components/ui/            botão, campo, select, toast, diálogo, badge
  components/form/          ligação dos campos com o react-hook-form
  features/people/          schema, repositório, rascunho, etapas do wizard
  features/documents/       tipos exigidos, repositório, arquivos no disco
  lib/                      banco, validadores, máscaras, clientes de CEP e CNPJ
```

## Comandos

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest
npm run format      # prettier --write
```

APK de release:

```bash
cd android && ./gradlew assembleRelease
```

Sai em `android/app/build/outputs/apk/release/app-release.apk`.
