
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "./types.ts";
import { decode, decodeAudioData, audioBufferToWav } from "./audioUtils.ts";

const API_KEY = (typeof process !== 'undefined' ? process.env.API_KEY : '') || "";

export async function generateAlgerianSpeech(text: string, voice: VoiceName): Promise<string> {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your Netlify environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
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
      throw new Error("No audio data returned from API");
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const decodedData = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decodedData, audioCtx, 24000, 1);
    
    const wavBlob = audioBufferToWav(audioBuffer);
    return URL.createObjectURL(wavBlob);
  } catch (error: any) {
    console.error("Speech generation error:", error);
    throw error;
  }
}
