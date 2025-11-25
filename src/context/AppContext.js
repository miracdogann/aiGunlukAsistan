import React, {createContext, useState, useContext, useEffect} from 'react';
import {loadEntries, saveEntry, clearAllEntries, deleteEntry as deleteEntryFromStorage} from '../services/storageService';

const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Uygulama başladığında kayıtları yükle
  useEffect(() => {
    loadAllEntries();
  }, []);

  const loadAllEntries = async () => {
    try {
      setLoading(true);
      const loadedEntries = await loadEntries();
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Kayıtlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Yeni kayıt ekle
  const addEntry = async (entryData) => {
    try {
      console.log('📝 AppContext - addEntry çağrıldı');
      console.log('📝 Entry data:', entryData);

      const newEntry = {
        id: Date.now().toString(),
        text: entryData.text,
        sentiment: entryData.sentiment,
        summary: entryData.summary,
        suggestion: entryData.suggestion,
        date: new Date().toISOString(),
      };

      console.log('💾 Yeni entry oluşturuldu:', newEntry);

      await saveEntry(newEntry);
      
      console.log('✅ Entry kaydedildi, state güncelleniyor...');
      setEntries(prevEntries => [newEntry, ...prevEntries]);
      
      console.log('✅ State güncellendi!');
      return true;
    } catch (error) {
      console.error('❌ AppContext - addEntry hatası:', error);
      console.error('Error message:', error.message);
      return false;
    }
  };

  // Belirli bir kaydı sil
  const deleteEntry = async (entryId) => {
    try {
      console.log('🗑️ AppContext - deleteEntry çağrıldı, ID:', entryId);
      await deleteEntryFromStorage(entryId);
      console.log('✅ Entry silindi, state yenileniyor...');
      await loadAllEntries(); // State'i güncellemek için yükle
      console.log('✅ State yenilendi!');
      return true;
    } catch (error) {
      console.error('❌ AppContext - deleteEntry hatası:', error);
      console.error('Error message:', error.message);
      return false;
    }
  };

  // Tüm kayıtları temizle
  const clearEntries = async () => {
    try {
      await clearAllEntries();
      setEntries([]);
      return true;
    } catch (error) {
      console.error('Kayıtlar silinirken hata:', error);
      return false;
    }
  };

  const value = {
    entries,
    loading,
    addEntry,
    clearEntries,
    deleteEntry, // Ekledik!
    refreshEntries: loadAllEntries,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};