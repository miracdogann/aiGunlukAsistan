AI Günlük Asistanı
AI Günlük Asistanı Logo
AI tabanlı bir mobil uygulama olan AI Günlük Asistanı, kullanıcıların günlük duygusal durumlarını analiz ederek kişiselleştirilmiş özetler ve öneriler sunar. React Native ile geliştirilen bu uygulama, duygusal farkındalığı artırmak ve mental sağlığı desteklemek amacıyla tasarlanmıştır.
Özellikler

Duygu Analizi: Kullanıcı girişi metinlerini AI ile analiz ederek pozitif, negatif veya nötr duygu durumunu belirler.
Özet ve Öneri: Her analiz için otomatik özet ve pratik öneriler üretir (örneğin, stres yönetimi ipuçları).
Tarihçe Yönetimi: Tüm analizleri tarih sırasıyla kaydeder; seçmeli silme ve toplu temizleme desteği.
Kullanıcı Dostu Arayüz: React Native Paper bileşenleri ile modern, responsive UI.
Yerel Depolama: AsyncStorage ile verilerin cihazda güvenli saklanması.
Çevrimdışı Çalışma: Tüm özellikler internet bağlantısı gerektirmez.

Teknoloji Yığını

Frontend: React Native 0.72+
UI Kit: React Native Paper
State Management: React Context API
Depolama: AsyncStorage
Geliştirme Araçları: Expo (opsiyonel), Metro Bundler

Kurulum
Ön Koşullar

Node.js (v18+)
React Native CLI veya Expo CLI
Android Studio / Xcode (platforma göre)
Yarn veya npm

Adımlar

Projeyi Klonlayın:Bashgit clone https://github.com/kullanici/ai-gunluk-asistani.git
cd ai-gunluk-asistani
Bağımlılıkları Yükleyin:Bashnpm install

# veya

yarn install
Ortam Değişkenlerini Ayarlayın (opsiyonel, AI API için):
.env dosyası oluşturun ve API anahtarlarını ekleyin (örneğin, OpenAI API).

Uygulamayı Çalıştırın:
Android:Bashnpx react-native run-android
iOS:Bashnpx react-native run-ios
Web (Expo ile):Bashexpo start --web

Kullanım

Ana Sayfa: Günlük giriş metninizi yazın ve "Analiz Et" butonuna basın.
Sonuçlar: Duygu skoru, emoji, özet ve öneriyi görüntüleyin. "Kaydet" ile tarihçeye ekleyin.
Tarihçe: Kayıtları görüntüleyin, seçin ve silin. Pull-to-refresh ile güncelleyin.
Boş Durum: Henüz kayıt yoksa, rehberlik metinleri gösterilir.

Örnek Kullanım Akışı:

Giriş: "Bugün iş stresi beni yordu."
Çıktı: Negatif duygu, "Stres seviyeniz yüksek görünüyor. Derin nefes egzersizi deneyin." önerisi.

Ekran Görüntüleri

Ana SayfaTarihçe EkranıAna SayfaTarihçe

Yapı
textsrc/
├── components/ # Yeniden kullanılabilir bileşenler
├── context/ # AppContext (state yönetimi)
├── screens/ # Ekranlar (Home, History)
└── services/ # StorageService (AsyncStorage wrapper)
Katkı
Katkı için teşekkürler! 😊

Fork'layın projeyi.
Yeni branch oluşturun: git checkout -b feature/yeni-ozellik.
Değişiklikleri commit edin: git commit -m 'Yeni özellik eklendi'.
Push edin: git push origin feature/yeni-ozellik.
Pull Request açın.

Lütfen Contribution Guidelines'ı okuyun.
Lisans
Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için LICENSE dosyasını inceleyin.
İletişim
Sorularınız için:

Yazar: Adınız Soyadınız
GitHub Issues: Issues Sayfası

Son Güncelleme: 25 Kasım 2025
Yapım: React Native & xAI Grok ile geliştirildi.
