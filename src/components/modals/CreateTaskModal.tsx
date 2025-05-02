import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useCreateTaskModalStyles } from './CreateTaskModalStyles';
import { Task } from '../../data/models/Task';
import { saveTask } from '../../storage/taskStorage';
import { generateUniqueId } from '../../utils/idGenerator';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// --- Funções Auxiliares de Validação ---

// Regex para detectar a maioria dos emojis comuns
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

const containsEmoji = (text: string): boolean => {
    return emojiRegex.test(text);
};

// Função para formatar a data (DD/MM/AAAA)
const formatDate = (date: Date | null): string => {
    if(!date) {return '';}
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

interface CreateTaskModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: () => void;
}

const CreateTaskModal = ({ isVisible, onClose, onSave }: CreateTaskModalProps) => {
    const styles = useCreateTaskModalStyles();
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [dueDateError, setDueDateError] = useState('');

    // Função chamada quando a data é alterada no DatePick
    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || dueDate;  // Mantém a data atual se o usuário cancelar (Android)
        setShowDatePicker(Platform.OS === 'ios'); // No iOS, o picker é um modal, mantemos visível até confirmação
        if (event.type === 'set' && currentDate) { // Verifica se o usuário confirmou a data
             setDueDate(currentDate);
             if (dueDateError) {setDueDateError('');} // Limpa o erro ao selecionar uma data
        } else if (event.type === 'dismissed') {
             // Usuário cancelou (Android)
             setShowDatePicker(false);
        }
        // No iOS, o usuário precisa fechar o modal manualmente (não há evento 'dismissed' explícito como no Android)
        // Se precisar de um botão "Confirmar" no iOS, a lógica seria um pouco diferente.
        // Para simplificar, vamos assumir que a seleção direta fecha no iOS também por enquanto.
        if (Platform.OS === 'ios' && event.type === 'set') {
            setShowDatePicker(false); // Esconde o picker após selecionar no iOS
        }
    };

    const handleSave = () => {
        let isValid = true;
        setTitleError('');
        setDescriptionError('');
        setDueDateError('');

        // Validação do Título
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setTitleError('O título é obrigatório.');
            isValid = false;
        } else if (trimmedTitle.length > 100) {
            setTitleError('O título deve ter no máximo 100 caracteres.');
            isValid = false;
        } else if (containsEmoji(trimmedTitle)) {
            setTitleError('O título não pode conter emojis.');
            isValid = false;
        }

        // Validação da Descrição
        const trimmedDescription = description.trim();
        if (!trimmedDescription) {
            setDescriptionError('A descrição é obrigatória.');
            isValid = false;
        } else if (trimmedDescription.length > 500) {
            setDescriptionError('A descrição deve ter no máximo 500 caracteres.');
            isValid = false;
        } else if (containsEmoji(trimmedDescription)) {
            setDescriptionError('A descrição não pode conter emojis.');
            isValid = false;
        }

        // Validação do Prazo
        if (!dueDate) {
            setDueDateError('O prazo é obrigatório.');
            isValid = false;
        }

        // Se não for válido, não salva
        if (!isValid) {
            return;
        }

        // Salva a data formatada como string DD/MM/AAAA
        const formattedDueDate = formatDate(dueDate);

        const newTask: Task = {
            id: generateUniqueId(),
            title: trimmedTitle,
            description: trimmedDescription,
            dueDate: formattedDueDate,
            priority: 'MÉDIA',
            tags: [],
            subtasks: [],
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            needsSync: true,
            isDeleted: false,
        };

        const success = saveTask(newTask);
        if (success) {
            console.log('Nova tarefa salva:', newTask);
            resetForm();
            onSave();
        } else {
            console.error('Erro ao salvar a nova tarefa.');
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate(null);
        setShowDatePicker(false);
        setTitleError('');
        setDescriptionError('');
        setDueDateError('');
    };

    // Limpa o formulário ao fechar o modal
    React.useEffect(() => {
        if (!isVisible) {
            resetForm();
        }
    }, [isVisible]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={handleCancel} // Permite fechar com botão de voltar no Android
            onDismiss={handleCancel} // Fecha o modal ao clicar fora dele (iOS)
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Criar Tarefa</Text>

                            {/* Campo Título */}
                            <Text style={styles.label}>Título</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Comprar mantimentos"
                                value={title}
                                onChangeText={(text) => {
                                    setTitle(text);
                                    if (titleError) {setTitleError('');} // Limpa erro ao digitar
                                }}
                                placeholderTextColor={theme.colors.secondaryText}
                                maxLength={105} // Um pouco mais que 100 para não cortar abruptamente
                            />
                            {/* Exibe erro do título */}
                            <Text style={[styles.errorText, { opacity: Number(!!titleError) }]}>
                                {titleError || ' '} {/* Adiciona espaço para manter altura */}
                            </Text>

                            {/* Campo Descrição */}
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Ex: Leite, pão, ovos..."
                                value={description}
                                onChangeText={(text) => {
                                    setDescription(text);
                                    if (descriptionError) {setDescriptionError('');} // Limpa erro
                                }}
                                multiline={true}
                                numberOfLines={4}
                                placeholderTextColor={theme.colors.secondaryText}
                                maxLength={505} // Um pouco mais que 500
                            />
                            {/* Exibe erro da descrição */}
                            <Text style={[styles.errorText, { opacity: Number(!!descriptionError) }]}>
                                {descriptionError || ' '} {/* Adiciona espaço */}
                            </Text>

                            {/* Campo Prazo */}
                            <Text style={styles.label}>Prazo</Text>
                            <TouchableOpacity
                                style={[styles.input, styles.dateInputButton]}
                                onPress={() => setShowDatePicker(true)} // Abre o DatePicker
                                activeOpacity={0.7}
                            >
                                <Text style={styles.dateInputText}>
                                    {dueDate ? formatDate(dueDate) : 'Selecione a data'}
                                </Text>
                            </TouchableOpacity>
                            {/* Exibe erro do prazo */}
                            <Text style={[styles.errorText, { opacity: Number(!!dueDateError) }]}>
                                {dueDateError || ' '}
                            </Text>

                            {/* Renderiza o DatePicker condicionalmente */}
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={dueDate || new Date()} // Usa a data selecionada ou a data atual
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'} // 'spinner' no iOS, 'default' (calendário/spinner nativo) no Android
                                    onChange={onChangeDate}
                                    minimumDate={new Date()} // Opcional: não permite selecionar datas passadas
                                    // locale="pt-BR" // Opcional: Tenta usar localização pt-BR se suportado
                                />
                            )}

                            {/* Botões */}
                            <View style={styles.buttonContainer}>
                                <Pressable style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                                    <Text style={[styles.buttonText, styles.cancelButtonText]}>CANCELAR</Text>
                                </Pressable>
                                <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
                                    <Text style={[styles.buttonText, styles.saveButtonText]}>CRIAR</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CreateTaskModal;
