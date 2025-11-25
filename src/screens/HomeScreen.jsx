import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
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
  Surface,
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { analyzeSentiment } from '../services/aiService';
import { SafeAreaView } from 'react-native-safe-area-context';

const sentimentConfig = {
  POSITIVE: {
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
    emoji: '😊',
    text: 'Pozitif',
    icon: 'emoticon-happy-outline',
    bg: '#ECFDF5',
  },
  NEGATIVE: {
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
    emoji: '😔',
    text: 'Negatif',
    icon: 'emoticon-sad-outline',
    bg: '#FEF2F2',
  },
  NEUTRAL: {
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    emoji: '😐',
    text: 'Nötr',
    icon: 'emoticon-neutral-outline',
    bg: '#FFFBEB',
  },
};

const HomeScreen = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const { addEntry } = useApp();

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sayfa açılış animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animasyon değerlerini dinle
    const fadeListener = fadeAnim.addListener(({ value }) => {
      console.log('Fade değeri:', value);
    });

    return () => {
      fadeAnim.removeListener(fadeListener);
    };
  }, []);

  useEffect(() => {
    // Loading pulse animasyonu
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const handleAnalyze = async () => {
    console.log('🔍 Analiz butonuna basıldı');

    if (!text.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir metin girin!', [{ text: 'Tamam' }]);
      return;
    }

    if (text.trim().length < 10) {
      Alert.alert(
        'Uyarı',
        'Daha iyi bir analiz için lütfen en az 10 karakter girin.',
        [{ text: 'Tamam' }],
      );
      return;
    }

    setLoading(true);
    setResult(null);

    // Sonuç kartı animasyonu için hazırlık
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    try {
      console.log('📡 API çağrısı yapılıyor...');
      const analysis = await analyzeSentiment(text);
      console.log('✅ API yanıtı alındı:', analysis);

      const analysisResult = {
        text,
        sentiment: analysis.sentiment,
        summary: analysis.summary,
        suggestion: analysis.suggestion,
        timestamp: new Date().toISOString(),
      };

      setResult(analysisResult);

      // Sonuç kartı animasyonu
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      console.log('💾 Kayıt işlemi başlıyor...');
      const saved = await addEntry(analysisResult);
      console.log('💾 Kayıt sonucu:', saved);

      Alert.alert(
        saved ? '✅ Başarılı' : '⚠️ Uyarı',
        saved
          ? 'Analiz tamamlandı ve kaydedildi! Geçmiş sekmesinden görebilirsiniz.'
          : 'Analiz tamamlandı ama kayıt yapılamadı.',
        [{ text: 'Tamam' }],
      );
    } catch (error) {
      console.log('❌ Hata oluştu:', error);
      Alert.alert('❌ Hata', `${error.message}`, [{ text: 'Tamam' }]);
    } finally {
      setLoading(false);
      console.log('✅ İşlem tamamlandı');
    }
  };

  const handleClear = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setText('');
      setResult(null);
      setCharCount(0);
      fadeAnim.setValue(1);
    });
  };

  const handleTextChange = newText => {
    setText(newText);
    setCharCount(newText.length);
  };

  const getCharCountColor = () => {
    if (charCount === 0) return '#ADB5BD';
    if (charCount < 10) return '#F59E0B';
    if (charCount < 50) return '#3B82F6';
    return '#10B981';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          {/* Header Card */}
          <View style={styles.animatedContainer}>
            <View style={styles.gradientCard}>
              <View style={styles.headerContent}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Merhaba! 👋</Text>
                  <Text style={styles.headerSubtitle}>
                    Bugün kendini nasıl hissediyorsun?
                  </Text>
                </View>
                <Surface style={styles.iconSurface}>
                  <IconButton
                    icon="brain"
                    size={28}
                    iconColor="#8B5CF6"
                    onPress={() =>
                      Alert.alert(
                        '🧠 AI Duygu Analizi',
                        'Duygularınızı ve düşüncelerinizi paylaşın. Yapay zeka destekli sistemimiz, hislerinizi analiz edip size özel öneriler sunacak.',
                        [{ text: 'Anladım' }],
                      )
                    }
                  />
                </Surface>
              </View>
            </View>
          </View>

          {/* Input Card */}
          <View style={styles.animatedContainer}>
            <Card style={styles.inputCard}>
              <Card.Content>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputTitle}>✍️ Duygularını Paylaş</Text>
                  <View style={styles.charCountContainer}>
                    <Text
                      style={[styles.charCount, { color: getCharCountColor() }]}
                    >
                      {charCount}
                    </Text>
                    <Text style={styles.charCountLabel}> karakter</Text>
                  </View>
                </View>

                <TextInput
                  label="Bugün neler yaşadın, neler hissettin?"
                  value={text}
                  onChangeText={handleTextChange}
                  mode="outlined"
                  multiline
                  numberOfLines={7}
                  style={styles.input}
                  placeholder="Örn: Bugün işte güzel bir proje tamamladım. Kendimi oldukça başarılı hissediyorum ama aynı zamanda biraz yorgunum..."
                  disabled={loading}
                  keyboardType="default"
                  autoCorrect={true}
                  textContentType="none"
                  autoCapitalize="sentences"
                  blurOnSubmit={false}
                  returnKeyType="default"
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#8B5CF6"
                  theme={{
                    colors: {
                      placeholder: '#9CA3AF',
                      text: '#1F2937',
                    },
                  }}
                />

                {text.trim().length > 0 && text.trim().length < 10 && (
                  <View style={styles.warningContainer}>
                    <IconButton
                      icon="information"
                      size={16}
                      iconColor="#F59E0B"
                    />
                    <Text style={styles.warningText}>
                      Daha iyi analiz için en az 10 karakter yazın
                    </Text>
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    mode="contained"
                    onPress={handleAnalyze}
                    loading={loading}
                    disabled={
                      loading || !text.trim() || text.trim().length < 10
                    }
                    style={[
                      styles.analyzeButton,
                      (!text.trim() || text.trim().length < 10) &&
                        styles.disabledButton,
                    ]}
                    icon="brain"
                    labelStyle={styles.buttonLabel}
                    contentStyle={styles.buttonContent}
                    buttonColor="#8B5CF6"
                  >
                    {loading ? 'Analiz Ediliyor...' : '🚀 Analiz Et'}
                  </Button>

                  {text.trim() && !loading && (
                    <TouchableOpacity
                      onPress={handleClear}
                      style={styles.clearButtonTouchable}
                      activeOpacity={0.7}
                    >
                      <Surface style={styles.clearButton}>
                        <IconButton
                          icon="close-circle"
                          size={24}
                          iconColor="#EF4444"
                        />
                      </Surface>
                    </TouchableOpacity>
                  )}
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* Loading Card */}
          {loading && (
            <View>
              <Card style={styles.loadingCard}>
                <Card.Content style={styles.loadingContent}>
                  <View style={styles.loadingGradient}>
                    <ActivityIndicator
                      size="large"
                      color="#8B5CF6"
                      animating={true}
                    />
                  </View>
                  <Text style={styles.loadingText}>
                    🤖 AI asistan çalışıyor...
                  </Text>
                  <Text style={styles.loadingSubText}>
                    Duygularınız analiz ediliyor, lütfen bekleyin
                  </Text>
                  <View style={styles.loadingSteps}>
                    <Text style={styles.stepText}>📖 Metin okunuyor</Text>
                    <Text style={styles.stepText}>
                      🔍 Duygular tespit ediliyor
                    </Text>
                    <Text style={styles.stepText}>
                      💭 Öneriler hazırlanıyor
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Result Card */}
          {result && !loading && (
            <View>
              <Card
                style={[
                  styles.resultCard,
                  { borderLeftColor: sentimentConfig[result.sentiment].color },
                ]}
              >
                <View
                  style={[
                    styles.resultGradient,
                    { backgroundColor: sentimentConfig[result.sentiment].bg },
                  ]}
                >
                  <Card.Content>
                    {/* Sentiment Header */}
                    <View style={styles.sentimentHeader}>
                      <View style={styles.sentimentTitleContainer}>
                        <Text style={styles.resultTitle}>📊 Analiz Sonucu</Text>
                        <Text style={styles.resultTimestamp}>
                          {new Date(result.timestamp).toLocaleTimeString(
                            'tr-TR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.sentimentBadge,
                          {
                            backgroundColor:
                              sentimentConfig[result.sentiment].color,
                          },
                        ]}
                      >
                        <Text style={styles.sentimentEmoji}>
                          {sentimentConfig[result.sentiment].emoji}
                        </Text>
                        <Text style={styles.sentimentText}>
                          {sentimentConfig[result.sentiment].text}
                        </Text>
                      </View>
                    </View>

                    <Divider style={styles.resultDivider} />

                    {/* Original Text */}
                    <Surface style={styles.originalTextSurface}>
                      <Text style={styles.originalTextLabel}>
                        💬 Senin Mesajın
                      </Text>
                      <Text style={styles.originalText} numberOfLines={3}>
                        {result.text}
                      </Text>
                    </Surface>

                    {/* Summary Section */}
                    <View style={styles.resultSection}>
                      <View style={styles.sectionHeader}>
                        <Surface style={styles.iconContainer}>
                          <IconButton
                            icon="text-box-outline"
                            size={20}
                            iconColor="#8B5CF6"
                          />
                        </Surface>
                        <Text style={styles.resultLabel}>Özet</Text>
                      </View>
                      <Text style={styles.resultText}>{result.summary}</Text>
                    </View>

                    <Divider style={styles.sectionDivider} />

                    {/* Suggestion Section */}
                    <View style={styles.resultSection}>
                      <View style={styles.sectionHeader}>
                        <Surface style={styles.iconContainer}>
                          <IconButton
                            icon="lightbulb-on-outline"
                            size={20}
                            iconColor="#F59E0B"
                          />
                        </Surface>
                        <Text style={styles.resultLabel}>Öneri</Text>
                      </View>
                      <Text style={styles.resultText}>{result.suggestion}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleClear}
                        activeOpacity={0.7}
                      >
                        <Surface style={styles.actionSurface}>
                          <IconButton
                            icon="refresh"
                            size={20}
                            iconColor="#6366F1"
                          />
                          <Text style={styles.actionText}>Yeni Analiz</Text>
                        </Surface>
                      </TouchableOpacity>
                    </View>
                  </Card.Content>
                </View>
              </Card>
            </View>
          )}

          {/* Tips Card - Sadece result yoksa göster */}
          {!result && !loading && (
            <View>
              <Card style={styles.tipsCard}>
                <Card.Content>
                  <Text style={styles.tipsTitle}>💡 İpuçları</Text>
                  <View style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>
                      Duygularını açık ve detaylı anlat
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>
                      Günlük olayları ve tepkilerini paylaş
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>
                      Ne hissettiğini samimi bir şekilde yaz
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    padding: 16,
    paddingBottom: 32,
  },
  animatedContainer: {
    marginBottom: 16,
  },
  gradientCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E9D5FF',
    fontWeight: '500',
  },
  iconSurface: {
    borderRadius: 50,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  inputCard: {
    borderRadius: 20,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  charCountLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9FAFB',
    fontSize: 15,
    lineHeight: 22,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#D97706',
    flex: 1,
    marginLeft: -8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  analyzeButton: {
    flex: 1,
    borderRadius: 12,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  clearButtonTouchable: {
    borderRadius: 12,
  },
  clearButton: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FEF2F2',
  },
  loadingCard: {
    borderRadius: 20,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E9D5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingSteps: {
    marginTop: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  stepText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginVertical: 4,
    fontWeight: '500',
  },
  resultCard: {
    borderRadius: 20,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 6,
    overflow: 'hidden',
  },
  resultGradient: {
    borderRadius: 20,
  },
  sentimentHeader: {
    marginBottom: 20,
  },
  sentimentTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
  },
  sentimentEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  sentimentText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  resultDivider: {
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  originalTextSurface: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  originalTextLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  originalText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  resultSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    elevation: 1,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  resultText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    paddingLeft: 44,
  },
  sectionDivider: {
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    elevation: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: -4,
  },
  tipsCard: {
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  tipBullet: {
    fontSize: 18,
    color: '#F59E0B',
    marginRight: 8,
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
});

export default HomeScreen;
