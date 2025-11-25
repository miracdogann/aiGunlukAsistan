import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Chip,
  IconButton,
  Divider,
  Text,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { analyzeSentiment } from '../services/aiService';
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

const HomeScreen = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addEntry } = useApp();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir metin girin!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const analysis = await analyzeSentiment(text);
      const analysisResult = {
        text,
        sentiment: analysis.sentiment,
        summary: analysis.summary,
        suggestion: analysis.suggestion,
      };
      setResult(analysisResult);
      const saved = await addEntry(analysisResult);

      Alert.alert(
        saved ? 'Başarılı' : 'Uyarı',
        saved
          ? 'Analiz tamamlandı ve kaydedildi! Geçmiş sekmesinden görebilirsiniz.'
          : 'Analiz tamamlandı ama kayıt yapılamadı.',
        [{ text: 'Tamam' }],
      );
    } catch (error) {
      Alert.alert('Hata', `Analiz başarısız: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text style={styles.title}>Bugün nasıl hissediyorsun?</Text>
                <IconButton
                  icon="heart-outline"
                  size={24}
                  iconColor="#6200ee"
                  onPress={() =>
                    Alert.alert(
                      'Yardım',
                      'Duygularınızı paylaşarak AI destekli analiz alın.',
                    )
                  }
                />
              </View>
              <Text style={styles.subtitle}>
                Duygularını veya düşüncelerini paylaş, AI asistan analiz etsin.
              </Text>
              <Divider style={styles.divider} />

              <TextInput
                label="Bugünkü duygularım..."
                value={text}
                onChangeText={setText}
                mode="outlined"
                multiline
                numberOfLines={6}
                style={styles.input}
                placeholder="Örn: Bugün çok motive hissediyorum ama biraz yorgunum."
                disabled={loading}
                keyboardType="default"
                autoCorrect={true} // Türkçe karakterler için
                textContentType="none"
                autoCapitalize="sentences"
                blurOnSubmit={false}
                returnKeyType="default"
              />

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleAnalyze}
                  loading={loading}
                  disabled={loading || !text.trim()}
                  style={styles.analyzeButton}
                  icon="brain"
                  theme={{ roundness: 12 }}
                >
                  {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
                </Button>
                {text.trim() && !loading && (
                  <Button
                    mode="outlined"
                    onPress={handleClear}
                    style={styles.clearButton}
                    icon="close"
                    theme={{ roundness: 12 }}
                  >
                    Temizle
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>

          {loading && (
            <Card style={styles.loadingCard}>
              <Card.Content style={styles.loadingContent}>
                <ActivityIndicator
                  size="large"
                  color="#6200ee"
                  animating={true}
                />
                <Text style={styles.loadingText}>
                  AI asistan düşüncelerinizi analiz ediyor...
                </Text>
                <Text style={styles.loadingSubText}>
                  Biraz sabır, en iyi sonuç için çalışıyor!
                </Text>
              </Card.Content>
            </Card>
          )}

          {result && !loading && (
            <Card
              style={[
                styles.resultCard,
                { borderLeftColor: sentimentColors[result.sentiment] },
              ]}
            >
              <Card.Content>
                <View style={styles.sentimentHeader}>
                  <Text style={styles.resultTitle}>Analiz Sonucu</Text>
                  <Chip
                    style={[
                      styles.sentimentChip,
                      { backgroundColor: sentimentColors[result.sentiment] },
                    ]}
                    textStyle={styles.chipText}
                    icon={() => (
                      <Text style={styles.emoji}>
                        {sentimentEmojis[result.sentiment]}
                      </Text>
                    )}
                    mode="flat"
                  >
                    {sentimentTexts[result.sentiment]}
                  </Chip>
                </View>

                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>📝 Özet</Text>
                  <Text style={styles.resultText}>{result.summary}</Text>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>💡 Öneri</Text>
                  <Text style={styles.resultText}>{result.suggestion}</Text>
                </View>

                <View style={styles.actions}>
                  <Button
                    mode="text"
                    onPress={handleClear}
                    icon="refresh"
                    style={styles.actionButton}
                  >
                    Yeni Analiz
                  </Button>
                  <Button
                    mode="text"
                    onPress={() =>
                      Alert.alert('Paylaş', 'Sonucu paylaşmak ister misin?')
                    }
                    icon="share-variant"
                    style={styles.actionButton}
                  >
                    Paylaş
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { padding: 20, paddingBottom: 20 },
  card: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
    lineHeight: 22,
  },
  divider: { marginVertical: 16 },
  input: { backgroundColor: '#fff', marginBottom: 16 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  analyzeButton: { flex: 1, paddingVertical: 8, marginRight: 8 },
  clearButton: { flex: 1, paddingVertical: 8 },
  loadingCard: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  loadingContent: { alignItems: 'center', paddingVertical: 24 },
  loadingText: {
    marginTop: 16,
    color: '#495057',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingSubText: {
    marginTop: 8,
    color: '#adb5bd',
    textAlign: 'center',
    fontSize: 14,
  },
  resultCard: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderLeftWidth: 5,
  },
  sentimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: { fontSize: 22, fontWeight: '600', color: '#1a1a1a' },
  sentimentChip: { height: 40, alignSelf: 'flex-start' },
  chipText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  emoji: { fontSize: 18, marginRight: 4 },
  resultSection: { marginBottom: 16 },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 6,
  },
  resultText: { fontSize: 15, color: '#495057', lineHeight: 24 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: { flex: 1, marginHorizontal: 4 },
});

export default HomeScreen;
