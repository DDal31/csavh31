import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AttendanceData {
  name: string;
  attendance: number[];
  total: number;
}

export const generateWorksheet = (
  sportName: string,
  dates: string[],
  attendanceMap: Map<string, AttendanceData>,
  monthDisplay: string
) => {
  // Créer l'en-tête avec le titre
  const title = [`Feuille de présence de ${monthDisplay} - ${sportName}`];
  const empty = [''];
  
  // Convertir les données pour le worksheet
  const wsData = [
    title,
    empty,
    ['Joueur', ...dates.map(d => format(parseISO(d), 'dd/MM/yyyy')), 'Total'],
    ...Array.from(attendanceMap.values()).map(user => [
      user.name,
      ...user.attendance.map(a => a === 1 ? 'X' : ''),
      user.total
    ])
  ];

  // Créer et formater le worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Fusionner les cellules pour le titre
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: dates.length + 1 } }];

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

  return ws;
};

export const createExcelFile = (
  workbook: XLSX.WorkBook,
  monthDisplay: string
): void => {
  XLSX.writeFile(workbook, `Présence_${monthDisplay}.xlsx`);
};