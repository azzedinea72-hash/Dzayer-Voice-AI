
import React, { useState, useRef, useEffect } from 'react';
import { VoiceName, VoiceOption, GenerationState } from './types.ts';
import { generateAlgerianSpeech } from './geminiService.ts';

const VOICE_OPTIONS: VoiceOption[] = [
  { id: VoiceName.Kore, name: 'كوري (Kore)', gender: 'female', description: 'صوت نسائي هادئ وواضح، مناسب للرسائل الطويلة.' },
  { id: VoiceName.Puck, name: 'باك (Puck)', gender: 'male', description: 'صوت رجولي عميق وقوي.' },
  { id: VoiceName.Charon, name: 'شارون (Charon)', gender: 'male', description: 'صوت متزن يصلح للنشرات الإخبارية.' },
  { id: VoiceName.Zephyr, name: 'زفير (Zephyr)', gender: 'female', description: 'صوت نسائي حيوي ومتحمس.' },
  { id: VoiceName.Fenrir, name: 'فينرير (Fenrir)', gender: 'male', description: 'صوت رجولي شاب وودود.' },
];

const PRESET_PHRASES = [
  "واش راك؟ لاباس؟",
  "صحا فطوركم وعيدكم مبارك",
  "الجزائر بلادنا شابة بزاف، لازم نحافظو عليها",
  "راحت عليا الطوبيس، راني حاصُل هنايا",
  "القهوة نتاع الصباح هي الصح في النهار"
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Zephyr);
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    audioUrl: null,
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  // التحقق من وجود مفتاح عند التحميل
  useEffect(() => {
    const checkKey = async () => {
      const isConfigured = !!process.env.API_KEY;
      const hasSelected = await (window as any).aistudio?.hasSelectedApiKey?.();
      setHasKey(isConfigured || hasSelected);
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    try {
      await (window as any).aistudio?.openSelectKey?.();
      setHasKey(true);
      setState(prev => ({ ...prev, error: null }));
    } catch (err) {
      console.error("Failed to open key dialog", err);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setState(prev => ({ ...prev, error: "من فضلك أدخل نصاً بالدارجة" }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const url = await generateAlgerianSpeech(inputText, selectedVoice);
      setState(prev => ({ ...prev, audioUrl: url, isGenerating: false }));
    } catch (err: any) {
      let errorMessage = "حدث خطأ أثناء توليد الصوت. حاول مرة أخرى.";
      
      if (err.message === "API_KEY_MISSING") {
        setHasKey(false);
        errorMessage = "مفتاح API غير متوفر. يرجى إعداده للمتابعة.";
      } else if (err.message === "INVALID_KEY") {
        setHasKey(false);
        errorMessage = "المفتاح المستخدم غير صالح أو انتهت صلاحيته.";
      }

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: errorMessage 
      }));
    }
  };

  const handlePresetClick = (phrase: string) => {
    setInputText(phrase);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-50 px-4 py-4 md:px-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-900">Dzayer Voice AI</h1>
            <p className="text-xs text-slate-500 font-medium">صوت الدزاير بذكاء اصطناعي</p>
          </div>
        </div>
        
        {!hasKey && (
          <button 
            onClick={handleOpenKeyDialog}
            className="text-xs bg-amber-100 text-amber-700 px-3 py-2 rounded-lg font-bold hover:bg-amber-200 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L7 17l-1 1V15l1-1 1-1V12l1-1 1-1 1.257-1.257A6 6 0 1118 8zm-6 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            إعداد المفتاح
          </button>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {!hasKey && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              تنبيه: مفتاح API مطلوب
            </h3>
            <p className="text-sm mb-4">
              لتمكين تحويل النص إلى صوت، يرجى اختيار مفتاح API صالح من مشروع مدفوع. يمكنك الحصول عليه من لوحة تحكم Google AI Studio.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleOpenKeyDialog}
                className="bg-amber-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md"
              >
                اختيار المفتاح الآن
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white border border-amber-300 text-amber-700 px-5 py-2 rounded-xl font-bold hover:bg-amber-50 transition-all"
              >
                وثائق الفوترة
              </a>
            </div>
          </div>
        )}

        <section className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-800">صوت واقعي باللهجة الجزائرية</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            تحويل الدارجة الجزائرية إلى كلام مسموع بجودة عالية باستخدام Gemini TTS.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">النص بالدارجة</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="أكتب هنا بالدارجة... مثلاً: واش راكم يا جماعة؟"
                className="w-full h-40 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none text-lg"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {PRESET_PHRASES.map((phrase, i) => (
                  <button key={i} onClick={() => handlePresetClick(phrase)} className="text-xs bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-emerald-50 transition-colors">
                    {phrase}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={state.isGenerating || !inputText.trim() || !hasKey}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                state.isGenerating || !hasKey ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white transform active:scale-95'
              }`}
            >
              {state.isGenerating ? "جاري التوليد..." : "توليد الصوت"}
            </button>

            {state.error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{state.error}</span>
                {!hasKey && (
                  <button onClick={handleOpenKeyDialog} className="underline font-bold ml-auto shrink-0">إعداد الآن</button>
                )}
              </div>
            )}

            {state.audioUrl && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">جاهز للاستماع</span>
                </div>
                <audio controls src={state.audioUrl} className="w-full" autoPlay />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                اختر الصوت
              </h3>
              <div className="space-y-2">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full text-right p-3 rounded-xl border transition-all ${
                      selectedVoice === voice.id ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-slate-800">{voice.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${voice.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                        {voice.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">{voice.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
