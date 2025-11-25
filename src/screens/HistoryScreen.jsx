import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Chip,
  Button,
  ActivityIndicator,
  Text,
  IconButton,
  Divider,
  Checkbox,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const sentimentColors = {
  POSITIVE: '#4CAF50',
  NEGATIVE: '#F44336',
  NEUTRAL: '#FF9800',
};

const sentimentEmojis = {
  POSITIVE: '😊',
  NEGATIVE: '😔',
  NEUTRAL: '😐',
};

const sentimentTexts = {
  POSITIVE: 'Pozitif',
  NEGATIVE: 'Negatif',
  NEUTRAL: 'Nötr',
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
    try {
      for (const id of selectedIds) {
        await deleteEntry(id);
      }
      setSelectedIds([]);
      // Silme sonrası listeyi yenile, storage güncellendiği için entries'i tazeleyelim
      await refreshEntries();
    } catch (error) {
      console.error('Seçilen kayıtlar silinirken hata:', error);
      // Hata durumunda da yenile, ama kullanıcıya toast/alert ekleyebilirsin
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleClearAll = async () => {
    try {
      await clearEntries();
      setSelectedIds([]);
      // Clear sonrası da yenile (güvenlik için)
      await refreshEntries();
    } catch (error) {
      console.error('Tüm kayıtlar silinirken hata:', error);
    }
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
    if (date.toDateString() === today.toDateString())
      return `Bugün, ${timeStr}`;
    if (date.toDateString() === yesterday.toDateString())
      return `Dün, ${timeStr}`;
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
    return (
      <Card
        style={[
          styles.entryCard,
          { borderLeftColor: sentimentColors[item.sentiment] },
          isSelected && styles.selectedCard,
        ]}
      >
        <Card.Content>
          <View style={styles.entryHeader}>
            <Checkbox
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => toggleSelect(item.id)}
              color="#6200ee"
            />
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              <IconButton icon="clock-outline" size={16} iconColor="#6c757d" />
            </View>
            <Chip
              style={[
                styles.chip,
                { backgroundColor: sentimentColors[item.sentiment] },
              ]}
              textStyle={styles.chipText}
              icon={() => (
                <Text style={styles.emoji}>
                  {sentimentEmojis[item.sentiment]}
                </Text>
              )}
              mode="flat"
            >
              {sentimentTexts[item.sentiment]}
            </Chip>
          </View>
          <Text style={styles.entryText} numberOfLines={3}>
            {item.text}
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>📝 Özet</Text>
            <Text style={styles.summaryText}>{item.summary}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6200ee" animating />
          <Text style={styles.loadingText}>Kayıtlar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );

  if (entries.length === 0)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>Henüz Kayıt Yok</Text>
          <Text style={styles.emptyText}>
            Ana sayfadan ilk duygusal analizini yap ve kayıtların burada
            görünsün!
          </Text>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.emptyAction}
            theme={{ roundness: 12 }}
            icon="plus-circle-outline"
          >
            Yeni Analiz Yap
          </Button>
        </View>
      </SafeAreaView>
    );

  const isSelectionMode = selectedIds.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View
          style={[styles.header, isSelectionMode && styles.selectionHeader]}
        >
          <View style={styles.headerLeft}>
            {isSelectionMode ? (
              <View style={styles.selectionLeft}>
                <IconButton
                  icon="close"
                  size={24}
                  iconColor="#F44336"
                  onPress={clearSelection}
                />
                <Text style={styles.selectionCount}>
                  {selectedIds.length} seçili
                </Text>
              </View>
            ) : (
              <>
                <IconButton
                  icon="history"
                  size={24}
                  iconColor="#6200ee"
                  onPress={() => {}}
                />
                <Text style={styles.statsText}>
                  Toplam {entries.length} kayıt
                </Text>
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
                  buttonColor="#F44336"
                  textColor="#fff"
                  compact
                  style={styles.compactButton}
                  theme={{ roundness: 20 }}
                >
                  Sil
                </Button>
                <Button
                  mode="text"
                  onPress={clearSelection}
                  icon="close"
                  textColor="#F44336"
                  compact
                  style={styles.compactButton}
                  theme={{ roundness: 20 }}
                >
                  İptal
                </Button>
              </>
            ) : (
              <Button
                mode="outlined"
                onPress={handleClearAll}
                icon="delete-sweep"
                textColor="#F44336"
                compact
                style={styles.compactButton}
                theme={{ roundness: 20 }}
              >
                Tümünü Sil
              </Button>
            )}
          </View>
        </View>

        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6200ee']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    maxWidth: 300,
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyAction: { marginTop: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
  },
  selectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
    marginLeft: 8,
  },
  selectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
  compactButton: {
    minWidth: 80,
  },
  listContent: { padding: 16, paddingBottom: 20 },
  entryCard: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderLeftWidth: 5,
  },
  selectedCard: {
    backgroundColor: '#f3e5f5',
    borderColor: '#6200ee',
    borderWidth: 1,
  },
  entryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dateText: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 8,
    fontWeight: '500',
  },
  chip: { height: 36 },
  chipText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  emoji: { fontSize: 16, marginRight: 4 },
  entryText: {
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 12,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  divider: { marginVertical: 12 },
  summaryContainer: { marginTop: 8 },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 4,
  },
  summaryText: { fontSize: 14, color: '#495057', lineHeight: 20 },
});

export default HistoryScreen;
