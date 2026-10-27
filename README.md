# Cadastro ClasseTech

App Android de cadastro de pessoa física e jurídica para imobiliária: locadores, locatários e fiadores. Tudo fica no aparelho, sem servidor. Os cadastros vão para um SQLite local e os documentos são copiados para a pasta privada do app.

Teste técnico.

## Stack

| Para que               | O que                                                          |
| ---------------------- | -------------------------------------------------------------- |
| App                    | Expo SDK 58, React Native 0.88, React 19.3, TypeScript estrito |
| Navegação              | Expo Router (rotas por arquivo em `src/app`)                   |
| Formulário             | react-hook-form + zod, pelo `@hookform/resolvers`              |
| Banco                  | expo-sqlite                                                    |
| Rascunho do formulário | react-native-mmkv                                              |
| Consultas externas     | TanStack Query, ViaCEP e BrasilAPI                             |
| Arquivos               | expo-image-picker, expo-document-picker, expo-file-system      |
| Estilo                 | NativeWind (Tailwind), fonte Montserrat                        |
| Teclado                | react-native-keyboard-controller                               |
| Qualidade              | ESLint, Prettier, Jest                                         |

## Rodar

```bash
npm install
npx expo run:android
```

`npx expo start` sozinho não serve: o app usa módulos nativos (MMKV, SQLite, câmera) e precisa de development build. As pastas `android/` e `ios/` são geradas e não estão no repositório; configuração nativa fica no `app.json`.

## Instalar o APK

Gerar na máquina:

```bash
cd android && ./gradlew assembleRelease
```

Sai em `android/app/build/outputs/apk/release/app-release.apk`, assinada com chave de debug. No celular, libere a instalação de fontes desconhecidas para o app que abrir o arquivo.

O `eas.json` tem os perfis `development` e `preview` para quem preferir construir na nuvem.

## O que o app faz

- Lista com busca por nome, razão social, CPF ou CNPJ, filtro por tipo e filtro de documentação pendente
- Cadastro em etapas: tipo, dados principais, contato e endereço, representante legal (só PJ) e revisão
- Rascunho salvo a cada tecla; ao abrir um cadastro novo o app oferece retomar
- Ficha com os dados completos, edição e exclusão
- Checklist de documentos por tipo, anexando por câmera, galeria ou PDF

## Decisões técnicas

**SQLite e não AsyncStorage.** Os dados são relacionais: pessoa tem representante legal e vários documentos. Com SQLite a unicidade de CPF e CNPJ é restrição do banco, a exclusão em cascata apaga representante e documentos sem código extra, e busca com filtro é query em vez de `filter` em memória. Três tabelas: `people`, `representatives` e `documents`.

**Arquivo no disco, caminho no banco.** Documento anexado é copiado para `Paths.document/documents/<id>` e o banco guarda só o caminho. Limite de 10 MB por arquivo. Excluir o cadastro apaga os arquivos junto.

**react-hook-form com zod.** Um schema por tipo de cadastro e um resolver que escolhe o schema conforme PF ou PJ. O erro aparece em vermelho embaixo do campo, na saída do campo (`mode: 'onTouched'`) e a cada tecla depois da primeira tentativa de envio. CPF e CNPJ são conferidos pelo dígito verificador, não só pelo tamanho, e o CNPJ aceita o formato alfanumérico novo. Máscara na digitação de CPF, CNPJ, CEP, telefone e datas; o banco guarda só os dígitos.

**Rascunho em MMKV.** O formulário é longo e cadastro de locatário acontece em pé, na vistoria, com interrupção. MMKV é síncrono, então ler na abertura não pisca e escrever a cada tecla não trava a digitação.

**Wizard e não formulário único.** São mais de 20 campos. Em etapas o erro aparece perto de onde foi digitado e a validação é por etapa. A edição usa tela única, porque ali o usuário já sabe o que quer mudar.

**Consulta de CNPJ não preenche endereço.** A BrasilAPI devolve o endereço da empresa, mas empresa costuma estar registrada no endereço do dono, e ver a etapa de contato preenchida sozinha parece sobra do cadastro anterior. A consulta traz razão social, nome fantasia e data de abertura; o endereço entra pelo CEP, igual nos dois tipos.

**Teclado com `react-native-keyboard-controller`.** O `KeyboardAvoidingView` do React Native não faz nada no Android em edge-to-edge, que é o padrão do SDK 58. O `KeyboardAwareScrollView` rola até o campo com foco e reserva embaixo a altura do teclado, então dá para rolar o que fica atrás dele.

## Estrutura

```
src/
  app/                  rotas do Expo Router
  components/ui/        botão, campo, select, toast, diálogo, badge
  components/form/      ligação dos campos com o react-hook-form
  features/people/      schema, repositório, rascunho, etapas do wizard
  features/documents/   tipos exigidos, repositório, arquivos no disco
  lib/                  banco, validadores, máscaras, clientes de CEP e CNPJ
```

## Comandos

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest
npm run format      # prettier --write
```

## Fora do escopo entregue

Biometria na abertura e exportação da ficha em PDF estavam no plano e ficaram de fora por prazo. O app é só Android: não houve máquina macOS para gerar e testar iOS. A tela fica travada em retrato e não há sincronização com servidor.
