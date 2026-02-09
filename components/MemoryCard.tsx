import React, { useState } from 'react';
import { Memory, MemoryType } from '../types';
import { Calendar, Image as ImageIcon, Mic, FileText, Trash2, CheckCircle, ShieldCheck, CheckSquare, Users, Video, Activity } from 'lucide-react';
import clsx from 'clsx';

interface MemoryCardProps {
  memory: Memory;
  onDelete: (id: string) => void;
  isCaregiverMode?: boolean;
  onVerify?: (id: string) => void;
  onToggleAction?: (id: string) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onDelete, isCaregiverMode, onVerify, onToggleAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(memory.timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const time = new Date(memory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Sentiment Color Logic
  const sentimentColor = {
    positive: 'border-green-300 bg-green-50/50',
    negative: 'border-orange-300 bg-orange-50/50',
    neutral: 'border-gray-100 bg-white'
  }[memory.sentiment || 'neutral'];

  const getIcon = () => {
    switch (memory.type) {
      case MemoryType.AUDIO: return <Mic className="w-5 h-5 text-purple-500" />;
      case MemoryType.IMAGE: return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case MemoryType.TEXT: return <FileText className="w-5 h-5 text-emerald-500" />;
      case MemoryType.VIDEO: return <Video className="w-5 h-5 text-pink-500" />;
    }
  };

  const renderContent = () => {
    if (memory.type === MemoryType.IMAGE && memory.mediaContent) {
      return (
        <div className="mt-3">
          <img 
            src={memory.mediaContent} 
            alt="Memory" 
            className="rounded-lg max-h-60 object-cover w-full border border-gray-200" 
            loading="lazy"
          />
          <p className="mt-2 text-gray-700 italic text-sm accessibility-text">{memory.content}</p>
        </div>
      );
    }
    if (memory.type === MemoryType.VIDEO && memory.mediaContent) {
       return (
        <div className="mt-3">
          <video 
            src={memory.mediaContent} 
            controls
            className="rounded-lg max-h-60 w-full border border-gray-200 bg-black" 
          />
          <p className="mt-2 text-gray-700 italic text-sm accessibility-text">{memory.content}</p>
        </div>
      );
    }
    if (memory.type === MemoryType.AUDIO) {
       return (
         <div className="mt-3">
            <p className="text-gray-800 mb-2 accessibility-text">"{memory.content}"</p>
            {memory.mediaContent && (
              <audio controls className="w-full h-10">
                <source src={memory.mediaContent} />
                Your browser does not support the audio element.
              </audio>
            )}
         </div>
       );
    }
    return <p className="mt-2 text-gray-800 whitespace-pre-wrap accessibility-text">{memory.content}</p>;
  };

  return (
    <div className={clsx(
      "rounded-xl p-5 shadow-sm border mb-4 hover:shadow-md transition-shadow relative overflow-hidden",
      sentimentColor,
      memory.verified && "ring-2 ring-green-400 ring-offset-2"
    )}>
       {/* Sentiment Indicator Strip */}
       {memory.sentiment === 'negative' && <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />}
       {memory.sentiment === 'positive' && <div className="absolute top-0 left-0 w-1 h-full bg-green-400" />}

      <div className="flex justify-between items-start pl-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-full relative">
            {getIcon()}
            {memory.verified && (
               <div className="absolute -top-1 -right-1 bg-white rounded-full">
                 <CheckCircle className="w-4 h-4 text-green-500 fill-green-100" />
               </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-1 accessibility-text">
              <Calendar className="w-3 h-3" /> {date} • {time}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
               {memory.tags.map(tag => (
                 <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full accessibility-text">
                   #{tag}
                 </span>
               ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isCaregiverMode && onVerify && (
            <button
              onClick={() => onVerify(memory.id)}
              className={`p-1.5 rounded-full transition-colors ${memory.verified ? 'bg-green-100 text-green-600' : 'text-gray-300 hover:bg-green-50 hover:text-green-500'}`}
              title="Verify Memory"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => onDelete(memory.id)}
            className="text-gray-300 hover:text-red-400 p-1"
            aria-label="Delete memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`mt-2 pl-2 ${!isExpanded && memory.type === MemoryType.TEXT ? 'line-clamp-3' : ''}`}>
        {renderContent()}
      </div>

      {/* Confidence Score Visualization */}
      {memory.confidenceScore !== undefined && (
        <div className="ml-2 mt-2 flex items-center gap-2" title="AI Confidence Score">
           <Activity className={clsx("w-3 h-3", memory.confidenceScore > 0.8 ? "text-green-500" : "text-amber-500")} />
           <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
             <div 
               className={clsx("h-full rounded-full", memory.confidenceScore > 0.8 ? "bg-green-500" : "bg-amber-500")} 
               style={{ width: `${memory.confidenceScore * 100}%` }}
             />
           </div>
           <span className="text-[10px] text-gray-400 font-mono">{(memory.confidenceScore * 100).toFixed(0)}% Conf.</span>
        </div>
      )}

      {/* Action Item Section */}
      {memory.action && (
        <div className="mt-4 ml-2 p-3 bg-white/80 rounded-lg border border-indigo-100 flex items-start gap-3">
          <button 
            onClick={() => onToggleAction && onToggleAction(memory.id)}
            className={clsx(
              "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors",
              memory.action.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 hover:border-indigo-400"
            )}
          >
            {memory.action.completed && <CheckSquare className="w-3.5 h-3.5" />}
          </button>
          <div className={clsx("flex-1 text-sm", memory.action.completed && "line-through text-gray-400")}>
            <p className="font-semibold text-indigo-900 accessibility-text">
              {memory.action.type === 'event' ? '📅 Event Detected' : '✅ Task Detected'}
            </p>
            <p className="text-gray-700 accessibility-text">{memory.action.description}</p>
            {memory.action.date && <p className="text-xs text-gray-500 mt-1 accessibility-text">{memory.action.date}</p>}
          </div>
        </div>
      )}

      {/* Entities Section */}
      {memory.entities && memory.entities.length > 0 && (
        <div className="mt-3 ml-2 flex flex-wrap gap-2 items-center">
          <Users className="w-3 h-3 text-gray-400" />
          {memory.entities.map(person => (
            <span key={person} className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md accessibility-text">
              {person}
            </span>
          ))}
        </div>
      )}
      
      {memory.type === MemoryType.TEXT && memory.content.length > 150 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-primary-600 text-sm mt-2 font-medium hover:underline accessibility-text"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

export default MemoryCard;