
import React, { useEffect, useState } from 'react';
import { getAllMemories, deleteMemory, toggleMemoryVerification, toggleActionCompletion } from '../services/store';
import { Memory } from '../types';
import MemoryCard from '../components/MemoryCard';
import { Search, Loader2, UserCog, User, Filter } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCaregiverMode, setIsCaregiverMode] = useState(false);
  const [showTasksOnly, setShowTasksOnly] = useState(false);
  const { user } = useAuth();

  const fetchMemories = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getAllMemories(user.uid);
      setMemories(data);
    } catch (e: any) {
      console.error(e);
      if (e.code === 'failed-precondition') {
        alert('Firestore index not found. Please create a composite index on the \'memories\' collection for \'userId\' ascending and \'timestamp\' descending.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to forget this memory?')) {
      await deleteMemory(id);
      fetchMemories();
    }
  };

  const handleVerify = async (id: string) => {
    await toggleMemoryVerification(id);
    setMemories(prev => prev.map(m => m.id === id ? { ...m, verified: !m.verified } : m));
  };

  const handleToggleAction = async (id: string) => {
    await toggleActionCompletion(id);
    setMemories(prev => prev.map(m => {
       if (m.id === id && m.action) {
         return { ...m, action: { ...m.action, completed: !m.action.completed } };
       }
       return m;
    }));
  };

  const filteredMemories = memories.filter(m => {
    const content = m.content || '';
    const tags = m.tags || [];
    const searchLower = search.toLowerCase();
    
    const matchesSearch = content.toLowerCase().includes(searchLower) || 
                          tags.some(t => String(t).toLowerCase().includes(searchLower)) ||
                          m.entities?.some(e => e.toLowerCase().includes(searchLower));

    const matchesFilter = showTasksOnly ? (m.action && m.action.type !== 'none') : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-0 max-w-6xl mx-auto w-full">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-calm-900 mb-1">My Timeline</h1>
          <p className="text-gray-500">Your digital second brain.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsCaregiverMode(!isCaregiverMode)}
            className={clsx(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors text-sm font-medium",
              isCaregiverMode 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {isCaregiverMode ? <UserCog className="w-4 h-4" /> : <User className="w-4 h-4" />}
            {isCaregiverMode ? "Caregiver Mode" : "Patient View"}
          </button>
          
          <button
             onClick={() => setShowTasksOnly(!showTasksOnly)}
             className={clsx(
               "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors text-sm font-medium",
               showTasksOnly 
                 ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                 : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
             )}
          >
            <Filter className="w-4 h-4" />
            {showTasksOnly ? "Tasks Only" : "All Items"}
          </button>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search memories..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 border bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </header>
      
      {isCaregiverMode && (
        <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
           <div>
             <h3 className="font-semibold text-indigo-900">Caregiver Dashboard Active</h3>
             <p className="text-indigo-700 text-sm">You can now verify memories to ensure accuracy for the patient.</p>
           </div>
           <div className="text-2xl font-bold text-indigo-500 opacity-20">
             <UserCog />
           </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-20 opacity-60">
          <img src="https://picsum.photos/200/200?grayscale" alt="Empty" className="w-32 h-32 mx-auto rounded-full mb-4 opacity-50" />
          <p className="text-xl font-medium text-gray-700">No memories found</p>
          <p className="text-gray-500">Tap "Add Memory" to start capturing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map(memory => (
            <div key={memory.id} className="h-full">
              <MemoryCard 
                memory={memory} 
                onDelete={handleDelete} 
                isCaregiverMode={isCaregiverMode}
                onVerify={handleVerify}
                onToggleAction={handleToggleAction}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
