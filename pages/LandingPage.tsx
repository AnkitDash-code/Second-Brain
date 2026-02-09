import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Mic, Image as ImageIcon, Video, ArrowRight, Activity, ShieldCheck, Sparkles, Database, Lock } from 'lucide-react';
import clsx from 'clsx';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Navigation */}
      <nav className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex justify-between items-center",
        scrollY > 50 ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}>
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-xl">
             <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Second Brain</span>
        </div>
        <button 
          onClick={() => navigate('/onboarding')}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background Gradients */}
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float delay-100" />
        <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float delay-200" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-600">Powered by Gemini 1.5 Pro</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 animate-fade-in-up delay-100 leading-tight">
             Your External <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 animate-gradient">
               Memory Upgrade
             </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
            Capture everything—voice, photos, videos. Let AI organize, remember, and recall it for you instantly.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <button 
              onClick={() => navigate('/onboarding')}
              className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white rounded-2xl font-semibold text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 hover:scale-105 flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
               onClick={() => {
                 document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="w-full md:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold text-lg hover:bg-slate-50 transition-all"
            >
              How it works
            </button>
          </div>

          {/* Floating UI Cards */}
          <div className="mt-20 relative h-[400px] w-full max-w-4xl mx-auto hidden md:block">
             <div className="absolute left-0 top-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 w-64 animate-float delay-100 transform -rotate-3">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-purple-100 rounded-lg"><Mic className="w-5 h-5 text-purple-600" /></div>
                   <div className="h-2 w-24 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-2">
                   <div className="h-2 w-full bg-slate-100 rounded-full" />
                   <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                </div>
             </div>

             <div className="absolute right-0 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 w-72 animate-float delay-300 transform rotate-3">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-blue-100 rounded-lg"><ImageIcon className="w-5 h-5 text-blue-600" /></div>
                   <div className="h-2 w-24 bg-slate-100 rounded-full" />
                </div>
                <div className="h-32 bg-slate-100 rounded-lg mb-2" />
                <div className="flex gap-2">
                   <div className="h-6 w-16 bg-blue-50 rounded-full" />
                   <div className="h-6 w-16 bg-blue-50 rounded-full" />
                </div>
             </div>
             
             <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 w-80 animate-float z-10">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-lg">Recall</h3>
                   <Sparkles className="w-5 h-5 text-primary-500" />
                </div>
                <div className="space-y-4">
                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-600">"Where did I leave my keys?"</p>
                   </div>
                   <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
                      <p className="text-sm text-primary-800 font-medium">"You left them on the kitchen counter near the coffee machine at 8:30 AM."</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything in one place</h2>
            <p className="text-xl text-slate-500">Capture life as it happens. We handle the rest.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: "Voice Capture",
                desc: "Speak naturally. We transcribe, summarize, and extract action items instantly.",
                color: "bg-purple-100 text-purple-600"
              },
              {
                icon: ImageIcon,
                title: "Visual Memory",
                desc: "Snap photos of receipts, whiteboards, or moments. AI understands context.",
                color: "bg-blue-100 text-blue-600"
              },
              {
                icon: Video,
                title: "Video Analysis",
                desc: "Record videos to capture the full scene. We analyze movement and details.",
                color: "bg-pink-100 text-pink-600"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.color)}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
         <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-4xl font-bold mb-6">Not just storage.<br/>Intelligence.</h2>
               <div className="space-y-8">
                  {[
                    { icon: Database, title: "Semantic Search", desc: "Don't search by keywords. Search by meaning. 'The funny dog video' works." },
                    { icon: ShieldCheck, title: "Privacy First", desc: "Your memories are encrypted and private. Caregiver mode available." },
                    { icon: Activity, title: "Health Insights", desc: "Track mood patterns and behavioral changes over time." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="mt-1 bg-slate-800 p-3 rounded-xl h-fit">
                          <item.icon className="w-6 h-6 text-primary-400" />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                          <p className="text-slate-400">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />
               <div className="relative bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                  {/* Mock UI for Insights */}
                  <div className="mb-6 flex justify-between items-center">
                     <span className="font-semibold text-slate-300">Weekly Insights</span>
                     <span className="text-sm text-slate-500">Just now</span>
                  </div>
                  <div className="space-y-4">
                     <div className="h-32 bg-slate-700/50 rounded-xl flex items-end p-4 gap-2">
                        {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                           <div key={i} className="flex-1 bg-primary-500/80 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                     </div>
                     <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-700">
                        <p className="text-sm text-slate-300">"You've been more active in the mornings this week. Mood has improved by 15%."</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white text-center px-6">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-slate-900 mb-8">Ready to upgrade your mind?</h2>
            <p className="text-xl text-slate-500 mb-10">Join thousands of users who trust Second Brain to remember what matters most.</p>
            <button 
              onClick={() => navigate('/onboarding')}
              className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-black transition-all shadow-xl hover:scale-105"
            >
              Start Free Trial
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200">
         <div className="max-w-6xl mx-auto px-6 text-center text-slate-500">
            <p>&copy; 2026 Second Brain. Built with Gemini & Convex.</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
