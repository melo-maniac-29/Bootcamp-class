'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getBootcamp, subscribeToLeaderboard } from '@/lib/db';
import { 
  ArrowLeft,
  Trophy,
  Medal,
  TrendingUp,
  Users
} from 'lucide-react';

export default function LeaderboardPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [bootcamp, setBootcamp] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBc = async () => {
      const bc = await getBootcamp(id);
      if (bc) setBootcamp(bc);
    };
    loadBc();
    
    const unsub = subscribeToLeaderboard(id, (data) => {
      setLeaderboard(data);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  if (!bootcamp) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Sorting
  const sortedLeaderboard = [...leaderboard].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  return (
    <div className="max-w-[90rem] mx-auto pb-16 px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <button 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group w-fit"
            onClick={() => router.push(`/admin/bootcamps/${id}`)}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Trophy className="text-primary" size={32} />
            Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Top performers in {bootcamp.name}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : sortedLeaderboard.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <Trophy size={40} />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No data yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The leaderboard will populate once students start earning points.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 mb-12 pt-8">
            {sortedLeaderboard.length >= 2 && (
              <motion.div 
                className="w-full md:w-1/3 max-w-[250px] order-2 md:order-1 flex flex-col items-center"
                initial={{ y: 50, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }}
              >
                <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center text-3xl font-bold text-slate-500 shadow-lg shadow-slate-300/20 mb-4 z-10 bg-gradient-to-br from-slate-100 to-slate-300">
                  <span className="text-4xl">🥈</span>
                </div>
                <div className="w-full bg-card border border-border rounded-t-2xl p-6 text-center shadow-lg h-32 flex flex-col justify-end border-b-0 border-slate-300/30 bg-gradient-to-t from-slate-500/10 to-transparent">
                  <div className="font-bold text-foreground truncate w-full" title={sortedLeaderboard[1].displayName}>{sortedLeaderboard[1].displayName}</div>
                  <div className="text-primary font-black mt-2 bg-primary/10 inline-block px-3 py-1 rounded-full mx-auto">{sortedLeaderboard[1].totalPoints} pts</div>
                </div>
              </motion.div>
            )}
            
            {sortedLeaderboard.length >= 1 && (
              <motion.div 
                className="w-full md:w-1/3 max-w-[280px] order-1 md:order-2 flex flex-col items-center z-10"
                initial={{ y: 50, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.1 }}
              >
                <div className="absolute -top-6 text-yellow-500 animate-pulse">
                  <Trophy size={32} />
                </div>
                <div className="w-28 h-28 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center text-4xl font-bold text-yellow-600 shadow-xl shadow-yellow-500/30 mb-4 z-10 bg-gradient-to-br from-yellow-200 to-yellow-500">
                  <span className="text-5xl">🥇</span>
                </div>
                <div className="w-full bg-card border border-border rounded-t-2xl p-6 text-center shadow-xl h-40 flex flex-col justify-end border-b-0 border-yellow-500/30 bg-gradient-to-t from-yellow-500/10 to-transparent">
                  <div className="font-bold text-xl text-foreground truncate w-full" title={sortedLeaderboard[0].displayName}>{sortedLeaderboard[0].displayName}</div>
                  <div className="text-yellow-600 font-black mt-2 bg-yellow-500/20 inline-block px-4 py-1.5 rounded-full mx-auto text-lg">{sortedLeaderboard[0].totalPoints} pts</div>
                </div>
              </motion.div>
            )}

            {sortedLeaderboard.length >= 3 && (
              <motion.div 
                className="w-full md:w-1/3 max-w-[250px] order-3 md:order-3 flex flex-col items-center"
                initial={{ y: 50, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.3 }}
              >
                <div className="w-20 h-20 rounded-full bg-orange-100 border-4 border-orange-300 flex items-center justify-center text-3xl font-bold text-orange-600 shadow-lg shadow-orange-500/20 mb-4 z-10 bg-gradient-to-br from-orange-200 to-orange-400">
                  <span className="text-4xl">🥉</span>
                </div>
                <div className="w-full bg-card border border-border rounded-t-2xl p-6 text-center shadow-lg h-28 flex flex-col justify-end border-b-0 border-orange-500/30 bg-gradient-to-t from-orange-500/10 to-transparent">
                  <div className="font-bold text-foreground truncate w-full" title={sortedLeaderboard[2].displayName}>{sortedLeaderboard[2].displayName}</div>
                  <div className="text-orange-600 font-black mt-2 bg-orange-500/10 inline-block px-3 py-1 rounded-full mx-auto">{sortedLeaderboard[2].totalPoints} pts</div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/50 bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Rankings
              </h2>
            </div>
            
            <div className="divide-y divide-border/50">
              {sortedLeaderboard.slice(3).map((entry, i) => (
                <motion.div 
                  key={entry.id || entry.uid}
                  className="flex items-center gap-4 p-4 md:p-6 hover:bg-secondary/20 transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.05) }}
                >
                  <div className="w-10 text-center font-black text-2xl text-muted-foreground/50 font-mono">
                    #{i + 4}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground font-bold shrink-0 text-xl group-hover:border-primary/50 group-hover:text-primary transition-colors">
                    {entry.displayName?.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground truncate">{entry.displayName}</h3>
                      {entry.type === 'team' && (
                        <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <Users size={12} /> Team
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono font-bold text-lg text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-lg border border-emerald-500/20 inline-block">
                      {entry.totalPoints || 0} pts
                    </div>
                  </div>
                </motion.div>
              ))}
              {sortedLeaderboard.length <= 3 && (
                <div className="p-12 text-center text-muted-foreground">
                  <p>No more participants to display.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
