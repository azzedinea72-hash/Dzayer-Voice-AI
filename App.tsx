
import React, { useState, useCallback, useRef } from 'react';
import { VoiceName, VoiceOption, GenerationState } from './types';
import { generateAlgerianSpeech } from './geminiService';

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
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: "حدث خطأ أثناء توليد الصوت. حاول مرة أخرى." 
      }));
    }
  };

  const handlePresetClick = (phrase: string) => {
    setInputText(phrase);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar / Header */}
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
        <div className="hidden md:flex gap-4">
          <span className="text-sm font-medium text-slate-400">تحويل النص إلى كلام (TTS)</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        <section className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-800">صوت واقعي باللهجة الجزائرية</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            أول منصة متطورة تستخدم تقنيات Gemini لتوليد أصوات جزائرية (الدارجة) بجودة خرافية وواقعية مذهلة.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">النص المراد تحويله</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="أكتب هنا بالدارجة... مثلاً: واش راكم يا جماعة؟"
                className="w-full h-40 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none text-lg"
              />
              
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">أمثلة سريعة</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PHRASES.map((phrase, i) => (
                    <button
                      key={i}
                      onClick={() => handlePresetClick(phrase)}
                      className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls & Result */}
            <div className="flex flex-col gap-4">
              <button
                onClick={handleGenerate}
                disabled={state.isGenerating || !inputText.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                  state.isGenerating 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {state.isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    توليد الصوت
                  </>
                )}
              </button>

              {state.error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {state.error}
                </div>
              )}

              {state.audioUrl && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-emerald-800">الصوت المُولد</h3>
                    <a 
                      href={state.audioUrl} 
                      download="dzayer-voice.wav" 
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-emerald-600 font-bold"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      تحميل
                    </a>
                  </div>
                  <audio ref={audioRef} controls src={state.audioUrl} className="w-full" autoPlay />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                اختيار نبرة الصوت
              </h3>
              <div className="space-y-3">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full text-right p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      selectedVoice === voice.id
                        ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{voice.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        voice.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {voice.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {voice.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-900 rounded-2xl p-6 text-emerald-50 shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold mb-2">كيف تحصل على أفضل نتيجة؟</h4>
                <ul className="text-xs space-y-2 text-emerald-200 list-disc list-inside">
                  <li>أكتب الكلمات كما تُنطق في الواقع.</li>
                  <li>استخدم التشكيل إذا لزم الأمر للتوضيح.</li>
                  <li>قسّم الجمل الطويلة لضمان سلاسة التنفس.</li>
                  <li>اختر الصوت المناسب لطبيعة المحتوى.</li>
                </ul>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-800 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 py-10 text-center">
        <p className="text-sm text-slate-500">تم التطوير لدعم المحتوى الجزائري بالذكاء الاصطناعي</p>
        <div className="flex justify-center gap-2 mt-4 grayscale opacity-60">
           <div className="w-8 h-5 bg-emerald-600"></div>
           <div className="w-8 h-5 bg-white border border-slate-200"></div>
           <div className="w-8 h-5 bg-red-600"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
