// ==========================================================================
// Data statis (hardcode) untuk Landing Page MUTIARA.
// CATATAN: Seluruh angka/label di bawah ini masih DATA CONTOH.
// Akan digantikan dengan data resmi dari Pus Manajemen Mutu (Pus MM),
// SIAP MUTU, KKP, DJPT, DJPB, dan DJPDSKP.
// ==========================================================================

// --------------------------------------------------------------------------
// Section 2 — Profil Laboratorium Badan Mutu
// --------------------------------------------------------------------------
export interface LabContact {
  label: string;
  value: string;
  href?: string;
}

export interface TestParameter {
  kategori: string;
  parameter: string[];
  metode: string;
}

export interface Accreditation {
  lembaga: string;
  nomor: string;
  ruangLingkup: string;
  berlaku: string;
}

export const labContacts: LabContact[] = [
  { label: 'Alamat', value: 'Jl. Medan Merdeka Timur No. 16, Gambir, Jakarta Pusat 10110' },
  { label: 'Telepon', value: '(021) 3519-0707', href: 'tel:+622135190707' },
  { label: 'Email', value: 'lab.mutu@bppmhkp.go.id', href: 'mailto:lab.mutu@bppmhkp.go.id' },
  { label: 'Jam Layanan', value: 'Senin – Jumat, 08.00 – 16.00 WIB' },
];

export const labLocation = {
  nama: 'Laboratorium Penguji BPPMHKP',
  koordinat: '-6.1754, 106.8272',
  embedUrl:
    'https://www.openstreetmap.org/export/embed.html?bbox=106.8074%2C-6.1954%2C106.8474%2C-6.1554&layer=mapnik&marker=-6.1754%2C106.8272',
  linkUrl: 'https://www.openstreetmap.org/?mlat=-6.1754&mlon=106.8272#map=15/-6.1754/106.8272',
};

export const testParameters: TestParameter[] = [
  {
    kategori: 'Organoleptik',
    parameter: ['Kenampakan', 'Bau', 'Tekstur', 'Rasa'],
    metode: 'SNI 2346:2015',
  },
  {
    kategori: 'Mikrobiologi',
    parameter: ['Total Plate Count', 'Salmonella', 'Vibrio cholerae', 'Listeria monocytogenes', 'E. coli'],
    metode: 'SNI / ISO 6579, ISO 11290',
  },
  {
    kategori: 'Kimia Proksimat',
    parameter: ['Kadar air', 'Protein', 'Lemak', 'Abu'],
    metode: 'SNI 01-2354',
  },
  {
    kategori: 'Logam Berat',
    parameter: ['Timbal (Pb)', 'Merkuri (Hg)', 'Kadmium (Cd)', 'Arsen (As)'],
    metode: 'AAS / ICP-MS',
  },
  {
    kategori: 'Residu Obat Ikan',
    parameter: ['Kloramfenikol', 'Nitrofuran', 'Malachite Green', 'Tetracycline'],
    metode: 'LC-MS/MS',
  },
  {
    kategori: 'Histamin',
    parameter: ['Histamin'],
    metode: 'HPLC / ELISA',
  },
];

export const accreditations: Accreditation[] = [
  {
    lembaga: 'Komite Akreditasi Nasional (KAN)',
    nomor: 'LP-1182-IDN',
    ruangLingkup: 'ISO/IEC 17025:2017 — Laboratorium Penguji',
    berlaku: 'Berlaku s.d. 2027',
  },
  {
    lembaga: 'Kementerian Kelautan dan Perikanan',
    nomor: 'Reg. Lab. Penguji Mutu Hasil Perikanan',
    ruangLingkup: 'Pengujian mutu & keamanan hasil perikanan',
    berlaku: 'Aktif',
  },
];

// --------------------------------------------------------------------------
// Section 3 — Regulasi Nasional & Internasional
// --------------------------------------------------------------------------
export interface Regulation {
  jenis: 'Nasional' | 'Internasional';
  kode: string;
  judul: string;
  deskripsi: string;
}

