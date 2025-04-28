# Guia de Commits com Git

## Importância do Uso Apropriado de Commits

O uso correto do `git commit` é essencial para o desenvolvimento de software, seja em projetos pessoais, de código aberto ou empresariais. Manter uma linguagem coerente e padronizada nas mensagens de commit ajuda todos os envolvidos no projeto a entenderem as mudanças e os contextos afetados.

## Problemas com Commits Mal Comentados

Mensagens de commit pouco informativas podem dificultar o entendimento da natureza e do contexto das mudanças. A longo prazo, isso prejudica a manutenibilidade do software.

## Benefícios dos Commits Documentados

Commits bem documentados mostram quem alterou o que, quando, em qual contexto e qual tipo de alteração foi feita. Isso facilita o entendimento e a colaboração no projeto.

## Conventional Commits

O Conventional Commits é uma convenção para mensagens de commit que segue um conjunto de regras, ajudando a manter um histórico explícito e estruturado.

### Vantagens

*   Automatização da criação de CHANGELOGs
*   Facilitação da entrada de novos desenvolvedores
*   Geração de relatórios
*   Melhor compreensão do foco do projeto (refatoração, novas features, etc.)

### Estrutura

```
<type>(<scope>): <subject>
```

*   **type**: Tipo de commit (obrigatório)
*   **scope**: Contexto do commit (opcional)
*   **subject**: Mensagem do commit (obrigatório)

### Tipos de Commit

*   `test`: Criação ou alteração de códigos de teste
*   `feat`: Desenvolvimento de uma nova feature
*   `refactor`: Refatoração de código sem alterar a lógica de negócio
*   `style`: Mudanças de formatação e estilo do código
*   `fix`: Correção de erros que geram bugs
*   `chore`: Mudanças no projeto que não afetam o sistema ou arquivos de testes
*   `docs`: Mudanças na documentação do projeto
*   `build`: Mudanças que afetam o processo de build ou dependências externas
*   `perf`: Alteração que melhora a performance do sistema
*   `ci`: Mudanças nos arquivos de configuração de CI
*   `revert`: Reversão de um commit anterior

### Exemplos de Commits

*   `feat`: Adição de uma nova funcionalidade
*   `fix`: Correção de um bug
*   `docs`: Atualização da documentação
*   `style`: Formatação de código
*   `refactor`: Refatoração de código
*   `test`: Adição de testes
*   `chore`: Atualização de ferramentas de build

### Observações

*   Apenas um tipo por commit
*   O tipo é obrigatório
*   Em caso de dúvida, separe em múltiplos commits

## Uso do Scope

O `scope` é utilizado para contextualizar o commit, especialmente útil em projetos grandes.

**Exemplo:**

```
feat(auth): adicionar autenticação por token
```

## Como Utilizamos na LinkApi

Na LinkApi, adaptamos o Conventional Commits para nossas necessidades. Por exemplo, usamos o tipo `business` para mudanças de regras de negócio e definimos o escopo do commit de acordo com a sprint.

## Ferramenta de Apoio: CommitLint

O CommitLint verifica se as mensagens de commit seguem o padrão e bloqueia commits que não seguem as convenções.

## Conclusão

Adotar o Conventional Commits melhora a colaboração, o gerenciamento de projetos e a integração com repositórios da comunidade. É uma prática que, apesar de demandar tempo inicialmente, traz grandes benefícios a longo prazo.