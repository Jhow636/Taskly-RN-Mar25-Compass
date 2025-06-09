import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  availableTags: string[]; // Tags disponíveis para filtrar
}

export interface FilterOptions {
  orderBy: 'high-to-low' | 'low-to-high';
  tags: string[];
  date: string | null;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onApplyFilters,
  availableTags = [],
}) => {
  // Estados para controlar as seções expandidas
  const [isOrderByOpen, setIsOrderByOpen] = useState<boolean>(false); // Fechado por padrão
  const [isTagsOpen, setIsTagsOpen] = useState<boolean>(false); // Fechado por padrão
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Estados para os filtros selecionados
  const [selectedPriority, setSelectedPriority] = useState<'high-to-low' | 'low-to-high'>(
    'high-to-low',
  );
  const [selectedTags, setSelectedTags] = useState<{[key: string]: boolean}>({});

  // Inicializar o estado de tags baseado nas tags disponíveis
  useEffect(() => {
    const initialTagsState: {[key: string]: boolean} = {};
    availableTags.forEach(tag => {
      initialTagsState[tag] = false;
    });
    setSelectedTags(initialTagsState);
  }, [availableTags]);

  // Manipuladores de eventos
  const toggleOrderBySection = () => setIsOrderByOpen(!isOrderByOpen);
  const toggleTagsSection = () => setIsTagsOpen(!isTagsOpen);
  const toggleDateSection = () => setIsDateOpen(!isDateOpen);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  const handlePriorityChange = (priority: 'high-to-low' | 'low-to-high') => {
    setSelectedPriority(priority);
  };

  const handleApplyFilters = () => {
    const selectedTagsList = Object.keys(selectedTags).filter(tag => selectedTags[tag]);
    onApplyFilters({
      orderBy: selectedPriority,
      tags: selectedTagsList,
      date: selectedDate,
    });
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedPriority('high-to-low');
    const clearedTags: {[key: string]: boolean} = {};
    Object.keys(selectedTags).forEach(tag => {
      clearedTags[tag] = false;
    });
    setSelectedTags(clearedTags);
    setSelectedDate(null);
  };

  // Impedir que toques na área ao redor do modal fechem o modal
  const handleModalContainerPress = (e: any) => {
    e.stopPropagation();
  };

  // Calcular a altura dinâmica baseada nas seções abertas
  const getModalHeight = () => {
    let height = 382; // Altura fechada base

    if (isOrderByOpen) {
      height = 478; // Altura quando a seção Ordenar por está aberta
    }

    return height;
  };

  return (
    <Modal transparent visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleModalContainerPress}>
            <View style={[styles.modalContainer, {height: getModalHeight()}]}>
              {/* Cabeçalho */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtro</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Seção de Ordenação */}
                <View style={styles.section}>
                  <TouchableOpacity style={styles.sectionHeader} onPress={toggleOrderBySection}>
                    <Text style={styles.sectionTitle}>Ordenar por</Text>
                    <Text style={[styles.chevron, isOrderByOpen && styles.chevronActive]}>
                      {isOrderByOpen ? '∧' : '∨'}
                    </Text>
                  </TouchableOpacity>
                  {isOrderByOpen && (
                    <View style={styles.sectionContent}>
                      <TouchableOpacity
                        style={[
                          styles.optionRow,
                          selectedPriority === 'low-to-high' && styles.optionRowSelected,
                        ]}
                        onPress={() => handlePriorityChange('low-to-high')}>
                        <View style={styles.radioButtonContainer}>
                          {selectedPriority === 'low-to-high' ? (
                            <View style={styles.radioButtonSelected}>
                              <Text style={styles.checkmark}>✓</Text>
                            </View>
                          ) : (
                            <View style={styles.radioButtonUnselected} />
                          )}
                        </View>
                        <Text style={styles.optionText}>Prioridade (de baixa para alta)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.optionRow,
                          selectedPriority === 'high-to-low' && styles.optionRowSelected,
                        ]}
                        onPress={() => handlePriorityChange('high-to-low')}>
                        <View style={styles.radioButtonContainer}>
                          {selectedPriority === 'high-to-low' ? (
                            <View style={styles.radioButtonSelected}>
                              <Text style={styles.checkmark}>✓</Text>
                            </View>
                          ) : (
                            <View style={styles.radioButtonUnselected} />
                          )}
                        </View>
                        <Text style={styles.optionText}>Prioridade (de alta para baixa)</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {isDateOpen && (
                  <View style={styles.sectionContent}>
                    <Text style={styles.placeholderText}>Selecione uma data (dd/mm/yyyy):</Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 4,
                        padding: 8,
                        marginTop: 8,
                        width: 150,
                      }}
                      placeholder="dd/mm/yyyy"
                      value={selectedDate || ''}
                      onChangeText={setSelectedDate}
                      keyboardType="numeric"
                    />
                  </View>
                )}

                {/* Seção de Tags */}
                <View style={styles.section}>
                  <TouchableOpacity style={styles.sectionHeader} onPress={toggleTagsSection}>
                    <Text style={styles.sectionTitle}>Tags</Text>
                    <Text style={[styles.chevron, isTagsOpen && styles.chevronActive]}>
                      {isTagsOpen ? '∧' : '∨'}
                    </Text>
                  </TouchableOpacity>
                  {isTagsOpen && (
                    <View style={styles.sectionContent}>
                      {availableTags.length > 0 ? (
                        <View style={styles.tagsContainer}>
                          {Object.keys(selectedTags).map(tag => (
                            <TouchableOpacity
                              key={tag}
                              style={styles.tagItem}
                              onPress={() => handleTagToggle(tag)}>
                              <View style={styles.checkboxContainer}>
                                {selectedTags[tag] ? (
                                  <View style={styles.checkboxSelected}>
                                    <Text style={styles.checkmark}>✓</Text>
                                  </View>
                                ) : (
                                  <View style={styles.checkboxUnselected} />
                                )}
                              </View>
                              <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.placeholderText}>Nenhuma tag disponível</Text>
                      )}
                    </View>
                  )}
                </View>

                {/* Seção de Data (para implementação futura) */}
                <View style={styles.section}>
                  <TouchableOpacity style={styles.sectionHeader} onPress={toggleDateSection}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <Text style={[styles.chevron, isDateOpen && styles.chevronActive]}>
                      {isDateOpen ? '∧' : '∨'}
                    </Text>
                  </TouchableOpacity>
                  {isDateOpen && (
                    <View style={styles.sectionContent}>
                      <Text style={styles.placeholderText}>
                        Opções de filtro por data seriam implementadas aqui
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Botões de ação */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                  <Text style={styles.applyButtonText}>APLICAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                  <Text style={styles.clearButtonText}>LIMPAR FILTROS</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Estilos definidos inline para facilitar a implementação
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 281, // Exatamente 281px de largura como mostrado no Figma
    // Altura é definida dinamicamente no método getModalHeight
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButtonContainer: {
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '400',
    color: '#E74C3C',
    textAlign: 'center',
  },
  modalContent: {
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  chevron: {
    fontSize: 18,
    color: '#5B3CC4',
    width: 18,
    height: 18,
    textAlign: 'center',
  },
  chevronActive: {
    color: '#5B3CC4',
  },
  sectionContent: {
    paddingLeft: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  optionRowSelected: {
    backgroundColor: '#F3E5F5',
  },
  radioButtonContainer: {
    marginRight: 10,
  },
  radioButtonUnselected: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BBBBBB',
  },
  radioButtonSelected: {
    height: 19.5,
    width: 19.5,
    borderRadius: 10,
    backgroundColor: '#32C25B',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 14,
    color: '#333333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#F3E5F5',
  },
  checkboxContainer: {
    marginRight: 8,
  },
  checkboxUnselected: {
    height: 18,
    width: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#BBBBBB',
  },
  checkboxSelected: {
    height: 19.5,
    width: 19.5,
    borderRadius: 4,
    backgroundColor: '#32C25B',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },
  placeholderText: {
    fontStyle: 'italic',
    fontSize: 14,
    color: '#777777',
  },
  actionButtons: {
    padding: 16,
  },
  applyButton: {
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#5B3CC4',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  clearButton: {
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#5B3CC4', // Mesmo roxo que o botão APLICAR
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});

export default FilterModal;
