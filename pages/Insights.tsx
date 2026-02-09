import React, { useEffect, useState } from 'react';
import { getAllMemories } from '../services/db';
import { Memory } from '../types';
import { Users, Loader2 } from 'lucide-react';

interface EntityNode {
  name: string;
  count: number;
}

const Insights: React.FC = () => {
  const [entities, setEntities] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processData = async () => {
      try {
        const memories = await getAllMemories();
        const counts: Record<string, number> = {};
        
        memories.forEach(m => {
          if (m.entities) {
            m.entities.forEach(name => {
              // Normalize names slightly
              const norm = name.trim();
              counts[norm] = (counts[norm] || 0) + 1;
            });
          }
        });

        const nodes = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
          
        setEntities(nodes);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    processData();
  }, []);

  const maxCount = entities.length > 0 ? entities[0].count : 1;

  // Simple size scale function
  const getSize = (count: number) => {
    const minSize = 80; // px
    const maxSize = 200; // px
    return minSize + ((count / maxCount) * (maxSize - minSize));
  };

  const getColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-rose-100 text-rose-800 border-rose-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="p-4 md:p-0 max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-calm-900 mb-1 flex items-center gap-2">
           <Users className="text-primary-600" /> People in My Life
        </h1>
        <p className="text-gray-500">A visual map of the people mentioned in your memories.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : entities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-xl font-medium text-gray-700">No people identified yet</p>
          <p className="text-gray-500 mt-2">Add photos or stories mentioning friends and family.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[60vh] flex flex-wrap content-center justify-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          
          {entities.map((node, i) => {
            const size = getSize(node.count);
            return (
              <div 
                key={node.name}
                className={`rounded-full flex flex-col items-center justify-center border-2 shadow-sm transition-transform hover:scale-110 cursor-default animate-in zoom-in duration-700 slide-in-from-bottom-4 ${getColor(i)}`}
                style={{ 
                  width: `${size}px`, 
                  height: `${size}px`,
                  animationDelay: `${i * 100}ms`
                }}
              >
                <span className="font-bold text-center leading-tight px-2 break-words text-lg">
                  {node.name}
                </span>
                <span className="text-xs opacity-70 mt-1 font-medium">{node.count} memories</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Insights;