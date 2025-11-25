import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ai_daily_assistant_entries';

// Tüm kayıtları yükle
export const loadEntries = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Veriler yüklenirken hata:', error);
    return [];
  }
};

// Yeni kayıt ekle
export const saveEntry = async (entry) => {
  try {
    const existingEntries = await loadEntries();
    const updatedEntries = [entry, ...existingEntries];
    const jsonValue = JSON.stringify(updatedEntries);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    return true;
  } catch (error) {
    console.error('Veri kaydedilirken hata:', error);
    throw error;
  }
};

// Tüm kayıtları sil
export const clearAllEntries = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Veriler silinirken hata:', error);
    throw error;
  }
};

// Belirli bir kaydı sil
export const deleteEntry = async (entryId) => {
  try {
    const existingEntries = await loadEntries();
    const filteredEntries = existingEntries.filter(entry => entry.id !== entryId);
    const jsonValue = JSON.stringify(filteredEntries);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    return true;
  } catch (error) {
    console.error('Kayıt silinirken hata:', error);
    throw error;
  }
};