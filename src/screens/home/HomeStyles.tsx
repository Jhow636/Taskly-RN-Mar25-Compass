import {StyleSheet} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import {useMemo} from 'react';

export const useHomeStyles = () => {
  const {theme} = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        outerContainer: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        contentArea: {
          flex: 1,
        },
        emptyStateWrapper: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        },
        listContentContainer: {
          padding: 16,
          paddingBottom: 10,
        },
        taskItem: {
          backgroundColor: theme.colors.secondaryBg,
          borderRadius: 8,
          marginBottom: 16,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 4, // For Android
          width: '100%',
          alignItems: 'stretch',
        },
        taskContent: {
          flex: 1,
        },
        taskHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
        },
        taskTitle: {
          ...theme.typography.subtitle,
          color: theme.colors.mainText,
          flex: 1,
          marginRight: 10,
        },
        taskDescription: {
          ...theme.typography.regular,
          color: theme.colors.secondaryText,
          marginBottom: 12,
        },
        taskCheckbox: {
          borderRadius: 50,
          borderWidth: 2,
        },
        tagsListContainer: {
          paddingBottom: 12,
        },
        tag: {
          backgroundColor: theme.colors.primaryLight,
          borderRadius: 8,
          paddingVertical: 4,
          paddingHorizontal: 12,
          marginRight: 8,
          alignSelf: 'flex-start',
        },
        tagText: {
          ...theme.typography.caption,
          color: theme.colors.mainText,
        },
        detailsButton: {
          backgroundColor: theme.colors.primary,
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 8,
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: 8, // Espaço acima do botão se não houver tags
        },
        detailsButtonText: {
          ...theme.typography.regular,
          color: theme.colors.primaryLight,
          textTransform: 'uppercase',
        },
        createButton: {
          backgroundColor: theme.colors.primary,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginHorizontal: 16,
          marginBottom: 10,
        },
        createButtonEmpty: {
          marginTop: 20,
          width: '80%',
          alignSelf: 'center',
          backgroundColor: theme.colors.primary,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 10,
        },
        createButtonText: {
          ...theme.typography.mediumTitle,
          color: theme.colors.secondaryBg,
          textTransform: 'uppercase',
        },
        bottomButtonContainer: {
          padding: 16,
          paddingTop: 0,
          backgroundColor: theme.colors.background,
        },
        emptyContainer: {
          alignItems: 'center',
          marginTop: 50,
        },
        emptyIcon: {
          width: 100,
          height: 100,
          marginBottom: 20,
        },
        emptyText: {
          ...theme.typography.regular,
          color: theme.colors.secondaryText,
          textAlign: 'center',
        },
      }),
    [theme],
  );
  return styles;
};
