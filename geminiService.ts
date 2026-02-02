
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName, AlgerianRegion } from "./types.ts";
import { decode, decodeAudioData, audioBufferToWav } from "./audioUtils.ts";

export async function generateAlgerianSpeech(
  text: string, 
  voice: VoiceName, 
  region: AlgerianRegion
): Promise<string> {
  // استخدام المفتاح مباشرة من process.env والذي يتم حقنه تلقائياً بواسطة نظام Key Selection
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("KEY_NOT_FOUND");
  }

  // إنشاء مثيل جديد للذكاء الاصطناعي عند كل طلب لضمان استخدام أحدث مفتاح
  const ai = new GoogleGenAI({ apiKey });
  
  const regionPrompts: Record<AlgerianRegion, string> = {
    alger: "بلكنة عاصمية عريقة (وسط الجزائر)",
    oran: "بلكنة وهرانية قوية (غرب الجزائر) مع نبرة سريعة ومميزة",
    constantine: "بلكنة قسنطينية رصينة (شرق الجزائر) مع التركيز على مخارج الحروف القاف والتاء",
    sahara: "بلكنة صحراوية بدوية أصيلة (جنوب الجزائر) بنبرة عميقة وهادئة",
    neutral: "بلهجة جزائرية بيضاء مفهومة للجميع"
  };

  const prompt = `حول النص التالي إلى كلام مسموع باللهجة الجزائرية (الدارجة) ${regionPrompts[region]}. 
  اجعل الكلام يبدو طبيعياً جداً، بشرياً، ومليئاً بالمشاعر. 
  النص: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("API_ERROR");
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const decodedData = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decodedData, audioCtx, 24000, 1);
    
    const wavBlob = audioBufferToWav(audioBuffer);
    return URL.createObjectURL(wavBlob);
  } catch (error: any) {
    if (error.message?.includes("entity was not found") || error.message?.includes("key")) {
      throw new Error("KEY_INVALID");
    }
    throw error;
  }
}
