# Taskly - Gerenciador de Tarefas Mobile

Taskly é um aplicativo mobile completo desenvolvido em React Native para ajudar você a organizar suas tarefas, definir prazos, prioridades e personalizar seu perfil. O app foi criado como parte de um desafio técnico, com foco em usabilidade, validação e funcionalidades robustas.

[🔗 Clique aqui para acessar o layout no Figma](#) <!-- Substitua pelo link real do Figma -->

---

## 📚 Sobre o Projeto

O objetivo do Taskly é proporcionar uma experiência eficiente e intuitiva para o gerenciamento do dia a dia, permitindo que o usuário crie, edite, conclua e organize tarefas e subtarefas, além de personalizar seu perfil e preferências.

---

## 🎯 Objetivo Geral

Construir um aplicativo de tarefas que permita:

- Login e cadastro de usuários
- Seleção de avatar
- Criação, edição e exclusão de tarefas
- Criação, edição e exclusão de subtarefas (checklist)
- Recebimento de notificações sobre eventos importantes
- Filtros de tarefas por prioridade
- Organização de tarefas por data de vencimento, tags e prioridade

---

## 🧩 Funcionalidades Obrigatórias

### 🔐 Autenticação

- Login
  - Opção "Lembrar de mim"
  - Validação de e-mail e senha
- Cadastro
  - Nome e sobrenome (nome composto obrigatório)
  - E-mail
  - Número de telefone
  - Senha e confirmação de senha
  - Seleção de avatar no primeiro acesso

### 📋 Tarefas

- Listagem de tarefas
- Criação de tarefas:
  - Título
  - Descrição
  - Prazo para conclusão (data)
- Edição de tarefas:
  - Título
  - Descrição
  - Tags (máximo 5, sem compostas)
  - Prioridade (alta, média ou baixa)
  - Prazo para conclusão
  - Subtarefas (adicionar/editar/deletar checklist)
- Concluir tarefa
- Filtro de tarefas por prioridade

### 👤 Perfil

- Visualizar informações do perfil
- Editar perfil:
  - Nome e sobrenome
  - Número de telefone
  - Avatar
- Menu:
  - Editar perfil
  - Preferências (tema claro/escuro)
  - Permissões (notificações, biometria)
  - Termos e regulamentos (webview)
  - Políticas de uso e privacidade (webview)
  - Sair da conta
  - Excluir conta

---

## ✍️ Validações Obrigatórias

### Login

- **E-mail:** Formato válido (regex)
- **Senha:** Mínimo 8 caracteres
- **Mensagens de erro:** "E-mail e/ou senha incorretos"

### Cadastro

- **Nome e Sobrenome:** Nome composto obrigatório (mínimo dois nomes), máximo de 120 caracteres
- **E-mail:** Formato válido
- **Número:** Formato (DDD) 9 dddd-dddd
- **Senha:** Mínimo 8 caracteres, máximo 20 caracteres, deve conter:
  - Um caractere especial
  - Uma letra minúscula
  - Uma letra maiúscula
- **Confirmação de senha:** As senhas devem ser iguais

### Criação/Edição de Tarefa

- **Título:** Apenas string, sem suporte para emojis, máximo de 100 caracteres
- **Descrição:** Sem suporte para emojis, máximo de 500 caracteres
- **Prazo:** Validação de data válida
- **Tags:** Não permitir tags compostas (sem espaços)
- **Subtarefas:** Descrição máxima de 200 caracteres

### Edição de Perfil

- **Nome e Sobrenome:** Nome composto obrigatório
- **Número:** Formato (DDD) 9 dddd-dddd

---

## 🛠️ Tecnologias Utilizadas

- React Native
- TypeScript
- Context API
- MMKV/AsyncStorage
- React Navigation
- FontAwesome Icons

---

## 🚀 Como Usar

1. Faça login ou crie uma nova conta.
2. Escolha seu avatar e personalize seu perfil.
3. Crie tarefas, defina prazos, prioridades e adicione tags.
4. Organize suas tarefas com filtros por prioridade, data e tags.
5. Edite ou exclua tarefas e subtarefas conforme necessário.
6. Acesse o menu para editar seu perfil, trocar o tema, visualizar políticas ou sair/excluir sua conta.

---

## 📄 Licença

Este projeto é apenas para fins de estudo e demonstração.

---

Desenvolvido com 💙 para o desafio de app de tarefas.
