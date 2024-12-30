import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AttendanceData {
  name: string;
  attendance: number[];
  total: number;
}

interface PlayerData {
  id: string;
  name: string;
  sports: string[];
}

export const generateWorksheet = (
  sportName: string,
  dates: string[],
  attendanceMap: Map<string, AttendanceData>,
  monthDisplay: string,
  allPlayers: PlayerData[]
) => {
  console.log(`Generating worksheet for ${sportName} with ${allPlayers.length} players`);
  
  // Créer l'en-tête avec le titre du sport
  const title = [`Feuille de présence de ${monthDisplay}`];
  const sportTitle = [`Sport : ${sportName}`];
  const empty = [''];
  
  // Filtrer les joueurs pour ce sport
  const sportPlayers = allPlayers.filter(player => 
    player.sports.some(sport => sport.toLowerCase() === sportName.toLowerCase())
  );
  
  console.log(`Found ${sportPlayers.length} players for ${sportName}`);
  
  // Créer un Map avec tous les joueurs du sport, initialisé avec des présences à 0
  const fullAttendanceMap = new Map<string, AttendanceData>();
  
  // Initialiser tous les joueurs avec des présences à 0
  sportPlayers.forEach(player => {
    fullAttendanceMap.set(player.id, {
      name: player.name,
      attendance: new Array(dates.length).fill(0),
      total: 0
    });
  });

  // Mettre à jour les présences pour les joueurs qui ont participé
  Array.from(attendanceMap.entries()).forEach(([userId, data]) => {
    if (fullAttendanceMap.has(userId)) {
      fullAttendanceMap.set(userId, data);
    }
  });
  
  // Convertir les données pour le worksheet
  const wsData = [
    title,
    empty,
    sportTitle,
    empty,
    ['Joueur', ...dates.map(d => format(parseISO(d), 'dd/MM/yyyy')), 'Total'],
    ...Array.from(fullAttendanceMap.values()).map(user => [
      user.name,
      ...user.attendance.map(a => a === 1 ? 'X' : ''),
      user.total
    ])
  ];

  // Créer et formater le worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Fusionner les cellules pour le titre principal
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: dates.length + 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: dates.length + 1 } }
  ];

  // Définir la largeur des colonnes
  const colWidths = [
    { wch: 30 }, // Nom du joueur
    ...dates.map(() => ({ wch: 12 })), // Dates
    { wch: 8 } // Total
  ];
  ws['!cols'] = colWidths;

  // Appliquer des styles
  const titleCell = ws.A1;
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' }
    };
  }

  // Style pour le titre du sport
  const sportTitleCell = ws.A3;
  if (sportTitleCell) {
    sportTitleCell.s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'center' }
    };
  }

  // Ajouter des styles pour l'en-tête du tableau
  const headerRow = wsData[4];
  headerRow.forEach((_, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: 4, c: index });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' }
      };
    }
  });

  return ws;
};

export const createExcelFile = (
  workbook: XLSX.WorkBook,
  monthDisplay: string
): void => {
  // Ajouter des métadonnées pour l'accessibilité
  workbook.Props = {
    Title: `Feuille de présence - ${monthDisplay}`,
    Subject: `Feuille de présence des entraînements pour ${monthDisplay}`,
    Author: "CSAVH",
    CreatedDate: new Date()
  };

  XLSX.writeFile(workbook, `Présence_${monthDisplay}.xlsx`);
};