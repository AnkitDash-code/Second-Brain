
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Mic, Image as ImageIcon, FileText, Send, StopCircle, Loader2, Camera, Video } from 'lucide-react';
import clsx from 'clsx';
import { Memory, MemoryType, ProcessingStatus, Sentiment, ActionItem } from '../types';
import { addMemory } from '../services/store';
import { analyzeImage, processAudio, analyzeText, analyzeVideo } from '../services/gemini';
import { useAuth } from '../contexts/AuthContext';

const Capture: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MemoryType>(MemoryType.AUDIO);
  const [textInput, setTextInput] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Convex mutation for file upload
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileRecord = useMutation(api.files.saveFile);

  /**
   * Upload a file (Blob/File) to Convex storage and return the serving URL.
   */
  const uploadToConvex = async (file: Blob, memoryId: string, userId: string): Promise<string | undefined> => {
    try {
      // Step 1: Get a short-lived upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Step 2: POST the file to the upload URL
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const { storageId } = await result.json();

      // Step 3: Save the file record in Convex DB (for tracking/cleanup)
      await saveFileRecord({ storageId, memoryId, userId });

      // Step 4: Construct the HTTP serving URL
      // Convex site URL follows the pattern: replace .cloud with .site in VITE_CONVEX_URL
      const convexUrl = (import.meta as any).env?.VITE_CONVEX_URL || '';
      const siteUrl = convexUrl.replace('.cloud', '.site');
      return `${siteUrl}/getFile?storageId=${encodeURIComponent(storageId)}`;
    } catch (error) {
      console.error("Convex upload error:", error);
      return undefined;
    }
  };

  const handleSave = async (
    content: string, 
    mediaContent: string | undefined, 
    tags: string[] = [], 
    sentiment: Sentiment = 'neutral',
    entities: string[] = [],
    action?: ActionItem
  ) => {
    if (!user) return;
    setStatus('saving');
    const memoryId = `${user.uid}_${crypto.randomUUID()}`;

    const newMemory: Memory = {
      id: memoryId,
      userId: user.uid,
      type: activeTab,
      content: content,
      timestamp: Date.now(),
      tags,
      verified: false,
      sentiment,
      entities,
      ...(mediaContent ? { mediaContent } : {}),
      ...(action?.type !== 'none' ? { action } : {})
    };
    await addMemory(newMemory);
    setStatus('success');
    setTimeout(() => navigate('/'), 1000);
  };

  const submitText = async () => {
    if (!textInput.trim()) return;
    setStatus('processing');
    const result = await analyzeText(textInput);
    await handleSave(result.content, undefined, result.tags, result.sentiment, result.entities, result.action);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const processMedia = async () => {
    if (!selectedFile || !user) return;
    setStatus('processing');
    
    // Analyze with Gemini first (still needs the raw file)
    let result;
    if (activeTab === MemoryType.IMAGE) {
      result = await analyzeImage(selectedFile);
    } else if (activeTab === MemoryType.VIDEO) {
      result = await analyzeVideo(selectedFile);
    }
    if (!result) return;

    // Upload file to Convex storage
    const memoryId = `${user.uid}_${crypto.randomUUID()}`;
    const mediaUrl = await uploadToConvex(selectedFile, memoryId, user.uid);

    // Save with the Convex storage reference instead of base64
    setStatus('saving');
    const newMemory: Memory = {
      id: memoryId,
      userId: user.uid,
      type: activeTab,
      content: result.content,
      mediaContent: mediaUrl,
      timestamp: Date.now(),
      tags: result.tags,
      verified: false,
      sentiment: result.sentiment,
      entities: result.entities,
      action: result.action?.type !== 'none' ? result.action : undefined,
    };
    await addMemory(newMemory);
    setStatus('success');
    setTimeout(() => navigate('/'), 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsRecording(false);
        setStatus('processing');

        // Analyze audio with Gemini
        const result = await processAudio(audioBlob);

        // Upload audio to Convex
        if (!user) return;
        const memoryId = `${user.uid}_${crypto.randomUUID()}`;
        const mediaUrl = await uploadToConvex(audioBlob, memoryId, user.uid);

        // Save with the Convex URL instead of base64
        setStatus('saving');
        const newMemory: Memory = {
          id: memoryId,
          userId: user.uid,
          type: activeTab,
          content: result.content,
          mediaContent: mediaUrl,
          timestamp: Date.now(),
          tags: result.tags,
          verified: false,
          sentiment: result.sentiment,
          entities: result.entities,
          action: result.action?.type !== 'none' ? result.action : undefined,
        };
        await addMemory(newMemory);
        setStatus('success');
        setTimeout(() => navigate('/'), 1000);
      };
    }
  };

  return (
    <div className="p-4 md:p-0 max-w-3xl mx-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-calm-900">Capture Memory</h1>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl mb-6 shadow-inner">
        {[
          { id: MemoryType.AUDIO, icon: Mic, label: 'Voice' },
          { id: MemoryType.IMAGE, icon: ImageIcon, label: 'Photo' },
          { id: MemoryType.VIDEO, icon: Video, label: 'Video' },
          { id: MemoryType.TEXT, icon: FileText, label: 'Text' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setStatus('idle');
              setPreviewUrl(null);
              setSelectedFile(null);
              setTextInput('');
            }}
            className={clsx(
              "flex-1 flex items-center justify-center py-3 rounded-lg text-sm font-semibold transition-all",
              activeTab === tab.id ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-200 md:p-8 flex flex-col justify-center relative overflow-hidden">
        {activeTab === MemoryType.TEXT && (
          <div className="flex flex-col h-full">
            <textarea
              className="flex-1 w-full p-4 rounded-xl border border-gray-200 resize-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 focus:outline-none text-lg md:text-xl leading-relaxed"
              placeholder="What's on your mind today?"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={status !== 'idle'}
            />
            <button
              onClick={submitText}
              disabled={!textInput.trim() || status !== 'idle'}
              className="mt-4 w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {status === 'processing' || status === 'saving' ? (
                 <><Loader2 className="animate-spin mr-2" /> Analyzing...</>
              ) : (
                 <><Send className="mr-2" /> Save Note</>
              )}
            </button>
          </div>
        )}

        {activeTab === MemoryType.AUDIO && (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className={clsx(
              "w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500",
              isRecording ? "bg-red-50 ring-4 ring-red-100 scale-110" : "bg-gray-50"
            )}>
              {isRecording ? (
                <div className="w-20 h-20 bg-red-500 rounded-lg animate-pulse shadow-lg shadow-red-200" />
              ) : (
                <Mic className="w-24 h-24 text-gray-300" />
              )}
            </div>
            
            <p className="text-gray-500 font-medium text-lg">
              {status === 'processing' ? 'Thinking & Analyzing...' : isRecording ? 'Listening...' : 'Tap to start recording'}
            </p>

            {status === 'processing' || status === 'saving' ? (
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={clsx(
                  "w-full md:w-auto md:min-w-[200px] px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center text-white transition-all shadow-md",
                  isRecording ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-primary-600 hover:bg-primary-700 shadow-primary-200"
                )}
              >
                {isRecording ? <><StopCircle className="mr-2" /> Stop Recording</> : <><Mic className="mr-2" /> Start Recording</>}
              </button>
            )}
          </div>
        )}

        {(activeTab === MemoryType.IMAGE || activeTab === MemoryType.VIDEO) && (
          <div className="flex flex-col h-full">
            <div 
              className="flex-1 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                activeTab === MemoryType.VIDEO ? (
                  <video src={previewUrl} controls className="absolute inset-0 w-full h-full object-contain bg-black" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain bg-black" />
                )
              ) : (
                <div className="text-center p-6">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 mx-auto group-hover:scale-110 transition-transform">
                     {activeTab === MemoryType.VIDEO ? <Video className="w-10 h-10 text-gray-400" /> : <Camera className="w-10 h-10 text-gray-400" />}
                  </div>
                  <p className="text-gray-500 font-medium">Click to upload or capture {activeTab === MemoryType.VIDEO ? 'video' : 'photo'}</p>
                </div>
              )}
              <input 
                type="file" 
                accept={activeTab === MemoryType.VIDEO ? "video/*" : "image/*"}
                capture="environment" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
              />
            </div>

            <button
              onClick={processMedia}
              disabled={!selectedFile || status !== 'idle'}
              className="mt-4 w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-primary-200 transition-all"
            >
              {status === 'processing' || status === 'saving' ? (
                 <><Loader2 className="animate-spin mr-2" /> Analyzing...</>
              ) : (
                 <><Send className="mr-2" /> Analyze & Save</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Capture;
