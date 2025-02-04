import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type PlayerRanking = {
  player_name: string;
  attendance_count: number;
  rank: number;
};

export function AttendanceRankingCard({ sport }: { sport: string }) {
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_player_attendance_ranking', { sport_type: sport.toLowerCase() });

        if (error) {
          console.error('Error fetching rankings:', error);
          return;
        }

        setRankings(data || []);
      } catch (error) {
        console.error('Error in fetchRankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [sport]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-white">
          Classement des présences
        </h3>
      </div>
      
      <div className="space-y-3">
        {rankings.length === 0 ? (
          <p className="text-gray-400 text-center">Aucune donnée disponible</p>
        ) : (
          rankings.map((rank) => (
            <div 
              key={rank.player_name}
              className="flex items-center justify-between p-2 rounded bg-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <span className={`
                  w-6 h-6 flex items-center justify-center rounded-full
                  ${rank.rank === 1 ? 'bg-yellow-500' : 
                    rank.rank === 2 ? 'bg-gray-400' :
                    rank.rank === 3 ? 'bg-amber-700' : 'bg-gray-600'}
                  text-white font-semibold text-sm
                `}>
                  {rank.rank}
                </span>
                <span className="text-white">{rank.player_name}</span>
              </div>
              <span className="text-gray-300">
                {rank.attendance_count} présence{rank.attendance_count > 1 ? 's' : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}