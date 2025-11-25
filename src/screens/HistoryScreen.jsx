import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  ActivityIndicator,
  Text,
  IconButton,
  Divider,
  Checkbox,
  Surface,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const sentimentConfig = {
  POSITIVE: {
    color: '#10B981',
    emoji: '😊',
    text: 'Pozitif',
    bg: '#ECFDF5',
  },
  NEGATIVE: {
    color: '#EF4444',
    emoji: '😔',
    text: 'Negatif',
    bg: '#FEF2F2',
  },
  NEUTRAL: {
    color: '#F59E0B',
    emoji: '😐',
    text: 'Nötr',
    bg: '#FFFBEB',
  },
};

const HistoryScreen = () => {
  const { entries, loading, refreshEntries, clearEntries, deleteEntry } =
    useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshEntries();
    setRefreshing(false);
  }, [refreshEntries]);

  const toggleSelect = id => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = async () => {
    Alert.alert(
      '🗑️ Seçili Kayıtları Sil',
      `${selectedIds.length} kayıt silinecek. Emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const id of selectedIds) {
                await deleteEntry(id);
              }
              setSelectedIds([]);
              await refreshEntries();
            } catch (error) {
              console.error('Seçilen kayıtlar silinirken hata:', error);
            }
          },
        },
      ],
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleClearAll = async () => {
    Alert.alert(
      '⚠️ Tüm Kayıtları Sil',
      `${entries.length} kayıt kalıcı olarak silinecek. Bu işlem geri alınamaz!`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tümünü Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearEntries();
              setSelectedIds([]);
              await refreshEntries();
            } catch (error) {
              console.error('Tüm kayıtlar silinirken hata:', error);
            }
          },
        },
      ],
    );
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (date.toDateString() === today.toDateString()) {
      return `Bugün, ${timeStr}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Dün, ${timeStr}`;
    }

    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEntry = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    const config = sentimentConfig[item.sentiment];

    return (
      <Card
        style={[
          styles.entryCard,
          { borderLeftColor: config.color },
          isSelected && styles.selectedCard,
        ]}
      >
        <Card.Content>
          {/* Header Row */}
          <View style={styles.entryHeader}>
            <Checkbox
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => toggleSelect(item.id)}
              color="#8B5CF6"
            />

            <View style={styles.dateContainer}>
              <IconButton
                icon="clock-time-four-outline"
                size={16}
                iconColor="#9CA3AF"
                style={styles.clockIcon}
              />
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            </View>

            <View
              style={[styles.sentimentBadge, { backgroundColor: config.color }]}
            >
              <Text style={styles.sentimentEmoji}>{config.emoji}</Text>
              <Text style={styles.sentimentText}>{config.text}</Text>
            </View>
          </View>

          {/* Original Text */}
          <Text style={styles.entryText} numberOfLines={3}>
            {item.text}
          </Text>

          <Divider style={styles.divider} />

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <Surface style={styles.iconContainer}>
                <Text style={styles.summaryIcon}>📝</Text>
              </Surface>
              <Text style={styles.summaryLabel}>Öneri</Text>
            </View>
            <Text style={styles.summaryText}>{item.suggestion}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const isSelectionMode = selectedIds.length > 0;

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color="#8B5CF6" animating />
          </View>
          <Text style={styles.loadingText}>Kayıtlar yükleniyor...</Text>
          <Text style={styles.loadingSubText}>Lütfen bekleyin</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty State
  if (entries.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyEmoji}>📝</Text>
          </View>
          <Text style={styles.emptyTitle}>Henüz Kayıt Yok</Text>
          <Text style={styles.emptyText}>
            Ana sayfadan ilk duygusal analizini yap ve kayıtların burada
            görünsün!
          </Text>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.emptyAction}
            buttonColor="#8B5CF6"
            icon="plus-circle-outline"
            labelStyle={styles.emptyButtonLabel}
          >
            Yeni Analiz Yap
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[styles.header, isSelectionMode && styles.selectionHeader]}
        >
          <View style={styles.headerLeft}>
            {isSelectionMode ? (
              <View style={styles.selectionInfo}>
                <IconButton
                  icon="close"
                  size={24}
                  iconColor="#EF4444"
                  onPress={clearSelection}
                  style={styles.closeIcon}
                />
                <View>
                  <Text style={styles.selectionCount}>
                    {selectedIds.length} Seçili
                  </Text>
                  <Text style={styles.selectionSubtext}>
                    Toplamda {entries.length} kayıt
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <Surface style={styles.headerIconContainer}>
                  <IconButton icon="history" size={24} iconColor="#8B5CF6" />
                </Surface>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>Geçmiş</Text>
                  <Text style={styles.statsText}>{entries.length} kayıt</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.headerRight}>
            {isSelectionMode ? (
              <>
                <Button
                  mode="contained"
                  onPress={handleDeleteSelected}
                  icon="delete"
                  buttonColor="#EF4444"
                  compact
                  style={styles.compactButton}
                  labelStyle={styles.buttonLabel}
                >
                  Sil
                </Button>
                <Button
                  mode="text"
                  onPress={clearSelection}
                  icon="close"
                  textColor="#6B7280"
                  compact
                  style={styles.compactButton}
                  labelStyle={styles.buttonLabel}
                >
                  İptal
                </Button>
              </>
            ) : (
              <Button
                mode="outlined"
                onPress={handleClearAll}
                icon="delete-sweep"
                textColor="#EF4444"
                compact
                style={styles.compactButton}
                labelStyle={styles.buttonLabel}
              >
                Tümünü Sil
              </Button>
            )}
          </View>
        </View>

        {/* List */}
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8B5CF6']}
              tintColor="#8B5CF6"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingSubText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 14,
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    maxWidth: 280,
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyAction: {
    marginTop: 8,
    borderRadius: 12,
  },
  emptyButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
  },
  selectionHeader: {
    backgroundColor: '#FEF2F2',
    borderBottomColor: '#FECACA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    elevation: 1,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 2,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeIcon: {
    margin: 0,
  },
  selectionCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  selectionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactButton: {
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  entryCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 5,
  },
  selectedCard: {
    backgroundColor: '#F3E5F5',
    borderColor: '#8B5CF6',
    borderWidth: 2,
    borderLeftWidth: 5,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 4,
  },
  clockIcon: {
    margin: 0,
    padding: 0,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: -4,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sentimentEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  sentimentText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  entryText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  divider: {
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  summaryContainer: {
    marginTop: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    elevation: 0,
  },
  summaryIcon: {
    fontSize: 16,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  summaryText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    paddingLeft: 40,
  },
});

export default HistoryScreen;
