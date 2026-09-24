export type UserRole = 'Admin' | 'Eksekutif' | 'Pembina' | 'Dalwas';

export interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  roles: UserRole[];
  hidden?: boolean;
  children?: NavItem[];
}

export type JenisUnitUsaha = 'Kapal' | 'Unit Pengolahan' | 'Tambak';

export interface PotensiUnitUsaha {
  id: string;
  namaUnit: string;
  jenis: JenisUnitUsaha;
  lokasi: string;
  readinessScore: number;
  picPembina: string;
}

export interface PembinaanState {
  kpi: {
    totalDibina: number;
    realisasiPrimer: number;
    realisasiPengolahan: number;
    potensiSertifikasi: number;
  };
  primer: {
    budidaya: number;
    tangkap: number;
    obatIkan: number;
  };
  pengolahan: {
    skp: number;
    haccp: number;
    spdi: number;
  };
  potensiUnitUsaha: PotensiUnitUsaha[];
}

export type TipeSurveilans = 'Verifikasi' | 'Surveilans';

export type StatusSurveilans = 'Terjadwal' | 'Berjalan' | 'Selesai' | 'Overdue';

export interface JadwalSurveilans {
  id: string;
  namaUnit: string;
  tanggal: string;
  tipe: TipeSurveilans;
  status: StatusSurveilans;
}

export type GradeSmkhp = 'A' | 'B' | 'C';

export interface GradeDistribusiSmkhp {
  grade: GradeSmkhp;
  jumlah: number;
}

export type StatusLogSmkhp =
  | 'Diperbarui'
  | 'Menunggu Verifikasi'
  | 'Kedaluwarsa';

export interface LogPembaruanSmkhp {
  id: string;
  namaUnit: string;
  tanggal: string;
  berlakuHingga: string;
  status: StatusLogSmkhp;
}

export interface ParameterUjiLab {
  parameter: string;
  jumlahSampel: number;
  lulusPersen: number;
  deviasi: number;
}

export type TipeUnitMutu = 'Pusat' | 'UPT Daerah';

export interface EvaluasiKinerjaUnit {
  id: string;
  unit: string;
  tipe: TipeUnitMutu;
  target: number;
  realisasi: number;
  temuan: number;
  tindakLanjutPersen: number;
}

export type JenisLab = 'Lab Penguji' | 'Lab Acuan';

export type StatusAkreditasi = 'Aktif' | 'Akan Berakhir' | 'Kedaluwarsa';

export interface LabMutu {
  id: string;
  nama: string;
  jenis: JenisLab;
  lokasi: string;
  nomorAkreditasi: string;
  masaBerlaku: string;
  statusAkreditasi: StatusAkreditasi;
  ruangLingkup: number;
}

export interface PengawasanState {
  mutuPrimer: {
    totalSertifikasiAktif: number;
    noregTerdaftar: number;
    jadwalSurveilans: JadwalSurveilans[];
    updateSmkhp: {
      totalAktif: number;
      akanKedaluwarsa: number;
      gradeDistribusi: GradeDistribusiSmkhp[];
      logPembaruan: LogPembaruanSmkhp[];
    };
    ujiLabJakarta: {
      totalSampel: number;
      lulusUjiPersen: number;
      deviasiKasus: number;
      parameterUji: ParameterUjiLab[];
    };
  };
  manajemenMutuOc: {
    unitPembinaCount: number;
    unitPusatCount: number;
    unitUptCount: number;
    labPengujiCount: number;
    labAcuanCount: number;
    labAkreditasiPersen: number;
    evaluasiKinerja: EvaluasiKinerjaUnit[];
    laboratorium: LabMutu[];
  };
}

export type StatusMitigasiUpi =
  | 'Critical Alert'
  | 'Under Surveillance'
  | 'Resolved';

export interface UpiKasusBerulang {
  id: string;
  namaUpi: string;
  wilayah: string;
  insiden3Tahun: number;
  statusMitigasi: StatusMitigasiUpi;
}

export interface TopNegaraTujuan {
  negara: string;
  volumeTon: number;
}

export type StatusKajiUlang = 'Selesai' | 'Dalam Proses' | 'Pending';

export interface EksekutifDashboardState {
  keberterimaanRate: number;
  totalKasus: number;
  totalSmkhp: number;
  sertifikasiTarget: {
    cpibKapalPercent: number;
    cbibTambakPercent: number;
  };
  totalNegaraTujuan: number;
  topNegaraTujuan: TopNegaraTujuan[];
  upiKasusBerulang: UpiKasusBerulang[];
  jaminanMutuLembaga: {
    verifikasiSelesai: number;
    rekomendasiOpen: number;
    kajiUlangStatus: StatusKajiUlang;
  };
}
