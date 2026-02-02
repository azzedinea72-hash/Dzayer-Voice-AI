
import React, { useState, useEffect } from 'react';
import { VoiceName, VoiceOption, GenerationState, AlgerianRegion, RegionOption } from './types.ts';
import { generateAlgerianSpeech } from './geminiService.ts';

const VOICE_OPTIONS: VoiceOption[] = [
  { id: VoiceName.Zephyr, name: 'زفير', gender: 'female', description: 'حيوي ومتحمس', persona: 'شابة جامعية حيويّة' },
  { id: VoiceName.Aoede, name: 'آويدي', gender: 'female', description: 'ناعم وهادئ', persona: 'صوت مثقف وهادئ جداً' },
  { id: VoiceName.Kore, name: 'كوري', gender: 'female', description: 'رسمي وواضح', persona: 'مذيعة أخبار رسمية' },
  { id: VoiceName.Puck, name: 'باك', gender: 'male', description: 'قوي وعميق', persona: 'رجل في الأربعين، وقور' },
  { id: VoiceName.Fenrir, name: 'فينرير', gender: 'male', description: 'ودود وشبابي', persona: 'شاب جزائري "فهّامة" وودود' },
  { id: VoiceName.Charon, name: 'شارون', gender: 'male', description: 'متزن وثقيل', persona: 'صوت حكيم وناضج' },
];

const REGION_OPTIONS: RegionOption[] = [
  { id: 'neutral', name: 'لهجة بيضاء', icon: '🇩🇿', description: 'مفهومة من طرف الجميع' },
  { id: 'alger', name: 'عاصمية', icon: '🏙️', description: 'لكنة وسط البلاد (دزاير)' },
  { id: 'oran', name: 'وهرانية', icon: '🌅', description: 'لكنة الغرب الباهي' },
  { id: 'constantine', name: 'قسنطينية', icon: '🌉', description: 'لكنة الشرق العريق' },
  { id: 'sahara', name: 'صحراوية', icon: '🌴', description: 'لكنة الجنوب الأصيل' },
];