export const regulations: Regulation[] = [
  {
    jenis: 'Nasional',
    kode: 'UU No. 45 Tahun 2009',
    judul: 'Perubahan atas UU No. 31 Tahun 2004 tentang Perikanan',
    deskripsi: 'Dasar hukum pengelolaan dan pengendalian mutu hasil perikanan di Indonesia.',
  },
  {
    jenis: 'Nasional',
    kode: 'UU No. 18 Tahun 2012',
    judul: 'Undang-Undang Pangan',
    deskripsi: 'Menjamin keamanan, mutu, dan gizi pangan yang beredar dan diperdagangkan.',
  },
  {
    jenis: 'Nasional',
    kode: 'PP No. 27 Tahun 2021',
    judul: 'Penyelenggaraan Bidang Kelautan dan Perikanan',
    deskripsi: 'Mengatur penyelenggaraan mutu, pengolahan, dan pemasaran hasil perikanan.',
  },
  {
    jenis: 'Nasional',
    kode: 'Permen KP',
    judul: 'Jaminan Mutu dan Keamanan Hasil Perikanan',
    deskripsi: 'Ketentuan teknis sertifikasi, pengujian, dan pengawasan mutu hasil perikanan.',
  },
  {
    jenis: 'Internasional',
    kode: 'CAC/RCP 52-2003',
    judul: 'Codex Code of Practice for Fish and Fishery Products',
    deskripsi: 'Pedoman internasional praktik higiene pengolahan hasil perikanan (Codex Alimentarius).',
  },
  {
    jenis: 'Internasional',
    kode: '(EC) No. 853/2004',
    judul: 'EU Food Hygiene Regulation — Products of Animal Origin',
    deskripsi: 'Persyaratan higiene pangan asal hewan untuk ekspor ke Uni Eropa.',
  },
  {
    jenis: 'Internasional',
    kode: '21 CFR Part 123',
    judul: 'US FDA — Seafood HACCP Regulation',
    deskripsi: 'Kewajiban penerapan HACCP bagi fasilitas pengolahan hasil laut yang masuk pasar AS.',
  },
  {
    jenis: 'Internasional',
    kode: 'WTO SPS Agreement',
    judul: 'Agreement on Sanitary and Phytosanitary Measures',
    deskripsi: 'Kerangka ukuran kesehatan hewan/ikan dan keamanan pangan dalam perdagangan internasional.',
  },
];

// --------------------------------------------------------------------------
// Section 4 — Persyaratan Noreg & UPI yang telah memiliki Noreg
// --------------------------------------------------------------------------
export interface NoregRequirement {
  negara: string;
  lembaga: string;
  persyaratan: string[];
}

export const noregRequirements: NoregRequirement[] = [
  {
    negara: 'China',
    lembaga: 'GACC',
    persyaratan: ['Registrasi UPI melalui sistem CIFER', 'Sertifikat Kelayakan Pengolahan (SKP)', 'Penerapan HACCP', 'Hasil uji laboratorium terakreditasi'],
  },
  {
    negara: 'Uni Eropa',
    lembaga: 'DG SANTE',
    persyaratan: ['SKP & nomor persetujuan (approval number)', 'Penerapan HACCP', 'Kepatuhan higiene (EC) 853/2004', 'Masuk daftar UPI yang disetujui KKP'],
  },
  {
    negara: 'Amerika Serikat',
    lembaga: 'US FDA',
    persyaratan: ['Food Facility Registration (biennial)', 'Penerapan HACCP (21 CFR 123)', 'Rencana FSVP pihak importir', 'Sertifikat kesehatan hasil perikanan'],
  },
  {
    negara: 'Jepang',
    lembaga: 'MHLW',
    persyaratan: ['Registrasi fasilitas pengolahan', 'Penerapan HACCP', 'Sertifikat kesehatan / saniter', 'Hasil uji residu & logam berat'],
  },
  {
    negara: 'Korea Selatan',
    lembaga: 'MFDS',
    persyaratan: ['Registrasi eksportir & fasilitas', 'Hasil uji laboratorium', 'Penerapan HACCP', 'Sertifikat saniter'],
  },
  {
    negara: 'Rusia / EAEU',
    lembaga: 'Rosselkhoznadzor',
    persyaratan: ['Registrasi fasilitas pengolahan', 'Sertifikat veteriner', 'Penerapan HACCP', 'Hasil uji sesuai standar EAEU'],
  },
];

