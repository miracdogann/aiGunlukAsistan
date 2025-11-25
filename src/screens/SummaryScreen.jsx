import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  ProgressBar,
  Text,
  IconButton,
  Divider,
  Chip,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const SummaryScreen = () => {
  const { entries } = useApp();

  // Son 7 günün kayıtlarını filtrele
  const weeklyEntries = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return entries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
  }, [entries]);

  // İstatistikleri hesapla
  const stats = useMemo(() => {
    const total = weeklyEntries.length;
    const positive = weeklyEntries.filter(
      e => e.sentiment === 'POSITIVE',
    ).length;
    const negative = weeklyEntries.filter(
      e => e.sentiment === 'NEGATIVE',
    ).length;
    const neutral = total - positive - negative;

    const positivePercent = total ? (positive / total) * 100 : 0;
    const negativePercent = total ? (negative / total) * 100 : 0;
    const neutralPercent = total ? (neutral / total) * 100 : 0;

    let mostCommon = 'Nötr';
    if (positive > negative && positive > neutral) mostCommon = 'Pozitif';
    else if (negative > positive && negative > neutral) mostCommon = 'Negatif';

    return {
      total,
      positive,
      negative,
      neutral,
      positivePercent,
      negativePercent,
      neutralPercent,
      mostCommon,
    };
  }, [weeklyEntries]);

  const getMoodMessage = () => {
    if (stats.total === 0) return 'Henüz bu hafta için veri yok.';
    if (stats.positivePercent >= 60)
      return 'Bu hafta harika geçiyor! Pozitif enerjini koru! 🌟';
    if (stats.positivePercent >= 40)
      return 'Dengeli bir ruh hali içindesin. Güzel! 👍';
    if (stats.negativePercent >= 50)
      return 'Bu hafta biraz zorlu geçiyor gibi. Kendine zaman ayırmayı unutma. 💙';
    return 'Bu hafta karışık duygular yaşıyorsun. Bu tamamen normal! 🌈';
  };

  const getRecommendation = () => {
    if (stats.total === 0)
      return 'Duygularını düzenli olarak kaydetmeye başla!';
    if (stats.negativePercent >= 50)
      return 'Kendine iyi gelecek aktiviteler yapmayı dene. Kısa bir yürüyüş veya sevdiğin bir hobiye zaman ayırabilirsin.';
    if (stats.positivePercent >= 60)
      return 'Harika gidiyorsun! Bu pozitif enerjiyi sürdürmek için düzenli uykuya ve sağlıklı beslenmeye dikkat et.';
    return 'Dengeli bir yaşam için düzenli egzersiz ve sosyal aktiviteler faydalı olabilir.';
  };

  if (stats.total === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            <Card style={styles.card}>
              <Card.Content style={styles.emptyContent}>
                <Text style={styles.emptyEmoji}>📊</Text>
                <Text style={styles.emptyTitle}>Henüz Veri Yok</Text>
                <Text style={styles.emptyText}>
                  Son 7 günde kaydettiğin duygu analizi bulunamadı. Ana sayfadan
                  ilk kaydını oluştur!
                </Text>
                <IconButton
                  icon="plus-circle-outline"
                  size={48}
                  iconColor="#6200ee"
                  onPress={() => {}}
                  style={styles.emptyAction}
                />
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Genel Durum */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>📊 Haftalık Genel Durum</Text>
                <IconButton
                  icon="chart-line"
                  size={24}
                  iconColor="#6200ee"
                  onPress={() => {}}
                />
              </View>
              <Divider style={styles.divider} />
              <View style={styles.moodMessageContainer}>
                <Text style={styles.moodMessage}>{getMoodMessage()}</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Toplam Kayıt</Text>
                  <Chip style={styles.statChip} textStyle={styles.chipText}>
                    Bu Hafta
                  </Chip>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: '#6200ee' }]}>
                    {stats.mostCommon}
                  </Text>
                  <Text style={styles.statLabel}>Baskın Duygu</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Duygu Dağılımı */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🎭 Duygu Dağılımı</Text>
              </View>
              <Divider style={styles.divider} />
              {['positive', 'neutral', 'negative'].map(key => {
                const labelMap = {
                  positive: '😊 Pozitif',
                  neutral: '😐 Nötr',
                  negative: '😔 Negatif',
                };
                const colorMap = {
                  positive: '#4CAF50',
                  neutral: '#FF9800',
                  negative: '#F44336',
                };
                const valueMap = {
                  positive: stats.positivePercent,
                  neutral: stats.neutralPercent,
                  negative: stats.negativePercent,
                };
                const countMap = {
                  positive: stats.positive,
                  neutral: stats.neutral,
                  negative: stats.negative,
                };
                return (
                  <View key={key} style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>{labelMap[key]}</Text>
                      <Text style={styles.progressValue}>
                        {countMap[key]} ({valueMap[key].toFixed(0)}%)
                      </Text>
                    </View>
                    <ProgressBar
                      progress={valueMap[key] / 100}
                      color={colorMap[key]}
                      style={styles.progressBar}
                    />
                  </View>
                );
              })}
            </Card.Content>
          </Card>

          {/* Öneriler */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>💡 Kişisel Öneriler</Text>
                <IconButton
                  icon="lightbulb-outline"
                  size={24}
                  iconColor="#6200ee"
                  onPress={() => {}}
                />
              </View>
              <Divider style={styles.divider} />
              <Text style={styles.recommendationText}>
                {getRecommendation()}
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Son 7 günün verileri analiz edildi
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    maxWidth: 300,
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: 16,
  },
  moodMessageContainer: {
    backgroundColor: '#E8EAF6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  moodMessage: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    padding: 16,
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  statChip: {
    marginTop: 8,
    backgroundColor: '#6200ee',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  recommendationText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#adb5bd',
    fontStyle: 'italic',
  },
});

export default SummaryScreen;
