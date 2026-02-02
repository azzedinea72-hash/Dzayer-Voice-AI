
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "./types.ts";
import { decode, decodeAudioData, audioBufferToWav } from "./audioUtils.ts";

export async function generateAlgerianSpeech(text: string, voice: VoiceName): Promise<string> {
  // استخدام المفتاح من البيئة مباشرة كما هو مطلوب
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // إنشاء نسخة جديدة في كل مرة لضمان استخدام المفتاح المحدث
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Convert the following Algerian Darja text to natural sounding speech with a clear Algerian accent: "${text}"`;

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
      throw new Error("لم يتم إرجاع بيانات صوتية من الخادم.");
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const decodedData = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decodedData, audioCtx, 24000, 1);
    
    const wavBlob = audioBufferToWav(audioBuffer);
    return URL.createObjectURL(wavBlob);
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("INVALID_KEY");
    }
    console.error("Speech generation error:", error);
    throw error;
  }
}
