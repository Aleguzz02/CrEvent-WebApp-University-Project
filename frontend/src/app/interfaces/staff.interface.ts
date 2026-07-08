export type TipoStaff = 'catering' | 'intrattenimento' | 'fotografo' | 'altro';

export interface StaffResource {
  id: number;
  nome: string;
  cognome: string;
  linkSito: string | null;
  tipo: TipoStaff;
  costo: number;
  descrizione: string;
  genereMusicale: string | null;
  genereFotografico: string | null;
  mansione: string | null;
  url: string | null;
}