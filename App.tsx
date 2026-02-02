
import React, { useState, useRef } from 'react';
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
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    audioUrl: null,
  });

  const audioRef = useRef<HTMLAudioElement>(null);

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
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: err.message || "حدث خطأ أثناء توليد الصوت. حاول مرة أخرى." 
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
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        <section className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-800">صوت واقعي باللهجة الجزائرية</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            تحويل الدارجة الجزائرية إلى كلام مسموع بجودة عالية.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">النص بالدارجة</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="أكتب هنا بالدارجة..."
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
              disabled={state.isGenerating || !inputText.trim()}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                state.isGenerating ? 'bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white transform active:scale-95'
              }`}
            >
              {state.isGenerating ? "جاري التوليد..." : "توليد الصوت"}
            </button>

            {state.error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100">
                {state.error}
              </div>
            )}

            {state.audioUrl && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-4">
                <audio controls src={state.audioUrl} className="w-full" autoPlay />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">اختر الصوت</h3>
              <div className="space-y-2">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full text-right p-3 rounded-xl border transition-all ${
                      selectedVoice === voice.id ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="font-bold text-sm">{voice.name}</div>
                    <div className="text-[10px] text-slate-500">{voice.description}</div>
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
