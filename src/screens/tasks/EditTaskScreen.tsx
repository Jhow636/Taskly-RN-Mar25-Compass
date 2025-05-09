import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Alert, TouchableOpacity, Pressable, Platform, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { MainStackParamList } from '../../navigation/types';
import { useEditTaskStyles } from './EditScreenStyles';
import { Task } from '../../data/models/Task';
import { useAuth } from '../../context/AuthContext';
import { getTaskById, saveTask } from '../../storage/taskStorage';
import Header from '../../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCircleArrowRight } from '@fortawesome/free-solid-svg-icons/faCircleArrowRight'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons/faCircleXmark'




type EditTaskScreenRouteProp = RouteProp<MainStackParamList, 'EditTask'>;
type EditTaskScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'EditTask'>;


const EditTaskScreen = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const route = useRoute<EditTaskScreenRouteProp>();
  const navigation = useNavigation<EditTaskScreenNavigationProp>();
  const { taskId } = route.params;
  const { userId } = useAuth();
  const styles = useEditTaskStyles();
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<'ALTA' | 'MÉDIA' | 'BAIXA'>('MÉDIA');
  const [dueDateError, setDueDateError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagsWidths, setTagsWidths] = useState<Record<string, number>>({});

  const handleTextLayout = (tag, event) => {
    const { width } = event.nativeEvent.layout;
    setTagsWidths(prev => ({ ...prev, [tag]: width})); 
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (userId) {
      const fetchedTask = getTaskById(taskId, userId);
      if (fetchedTask) {
        setTask(fetchedTask);
        setTitle(fetchedTask.title);
        setDescription(fetchedTask.description);
        setDueDate(new Date(fetchedTask.dueDate));
        console.log(dueDate)
        setPriority(fetchedTask.priority);
        setTags(fetchedTask.tags || []);
      } else {
        Alert.alert('Erro', 'Tarefa não encontrada.');
        navigation.goBack();
      }
    }
  }, [taskId, userId]);



  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
      const currentDate = selectedDate || dueDate; // Mantém a data atual se o usuário cancelar (Android)
      setShowDatePicker(Platform.OS === 'ios'); // No iOS, o picker é um modal, mantemos visível até confirmação
      if (event.type === 'set' && currentDate) {
        // Verifica se o usuário confirmou a data
        setDueDate(currentDate);
        if (dueDateError) {
          setDueDateError('');
        } // Limpa o erro ao selecionar uma data
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

    const handleAddTag = () => {
      if (tagInput.trim() && !tags.includes(tagInput.trim().toUpperCase())) {
        setTags([...tags, tagInput.trim().toUpperCase()]);
      }
      setTagInput('');
    };

    const removerTag = (tagRemovida: string) => {
      setTags(tags.filter(tag => tag !== tagRemovida));
    };

  const handleConfirm = () => {
    if (!task || !userId) return;
    
    const updated = saveTask({
      ...task,
      title,
      description,
      dueDate: dueDate.toISOString(),
      priority,
      tags
    }, userId);

    if (updated) {
      console.log(updated)
      navigation.goBack();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
    
  };

  return (
    <View style={styles.outerContainer}>
      <Header />
     <GestureHandlerRootView style={styles.root}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
            
    
    <View style={styles.container}>
    <View style={styles.containerChildren}>
      <Text style={styles.label}
      >Título</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Título"
        style={styles.input}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Descrição"
        multiline
        style={[styles.input, styles.multilineInput]}
      />

      <Text style={styles.label}>Tags</Text>
      <View style={styles.tagContainer}>
        <TextInput
          value={tagInput}
          onChangeText={setTagInput}
          placeholder="Digite uma tag"
          style={[styles.input, styles.tagInputContainer]}
          onSubmitEditing={handleAddTag}
        />
        <TouchableOpacity style={styles.buttonArrow} onPress={handleAddTag}>
        <FontAwesomeIcon icon={faCircleArrowRight} size={20} style={styles.submitIcon} />
        </TouchableOpacity>  
      </View>
      {/* Tags visíveis */}
      
        <View style={styles.tagOuterContainer}>
        {tags.map(tag => (
          <View key={tag} style={[styles.tagChildrenContainer, { width: tagsWidths[tag] + 30 || 'auto' }]}>
            <Text style={styles.textTag}>{tag}</Text>
            <TouchableOpacity onPress={() => removerTag(tag)}>
              <FontAwesomeIcon icon={faCircleXmark} size={13} style={styles.deleteIcon} />
            </TouchableOpacity>
          </View>
          ))}
        </View>
      

      {/* Texto invisível para medir as tags */}
      <View style={{ position: 'absolute', top: -1000 }}>
        {tags.map(tag => (
          !tagsWidths[tag] && (
            <Text
              key={tag}
              style={styles.textTag}
              onLayout={e => handleTextLayout(tag, e)}
            >
              {tag}
            </Text>
          )
        ))}
      </View>

      <Text style={styles.label}>Prioridade</Text>
      <View style={styles.priorityContainer}>
        {['ALTA', 'MÉDIA', 'BAIXA'].map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setPriority(p as any)}
            style={[
              styles.priorityButton,
              priority === p && styles[`priority${p}`],
            ]}
          >
            <Text style={[styles.priorityText, priority === p && { color: '#ffffff' } ]} >{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Prazo</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInputButton]}
              onPress={() => setShowDatePicker(true)} // Abre o DatePicker
              activeOpacity={0.7}>
              <Text style={styles.dateInputText}>
                {dueDate ? formatDate(dueDate) : 'Selecione a data'}
              </Text>
            </TouchableOpacity>
            {/* Exibe erro do prazo */}
        <Text style={[styles.errorText, {opacity: Number(!!dueDateError)}]}>
          {dueDateError || ' '}
        </Text>
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
    </View>
      <View style={styles.buttonContainer}>
        <Pressable style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
          <Text style={[styles.buttonText, styles.cancelButtonText]}>CANCELAR</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.saveButton]} onPress={handleConfirm}>
          <Text style={[styles.buttonText, styles.saveButtonText]}>CONFIRMAR</Text>
        </Pressable>
      </View>
    </View>
    
    </ScrollView>
    
    </GestureHandlerRootView>
    </View>
  );
};

export default EditTaskScreen;
