# Hit-Fit

Prévia da interface para aprovação. Next.js + React + TypeScript. Visual preto/verde, safe areas com viewport-fit=cover e env(safe-area-inset-*).

## Funcional nesta versão
- Perfis locais Rangel e Jack, checklist por séries, progresso separado por perfil e semana.
- Ciclo: segunda perna completa; terça costas; quarta ombro; quinta glúteo; sexta peito.
- Timer com pausa, reinício e escolha de duração.
- Dados no localStorage deste navegador; não sincroniza aparelhos. Limpar os dados do navegador remove o progresso.

## Pendente de aprovação
- Comparar com o mockup original, indisponível nesta sessão.
- Confirmar ficha real: exercícios, séries e repetições atuais são demonstração.
- Integrar animações de execução e concluir instalação/offline do PWA.
- Validar em aparelhos físicos iPhone e Android.

## Rodar e publicar na Vercel
Node 22+, pnpm 10. Instale com `pnpm install --frozen-lockfile`.
Desenvolvimento Next.js: `pnpm exec next dev`.
Build Vercel: `pnpm exec next build`.
Importe o repositório na Vercel; vercel.json seleciona Next.js e o build apropriado. Nenhuma variável de ambiente é necessária para a prévia.

Os scripts padrão de preview usam o ambiente Sites; vercel.json os substitui para Vercel.

## Entrada personalizada
Na primeira abertura, escolha Sozinho ou Em casal e informe os nomes. O modo individual mostra um perfil; o casal mostra dois perfis com progresso independente. Edite os nomes ou o modo pelo botão no cabeçalho. Identificadores estáveis mantêm o progresso após renomear; mudar para individual conserva o segundo perfil para uma futura volta ao casal. Configuração salva localmente. Dados da prévia Rangel/Jack são preservados ao cadastrar esses nomes.
