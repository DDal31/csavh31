import { motion } from "framer-motion";

interface Participant {
  profiles: {
    first_name: string;
    last_name: string;
    club_role: string;
  };
}

interface ParticipantsListProps {
  players: Participant[];
  referees: Participant[];
}

export function ParticipantsList({ players, referees }: ParticipantsListProps) {
  const renderParticipants = (participants: Participant[]) => {
    return participants.map((participant, index) => (
      <motion.li
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.3,
          delay: index * 0.1
        }}
        whileHover={{ 
          scale: 1.02,
          backgroundColor: "rgba(255, 255, 255, 0.1)" 
        }}
        className="text-xs sm:text-sm text-gray-300 py-1.5 px-2 rounded-md transition-colors"
      >
        {participant.profiles.first_name} {participant.profiles.last_name}
      </motion.li>
    ));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-2 gap-2"
    >
      <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3">
        <h3 className="text-sm sm:text-base font-medium text-white mb-1 sm:mb-2">
          Joueurs ({players.length})
        </h3>
        <ul className="space-y-0.5">
          {players.length > 0 ? renderParticipants(players) : (
            <li className="text-xs sm:text-sm text-gray-400 italic">Aucun joueur inscrit</li>
          )}
        </ul>
      </div>
      <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3">
        <h3 className="text-sm sm:text-base font-medium text-white mb-1 sm:mb-2">
          Arbitres ({referees.length})
        </h3>
        <ul className="space-y-0.5">
          {referees.length > 0 ? renderParticipants(referees) : (
            <li className="text-xs sm:text-sm text-gray-400 italic">Aucun arbitre inscrit</li>
          )}
        </ul>
      </div>
    </motion.div>
  );
}