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
      <li key={index} className="text-sm sm:text-base text-gray-300 py-1">
        {participant.profiles.first_name} {participant.profiles.last_name}
      </li>
    ));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium text-white mb-2">
          Joueurs ({players.length})
        </h3>
        <ul className="space-y-0.5">
          {players.length > 0 ? renderParticipants(players) : (
            <li className="text-sm text-gray-400 italic">Aucun joueur inscrit</li>
          )}
        </ul>
      </div>
      <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium text-white mb-2">
          Arbitres ({referees.length})
        </h3>
        <ul className="space-y-0.5">
          {referees.length > 0 ? renderParticipants(referees) : (
            <li className="text-sm text-gray-400 italic">Aucun arbitre inscrit</li>
          )}
        </ul>
      </div>
    </div>
  );
}