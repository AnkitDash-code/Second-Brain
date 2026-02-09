import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Loader2, Mic, MicOff, X } from 'lucide-react';

interface LiveVoiceProps {
  onClose: () => void;
}

const LiveVoice: React.FC<LiveVoiceProps> = ({ onClose }) => {
  const [connected, setConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); // Store session object
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    connectToGeminiLive();
    return () => {
      disconnect();
    };
  }, []);

  const disconnect = () => {
    if (sessionRef.current) {
        // Close session if method exists, though SDK might handle it via connection close
        // sessionRef.current.close(); 
    }
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setConnected(false);
  };

  const connectToGeminiLive = async () => {
    try {
      const apiKey = process.env.API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const inputNode = inputAudioContextRef.current.createGain();
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: "You are a gentle, patient assistant for someone with memory difficulties. Keep answers concise, warm, and supportive.",
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Connected");
            setConnected(true);
            
            // Setup Audio Processing
            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
               if (isMuted) return; // Simple mute logic
               const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
               const pcmBlob = createBlob(inputData);
               
               sessionPromise.then((session) => {
                 session.sendRealtimeInput({ media: pcmBlob });
               });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
               const ctx = outputAudioContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               
               source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
               });
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setConnected(false);
          },
          onerror: (err) => {
            console.error("Live API Error", err);
            setError("Connection error. Please restart.");
          }
        }
      });
      
      sessionRef.current = await sessionPromise;

    } catch (e) {
      console.error(e);
      setError("Failed to access microphone or connect.");
    }
  };

  // Helpers
  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    
    return {
      data: b64,
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
     const dataInt16 = new Int16Array(data.buffer);
     const frameCount = dataInt16.length / numChannels;
     const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
     for(let c=0; c < numChannels; c++) {
        const channelData = buffer.getChannelData(c);
        for(let i=0; i<frameCount; i++) {
           channelData[i] = dataInt16[i*numChannels + c] / 32768.0;
        }
     }
     return buffer;
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in">
      <div className="absolute top-4 right-4">
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000 ${connected ? 'bg-primary-500/20 animate-pulse' : 'bg-gray-800'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${connected ? 'bg-primary-500 shadow-[0_0_50px_rgba(14,165,233,0.5)]' : 'bg-gray-600'}`}>
            {connected ? <Mic className="w-8 h-8 text-white" /> : <Loader2 className="w-8 h-8 text-white animate-spin" />}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Live Voice Assistant</h2>
          <p className="text-gray-400 max-w-sm">
            {connected ? "Listening... I'm here to help you recall memories or just chat." : "Connecting to Gemini Live..."}
          </p>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>

        {connected && (
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 ${isMuted ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white'}`}
           >
             {isMuted ? <><MicOff className="w-4 h-4" /> Muted</> : <><Mic className="w-4 h-4" /> Mute Mic</>}
           </button>
        )}
      </div>
    </div>
  );
};

export default LiveVoice;