export interface UpiNoreg {
  nama: string;
  jenis: string;
  negara: string;
  nomor: string;
  status: 'Aktif' | 'Ditangguhkan';
}

export const upiNoreg: UpiNoreg[] = [
  { nama: 'PT. Samudera Nusantara Jaya', jenis: 'UPI Pengolahan', negara: 'China', nomor: 'CN-2023-0417', status: 'Aktif' },
  { nama: 'PT. Bahari Lestari', jenis: 'UPI Pengolahan', negara: 'Uni Eropa', nomor: 'ID-0182-EC', status: 'Aktif' },
  { nama: 'CV. Mina Sejahtera', jenis: 'UPI Pengolahan', negara: 'Amerika Serikat', nomor: 'US-FDA-9021', status: 'Aktif' },
  { nama: 'PT. Karya Bahari Makmur', jenis: 'UPI Pengolahan', negara: 'Jepang', nomor: 'JP-ID-0311', status: 'Aktif' },
  { nama: 'PT. Aneka Hasil Laut', jenis: 'UPI Pengolahan', negara: 'Korea Selatan', nomor: 'KR-ID-2074', status: 'Aktif' },
];

// --------------------------------------------------------------------------
// Section 5 — Data Kapal, Pelaku Usaha & UPI Terdaftar
// --------------------------------------------------------------------------
export interface ShipStat {
  label: string;
  value: string;
  sumber: string;
}

export const shipStats: ShipStat[] = [
  { label: 'Kapal Perikanan', value: '27.436', sumber: 'Data KKP' },
  { label: 'Kapal Berizin', value: '12.318', sumber: 'DJPT' },
];

export interface ActorStat {
  label: string;
  value: string;
}

export const actorStats: ActorStat[] = [
  { label: 'RTP Budidaya', value: '2.915.000' },
  { label: 'RTP Penangkapan', value: '1.214.000' },
  { label: 'Pelaku Usaha Pengolahan', value: '7.860' },
];

export interface UpiStat {
  label: string;
  value: string;
}

export const upiStats: UpiStat[] = [
  { label: 'Data KKP', value: '5.412' },
  { label: 'DJPT', value: '2.187' },
  { label: 'DJPB', value: '1.064' },
  { label: 'DJPDSKP', value: '2.161' },
];

// --------------------------------------------------------------------------
// Section 6 — Jumlah Sertifikasi BPPMHKP (9 Sertifikat + 1 Noreg)
// --------------------------------------------------------------------------
export interface CertItem {
  nama: string;
  singkatan: string;
  jumlah: string;
}

export const certifications: CertItem[] = [
  { nama: 'Sertifikat Kelayakan Pengolahan', singkatan: 'SKP', jumlah: '1.204 terbit' },
  { nama: 'Sertifikat Penerapan HACCP', singkatan: 'HACCP', jumlah: '986 terbit' },
  { nama: 'Sertifikat Mutu', singkatan: 'CoQ', jumlah: '12.530 terbit' },
  { nama: 'Sertifikat Kesehatan', singkatan: 'Health Cert.', jumlah: '9.842 terbit' },
  { nama: 'Sertifikat Asal', singkatan: 'CoO', jumlah: '8.417 terbit' },
  { nama: 'Sertifikat Bebas Penyakit Ikan', singkatan: 'FPI', jumlah: '742 terbit' },
  { nama: 'Sertifikat Sanitasi Kapal Perikanan', singkatan: 'SKP Kapal', jumlah: '3.189 terbit' },
  { nama: 'Sertifikat Hasil Uji Laboratorium', singkatan: 'LH', jumlah: '15.276 terbit' },
  { nama: 'Sertifikat Sistem Manajemen Mutu', singkatan: 'SMM', jumlah: '418 terbit' },
];

export const noregInfo = {
  nama: 'Noreg UPI ke Negara Mitra',
  singkatan: 'Noreg',
  jumlah: '214 UPI',
};
