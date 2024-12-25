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
      <li key={index} className="text-gray-300">
        {participant.profiles.first_name} {participant.profiles.last_name}
      </li>
    ));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Joueurs</h3>
        <ul className="space-y-1">
          {renderParticipants(players)}
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Arbitres</h3>
        <ul className="space-y-1">
          {renderParticipants(referees)}
        </ul>
      </div>
    </div>
  );
}