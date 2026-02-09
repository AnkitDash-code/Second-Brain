import React, { useState, useEffect } from 'react';
import { getAllMemories } from '../services/db';
import { generateStory, generateStoryVideo, generateStorySpeech } from '../services/gemini';
import { Memory } from '../types';
import { BookOpen, Sparkles, Loader2, Calendar, Video, Play, Volume2, UserCircle } from 'lucide-react';

const Stories: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [story, setStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeRange, setTimeRange] = useState('All Time');
  
  // Media State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMediaGenerating, setIsMediaGenerating] = useState(false);

  useEffect(() => {
    getAllMemories().then(setMemories);
  }, []);

  const handleGenerate = async (range: string) => {
    setIsGenerating(true);
    setVideoUrl(null);
    setAudioUrl(null);
    setTimeRange(range);
    
    // Simple filter simulation
    let filtered = memories;
    const now = Date.now();
    if (range === 'Last 7 Days') {
      filtered = memories.filter(m => now - m.timestamp < 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'Last 30 Days') {
      filtered = memories.filter(m => now - m.timestamp < 30 * 24 * 60 * 60 * 1000);
    }

    try {
      const result = await generateStory(filtered, range);
      setStory(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMedia = async () => {
     if (!story) return;
     setIsMediaGenerating(true);
     try {
        // Run in parallel
        const [vid, aud] = await Promise.all([
          generateStoryVideo(story.substring(0, 200)), // Summary for video prompt
          generateStorySpeech(story)
        ]);
        if (vid) setVideoUrl(vid);
        if (aud) setAudioUrl(aud);
     } catch (e) {
       console.error(e);
       alert("Could not generate media. Please try again.");
     } finally {
       setIsMediaGenerating(false);
     }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-0">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-calm-900 mb-1 flex items-center gap-2 accessibility-text">
          <BookOpen className="text-primary-600" /> Story Mode
        </h1>
        <p className="text-gray-500 accessibility-text">Turn your disjointed memories into a beautiful narrative.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 accessibility-text">
              <Calendar className="w-4 h-4" /> Time Range
            </h2>
            <div className="space-y-2">
              {['Last 7 Days', 'Last 30 Days', 'All Time'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleGenerate(range)}
                  disabled={isGenerating}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-gray-600 text-sm font-medium flex justify-between items-center group accessibility-text"
                >
                  {range}
                  <Sparkles className="w-4 h-4 text-gray-300 group-hover:text-primary-500" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
             <p className="text-blue-800 text-sm italic accessibility-text">
               "Story Mode helps you reconnect with your week by weaving small moments into a cohesive tale."
             </p>
          </div>
        </div>

        {/* Story Output */}
        <div className="md:col-span-2">
          <div className="bg-white min-h-[400px] rounded-2xl border border-gray-200 shadow-sm p-8 relative overflow-hidden">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                <p className="text-gray-500 animate-pulse">Writing your story...</p>
              </div>
            ) : story ? (
              <div>
                 {/* Visual Summary Section */}
                 {(videoUrl || audioUrl) && (
                    <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video relative group border border-gray-200 shadow-inner">
                       {videoUrl ? (
                         <video 
                           src={videoUrl} 
                           className="w-full h-full object-cover" 
                           autoPlay 
                           loop 
                           muted 
                         />
                       ) : (
                         <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <UserCircle className="text-gray-300 w-20 h-20" />
                         </div>
                       )}
                       
                       <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          {audioUrl && (
                            <audio controls src={audioUrl} className="h-10 w-full" />
                          )}
                       </div>
                    </div>
                 )}

                 <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-2xl font-serif font-bold text-gray-900 accessibility-text">
                      My Story: {timeRange}
                    </h3>
                    {!videoUrl && !isMediaGenerating && (
                       <button 
                         onClick={handleGenerateMedia}
                         className="flex items-center gap-2 text-xs bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                       >
                         <UserCircle className="w-4 h-4" /> Generate Storyteller Avatar
                       </button>
                    )}
                    {isMediaGenerating && (
                       <span className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full font-medium">
                         <Loader2 className="w-3 h-3 animate-spin" /> Generating Avatar & Voice...
                       </span>
                    )}
                 </div>

                <div className="prose prose-lg prose-indigo max-w-none">
                  <div className="whitespace-pre-wrap leading-loose font-serif text-gray-700 accessibility-text">
                    {story}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg accessibility-text">Select a time range to generate a story.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stories;