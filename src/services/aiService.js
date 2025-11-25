// aiService.js
import { HF_TOKEN } from '@env';

// Sentiment analizi
const sentimentAPI = async (text) => {
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-xlm-roberta-base-sentiment",
    {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: text }),
    }
  );
  const result = await response.json();
  return result;
};

// Özet ve öneri (profesyonel)
const summaryAPI = async (text) => {
  const prompt = `
Aşağıdaki metni analiz et ve JSON formatında cevapla.
Metin: """${text}"""
Cevap aşağıdaki formatta olmalı:
{
  "summary": "Metnin anlamını ve duygusunu kısa ve anlaşılır bir şekilde özetle.",
  "suggestion": "Kullanıcıya olumlu bir öneri ver, duygusal durumunu destekleyecek şekilde."
}
Sadece JSON formatında cevapla, başka metin ekleme.
`;
  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      model: "moonshotai/Kimi-K2-Thinking:novita",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  return data;
};

// Kullanıcı metnini analiz et
export const analyzeSentiment = async (text) => {
  if (!HF_TOKEN) throw new Error("Hugging Face token tanımlı değil!");
  if (!text || !text.trim()) throw new Error("Analiz için metin boş olamaz!");

  try {
    console.log("📝 AI Service - analiz başlıyor...");

    // 1️⃣ Sentiment analizi
    const sentimentData = await sentimentAPI(text);

    let sentiment = "NEUTRAL";
    if (
      Array.isArray(sentimentData) &&
      sentimentData.length > 0 &&
      Array.isArray(sentimentData[0])
    ) {
      const top = sentimentData[0].reduce((prev, curr) =>
        prev.score > curr.score ? prev : curr
      );

      sentiment =
        top.label === "positive" && top.score > 0.6
          ? "POSITIVE"
          : top.label === "negative" && top.score > 0.6
          ? "NEGATIVE"
          : "NEUTRAL";
    }

    // 2️⃣ Özet ve öneri (profesyonel)
    let summary = "";
    let suggestion = "";
    try {
      const aiResponse = await summaryAPI(text);

      if (
        aiResponse &&
        aiResponse.choices &&
        aiResponse.choices[0] &&
        aiResponse.choices[0].message &&
        aiResponse.choices[0].message.content
      ) {
        const content = aiResponse.choices[0].message.content;
        try {
          const jsonStart = content.indexOf("{");
          const jsonEnd = content.lastIndexOf("}") + 1;
          const parsed = JSON.parse(content.slice(jsonStart, jsonEnd));
          summary = parsed.summary || "";
          suggestion = parsed.suggestion || "";
        } catch {
          summary = fallbackSummary(sentiment, text);
          suggestion = fallbackSuggestion(sentiment);
        }
      } else {
        summary = fallbackSummary(sentiment, text);
        suggestion = fallbackSuggestion(sentiment);
      }
    } catch (err) {
      console.warn("⚠️ AI özet/öneri hatası:", err.message);
      summary = fallbackSummary(sentiment, text);
      suggestion = fallbackSuggestion(sentiment);
    }

    console.log("✅ Analiz tamamlandı");
    return { sentiment, summary, suggestion, rawData: sentimentData };
  } catch (error) {
    console.error("❌ AI Service Error:", error.message);
    throw new Error(`AI analizi başarısız: ${error.message}`);
  }
};

// Fallback özet
const fallbackSummary = (sentiment, text) => {
  switch (sentiment) {
    case "POSITIVE":
      return "Kullanıcı bugün olumlu bir ruh hali bildiriyor.";
    case "NEGATIVE":
      return "Kullanıcı bugün olumsuz bir ruh hali bildiriyor.";
    default:
      return "Kullanıcı bugün dengeli veya karışık bir ruh hali bildiriyor.";
  }
};

// Fallback öneri
const fallbackSuggestion = (sentiment) => {
  switch (sentiment) {
    case "POSITIVE":
      return "Mutluluğunuzu not almak veya sevdiklerinizle paylaşmak, bu olumlu anı ölümsüzleştirebilir.";
    case "NEGATIVE":
      return "Kendinize kısa bir mola verin veya sevdiğiniz bir aktiviteye vakit ayırın.";
    default:
      return "Günlük rutininize kısa bir yürüyüş veya rahatlama molası ekleyebilirsiniz.";
  }
};

// API Health Check
export const checkAPIHealth = async () => {
  try {
    await sentimentAPI("test");
    console.log("✅ API Health Check başarılı");
    return true;
  } catch (err) {
    console.error("❌ API Health Check başarısız:", err.message);
    return false;
  }
};
