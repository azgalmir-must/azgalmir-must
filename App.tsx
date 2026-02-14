
import React, { useState, useRef } from 'react';
import { RenderStyle, AppState, ProcessingOptions, AspectRatio, ImageSize, EnvironmentHDRI } from './types';
import { processSketchUpImage, editRenderedImage } from './services/gemini';
import { STYLES_CONFIG, LIGHTING_CONFIG, ASPECT_RATIOS, IMAGE_SIZES, ENVIRONMENT_CONFIG, QUICK_COMMANDS } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState & { isEditing: boolean; editCommand: string }>({
    originalImage: null,
    processedImage: null,
    isProcessing: false,
    isEditing: false,
    editCommand: '',
    options: {
      style: RenderStyle.PHOTOREALISTIC,
      preserveDetails: 90,
      lighting: 'natural',
      aspectRatio: '1:1',
      imageSize: '1K',
      environment: 'downtown',
      customInstruction: ''
    },
    error: null
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({ 
          ...prev, 
          originalImage: event.target?.result as string, 
          processedImage: null,
          error: null 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const checkApiKey = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  const startProcessing = async () => {
    if (!state.originalImage) return;
    if (state.options.imageSize !== '1K') await checkApiKey();

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const result = await processSketchUpImage(state.originalImage, state.options);
      setState(prev => ({ ...prev, processedImage: result, isProcessing: false }));
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleAIEdit = async (suggestedCommand?: string) => {
    const command = suggestedCommand || state.editCommand;
    if (!state.processedImage || !command) return;
    
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    setShowEditModal(false);
    
    try {
      await checkApiKey();
      const result = await editRenderedImage(state.processedImage, command);
      setState(prev => ({ 
        ...prev, 
        processedImage: result, 
        isProcessing: false, 
        editCommand: '' 
      }));
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleError = (err: any) => {
    let errorMessage = err.message;
    if (errorMessage.includes("Requested entity was not found")) {
      errorMessage = "يرجى التأكد من اختيار مفتاح API صالح من مشروع مدفوع.";
    }
    setState(prev => ({ ...prev, error: errorMessage, isProcessing: false }));
  };

  const setOption = <K extends keyof ProcessingOptions>(key: K, value: ProcessingOptions[K]) => {
    setState(prev => ({
      ...prev,
      options: { ...prev.options, [key]: value }
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 font-['Cairo']">
      {/* Header */}
      <header className="h-16 glass sticky top-0 z-50 flex items-center px-6 justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">V</div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">V-Ray AI Suite</h1>
            <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">Architectural Pro Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {state.originalImage && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-bold hover:bg-white/5 rounded-lg transition-colors"
            >
              تغيير الصورة
            </button>
          )}
          <button 
            disabled={!state.originalImage || state.isProcessing}
            onClick={startProcessing}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-full font-bold transition-all shadow-xl shadow-blue-900/30 flex items-center gap-3 active:scale-95"
          >
            {state.isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'بدء الرندر الاحترافي'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 glass border-l border-white/5 p-5 flex flex-col gap-6 overflow-y-auto">
          
          {/* AI Pre-render Instructions Section */}
          <section className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/10">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
              <span className="text-sm">🪄</span>
              توجيهات الذكاء الاصطناعي (Pre-Render)
            </h2>
            <textarea
              value={state.options.customInstruction}
              onChange={(e) => setOption('customInstruction', e.target.value)}
              placeholder="اكتب تعليماتك هنا قبل الرندر... (مثال: أضف مسبحاً، اجعل الواجهة خشبية)"
              className="w-full h-24 bg-black/20 border border-white/5 rounded-xl p-3 text-[11px] outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-600 resize-none text-right"
            />
            <div className="mt-2 flex flex-wrap gap-1 justify-end">
               {['أضف نباتات', 'مبنى خشبي', 'أجواء ماطرة'].map(tag => (
                 <button 
                   key={tag}
                   onClick={() => setOption('customInstruction', tag)}
                   className="text-[9px] bg-white/5 hover:bg-blue-600/20 px-2 py-1 rounded-md transition-all text-slate-400"
                 >
                   +{tag}
                 </button>
               ))}
            </div>
          </section>

          {/* Lighting Section - Restored */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
              أوضاع الإضاءة
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {LIGHTING_CONFIG.map(light => (
                <button
                  key={light.id}
                  onClick={() => setOption('lighting', light.id as any)}
                  className={`p-2 rounded-lg border text-[10px] transition-all flex flex-col items-center gap-1 ${
                    state.options.lighting === light.id 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{light.icon}</span>
                  <span>{light.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Environment HDRI Section */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              بيئة HDRI والموقع
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {ENVIRONMENT_CONFIG.map(env => (
                <button
                  key={env.id}
                  onClick={() => setOption('environment', env.id)}
                  className={`p-3 rounded-xl border transition-all text-right flex items-center justify-between gap-3 ${
                    state.options.environment === env.id 
                      ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs">{env.name}</span>
                    <span className="text-[9px] text-slate-500">{env.desc}</span>
                  </div>
                  <span className="text-xl">{env.icon}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Aspect Ratio Section */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">الأبعاد (Aspect Ratio)</h2>
            <div className="grid grid-cols-5 gap-1">
              {ASPECT_RATIOS.map(ratio => (
                <button
                  key={ratio.id}
                  onClick={() => setOption('aspectRatio', ratio.id)}
                  className={`py-2 rounded-lg border text-[10px] transition-all flex flex-col items-center gap-1 ${
                    state.options.aspectRatio === ratio.id 
                      ? 'border-white bg-white/10' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{ratio.icon}</span>
                  <span className="font-mono">{ratio.id}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Preserve Details Section */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">التزام الخطوط</h2>
              <span className="text-blue-400 font-mono text-[10px] font-bold">{state.options.preserveDetails}%</span>
            </div>
            <input 
              type="range" min="50" max="100" 
              value={state.options.preserveDetails}
              onChange={(e) => setOption('preserveDetails', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </section>

          {/* Render Styles Section */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">نمط الإخراج الفني</h2>
            <div className="grid grid-cols-1 gap-2">
              {STYLES_CONFIG.map(style => (
                <button
                  key={style.id}
                  onClick={() => setOption('style', style.id as RenderStyle)}
                  className={`p-2.5 rounded-xl border transition-all text-right flex items-center justify-between gap-3 ${
                    state.options.style === style.id 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs">{style.name}</span>
                    <span className="text-[9px] text-slate-500 truncate w-40">{style.description}</span>
                  </div>
                  <span className="text-lg">{style.icon}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Image Size Section */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">الدقة النهائية</h2>
            <div className="flex flex-col gap-1.5">
              {IMAGE_SIZES.map(size => (
                <button
                  key={size.id}
                  onClick={() => setOption('imageSize', size.id)}
                  className={`p-2 px-3 rounded-lg border text-xs transition-all flex justify-between items-center ${
                    state.options.imageSize === size.id 
                      ? 'border-white bg-white/10' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="font-bold">{size.name}</span>
                  {size.id !== '1K' && <span className="text-[7px] bg-blue-600 text-white px-1 py-0.5 rounded font-black uppercase">Pro</span>}
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-8 items-center bg-[#0a0f1e]">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />

          {!state.originalImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/5 hover:bg-white/[0.08] hover:border-blue-500/40 transition-all cursor-pointer group"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">رفع لقطة سكيتشوب</h3>
              <p className="text-slate-500 text-sm text-center px-12">قم برفع صورة للمشروع للبدء بعملية الرندر الفائق الواقعية</p>
            </div>
          ) : (
            <div className="w-full max-w-6xl space-y-8">
              
              {state.error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-pulse">{state.error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Original View */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">SketchUp Screenshot</span>
                  </div>
                  <div 
                    className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-black shadow-2xl relative" 
                    style={{ aspectRatio: state.options.aspectRatio.replace(':', '/') }}
                  >
                    <img src={state.originalImage} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Rendered Output View */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">V-Ray AI Output</span>
                    {state.processedImage && !state.isProcessing && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowEditModal(true)}
                          className="px-4 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2"
                        >
                          🪄 تعديل ذكي
                        </button>
                        <button 
                          onClick={() => {const link = document.createElement('a'); link.href = state.processedImage!; link.download = 'render.png'; link.click();}}
                          className="px-4 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase transition-all"
                        >
                          تحميل الرندر
                        </button>
                      </div>
                    )}
                  </div>
                  <div 
                    className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900 shadow-2xl relative flex items-center justify-center" 
                    style={{ aspectRatio: state.options.aspectRatio.replace(':', '/') }}
                  >
                    {state.isProcessing ? (
                      <div className="flex flex-col items-center gap-6 p-8 text-center">
                        <div className="w-16 h-16 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                        <div>
                          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Rendering Scene</p>
                          <p className="text-[10px] text-slate-500 italic">Applying lighting & PBR materials...</p>
                        </div>
                      </div>
                    ) : state.processedImage ? (
                      <img src={state.processedImage} alt="Processed" className="w-full h-full object-cover animate-in fade-in duration-1000" />
                    ) : (
                      <div className="text-center opacity-20">
                         <div className="text-5xl mb-4">🖼️</div>
                         <p className="text-[10px] font-black uppercase tracking-widest">انتظار بدء الرندر</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Smart Edit Modal (Post-Render) */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-xl glass rounded-[2.5rem] p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className="text-blue-500">🪄</span>
                المساعد الذكي للرندر
              </h2>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400">✕</button>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed text-right">أخبر الذكاء الاصطناعي بالتعديلات التي ترغب بها على الصورة المعالجة حالياً.</p>
            
            <textarea
              value={state.editCommand}
              onChange={(e) => setState(prev => ({ ...prev, editCommand: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAIEdit()}
              placeholder="اكتب طلبك هنا... (مثال: أضف أثاثاً مكتبياً، غير لون الواجهة)"
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-right focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
            />

            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              {QUICK_COMMANDS.slice(0, 3).map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => handleAIEdit(cmd.prompt)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-blue-600/20 text-[10px] rounded-lg border border-white/5 transition-all"
                >
                  {cmd.name}
                </button>
              ))}
            </div>

            <button
              disabled={!state.editCommand}
              onClick={() => handleAIEdit()}
              className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center gap-3"
            >
              تنفيذ التعديلات السحرية
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