const PRESET_PHRASES = [
  "يا خويا واش راك؟ توحشناك بزاف!",
  "أرواح تشرب القهوة، راهي واجدة وسخونة",
  "الجزائر قارة، من الشمال للجنوب كلش شباب",
  "بشوية برك، كل عطلة فيها خير"
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Zephyr);
  const [selectedRegion, setSelectedRegion] = useState<AlgerianRegion>('neutral');
  const [isKeyReady, setIsKeyReady] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    audioUrl: null,
  });

  useEffect(() => {
    const checkKeyStatus = async () => {
      try {
        // التحقق مما إذا كان المفتاح موجوداً في البيئة أو تم اختياره مسبقاً
        const hasKey = await (window as any).aistudio?.hasSelectedApiKey?.();
        setIsKeyReady(!!process.env.API_KEY || !!hasKey);
      } catch (e) {
        setIsKeyReady(!!process.env.API_KEY);
      } finally {
        setCheckingKey(false);
      }
    };
    checkKeyStatus();
  }, []);

  const handleOpenKeySelector = async () => {
    try {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        // بمجرد استدعاء النافذة، نفترض النجاح للمضي قدماً في واجهة التطبيق
        setIsKeyReady(true);
      } else {
        alert("خاصية اختيار المفتاح غير مدعومة في هذا المتصفح.");
      }
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setState(p => ({ ...p, isGenerating: true, error: null }));

    try {
      const url = await generateAlgerianSpeech(inputText, selectedVoice, selectedRegion);
      setState(p => ({ ...p, audioUrl: url, isGenerating: false }));
    } catch (err: any) {
      console.error(err);
      let msg = "حدث خطأ أثناء الاتصال بالخادم.";
      
      // إذا فشل الطلب بسبب المفتاح، نعيد المستخدم لواجهة التفعيل
      if (err.message?.includes("not found") || err.message === "KEY_NOT_FOUND") {
        setIsKeyReady(false);
        msg = "يرجى إعادة تفعيل المحرك باختيار مفتاح API صالح.";
      }
      
      setState(p => ({ ...p, isGenerating: false, error: msg }));
    }
  };

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isKeyReady) {
    return (
      <div className="min-h-screen bg-[#006233] flex items-center justify-center p-6 text-right" dir="rtl">
        <div className="bg-white rounded-[2.5rem] p-12 max-w-lg w-full shadow-2xl text-center border-t-8 border-red-600">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">تفعيل Dzayer Voice AI</h2>
          <p className="text-slate-500 mb-10 leading-relaxed text-lg">
            لتشغيل التطبيق على Netlify دون إعدادات معقدة، يرجى الضغط على الزر أدناه لاختيار مفتاح الـ API الخاص بك من Google.
          </p>
          <button 
            onClick={handleOpenKeySelector}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            <span>بدء تشغيل المحرك</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center gap-4 grayscale opacity-50">
             <div className="w-8 h-5 bg-emerald-600 rounded"></div>
             <div className="w-8 h-5 bg-white border border-slate-200 rounded"></div>
             <div className="w-8 h-5 bg-red-600 rounded"></div>
          </div>
          <p className="mt-4 text-[10px] text-slate-400">لا يتطلب إعداد "Environment Variables" في Netlify</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-emerald-100 shadow-lg">DZ</div>
            <div>
              <h1 className="font-black text-slate-900 leading-none">Dzayer Voice</h1>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Premium AI Engine</span>
            </div>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="text-[10px] font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50 transition-colors"
          >
            تغيير المفتاح
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Input Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800 text-lg">اكتب بالدارجة الجزائرية</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">Input Field</span>
              </div>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="مثلاً: واش راك خويا؟ لاباس عليك؟ توحشنا القعدة معاكم..."
                className="w-full h-56 bg-transparent text-2xl outline-none resize-none placeholder-slate-200 font-medium"
              />

              <div className="mt-6 flex flex-wrap gap-2">
                {PRESET_PHRASES.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setInputText(p)} 
                    className="text-xs bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 px-4 py-2.5 rounded-xl border border-slate-100 transition-all font-medium"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Selector */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
              <h3 className="font-black text-slate-800 text-lg mb-6">تخصيص اللهجة الجهوية</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {REGION_OPTIONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegion(r.id)}
                    className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${
                      selectedRegion === r.id 
                        ? 'border-emerald-500 bg-emerald-50 shadow-md transform -translate-y-1' 
                        : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-3xl mb-2">{r.icon}</span>
                    <span className="font-bold text-sm text-slate-800">{r.name}</span>
                    <span className="text-[9px] text-slate-400 mt-1 text-center leading-tight">{r.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={state.isGenerating || !inputText}
              className={`w-full py-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 ${
                state.isGenerating 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-200'
              }`}
            >
              {state.isGenerating ? (
                <>
                  <div className="w-6 h-6 border-4 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  جاري معالجة الصوت...
                </>
              ) : (
                "توليد الصوت الجزائري"
              )}
            </button>

            {state.error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-sm font-bold border border-red-100 animate-bounce text-center">
                {state.error}
              </div>
            )}

            {state.audioUrl && (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-b-[8px] border-emerald-500 animate-in slide-in-from-bottom-6 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">الصوت جاهز الآن</h4>
                    <p className="text-xs text-slate-400">بصوت {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name} - لهجة {REGION_OPTIONS.find(r => r.id === selectedRegion)?.name}</p>
                  </div>
                </div>
                <audio controls src={state.audioUrl} className="w-full" autoPlay />
              </div>
            )}
          </div>

          {/* Sidebar: Voice Selection */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 sticky top-28">
              <h3 className="font-black text-slate-800 text-lg mb-6 flex justify-between items-center">
                اختر المعلق
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {VOICE_OPTIONS.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`w-full text-right p-5 rounded-3xl border-2 transition-all relative overflow-hidden ${
                      selectedVoice === v.id 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md' 
                        : 'border-slate-50 hover:border-slate-200 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-slate-800">{v.name}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${v.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                        {v.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 mb-1">{v.persona}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{v.description}</div>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <h5 className="font-black text-xs mb-2 text-emerald-400">💡 نصيحة ذكية</h5>
                <p className="text-[10px] leading-relaxed text-slate-300">
                  للحصول على نطق ممتاز للهجة الوهرانية أو القسنطينية، حاول كتابة الكلمات كما تُنطق في تلك الجهة.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
