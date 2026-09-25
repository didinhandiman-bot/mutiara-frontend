# Product Requirement Document (PRD) & Technical Specification
## Sistem Dashboard Monitoring Mutu & Sertifikasi Perikanan

---

## 1. Overview & Objective

Dokumen ini merupakan panduan implementasi teknis untuk pengembangan antarmuka dashboard, navigasi sidebar, sistem role-based access control (RBAC), dan visualisasi data monitoring mutu perikanan. 

Sistem mengintegrasikan data dari:
- **SIAP MUTU**
- **Pusat Manajemen Mutu (Pus MM)**
- **Pusat Pascapanen (Honnes)**
- **UPT Laboratorium Penguji (Jakarta & Daerah)**
- **Direktorat Teknis KKP**

Seluruh data awal dashboard disajikan menggunakan structured mock data yang siap digantikan dengan API backend di masa mendatang.

---

## 2. Navigasi Sidebar & Matriks RBAC

### 2.1 Konfigurasi Navigasi
- **Default Dashboard (`/dashboard`):** Dinonaktifkan dari antarmuka visual (`hidden: true` atau di-remark), tidak boleh muncul di baris sidebar.
- **Existing Menus:**
  - `IoT Monitoring` (`/iot-monitoring`)
  - `User Management` (`/users`)
- **New Menus:**
  - `Pembinaan` (`/pembinaan`)
  - `Pengendalian/Pengawasan` (`/pengawasan`) dengan 2 sub-menu
  - `Dashboard Eksekutif` (`/eksekutif`)

### 2.2 Matriks Hak Akses (Role-Based Access Control)

| Menu / Sub-Menu | Route Path | Roles Allowed | Tipe Halaman |
| :--- | :--- | :--- | :--- |
| *~~Dashboard (Default)~~* | `/dashboard` | *None* | **Hidden / Remarked** |
| **1. Pembinaan** | `/pembinaan` | `Admin`, `Eksekutif`, `Pembina` | Baru (Dashboard) |
| **2. Pengendalian / Pengawasan** | `/pengawasan` | `Admin`, `Eksekutif`, `Pengawas`, `Pembina` | Group / Parent Menu |
| ↳ *Mutu Primer / Pascapanen* | `/pengawasan/mutu-primer` | `Admin`, `Eksekutif`, `Pengawas`, `Pembina` | Baru (Sub-Dashboard) |
| ↳ *Manajemen Mutu OC* | `/pengawasan/manajemen-mutu-oc` | `Admin`, `Eksekutif`, `Pengawas`, `Pembina` | Baru (Sub-Dashboard) |
| **3. IoT Monitoring** | `/iot-monitoring` | `Admin`, `Eksekutif` | Existing |
| **4. Dashboard Eksekutif** | `/eksekutif` | `Admin`, `Eksekutif` | Baru (Executive Board) |
| **5. User Management** | `/users` | `Admin` | Existing |

---

## 3. Standar & Kaidah Desain Dashboard (Layout Rules)

Semua dashboard wajib dibangun mengikuti **6 Aturan Sederhana Layout Dashboard**:

1. **Rule 1 - Mulai dari Kerangka (Wireframe Consistency):**
   - Header konsisten: Judul Halaman, Breadcrumb, Quick Filter Bar (Rentang Waktu, Wilayah).
   - Hero Section / Metrik Kunci Utama.
   - Ringkasan KPI (Row 3-4 card).
   - Visualisasi Analitis (Grafik/Bagan komparasi).
   - Detail Operasional (Tabel interaktif atau feed alert).
2. **Rule 2 - Pimpin dengan 1 Insight Utama (Lead with 1 Core Insight):**
   - Sudut kiri atas atau Hero Banner selalu menyoroti performa/status paling kritikal.
3. **Rule 3 - Kelompokkan Data yang Saling Berkaitan (Logical Grouping):**
   - Pisahkan sertifikasi primer dengan sertifikasi pengolahan.
   - Satukan metrik audit, jadwal, dan lab dalam kontainer pemantauan operasional.
4. **Rule 4 - Gunakan Jarak (Spacing) yang Konsisten:**
   - Gunakan sistem grid terpadu (Tailwind: `gap-6`, `p-6`, card rounded `rounded-xl`, shadow halus `shadow-sm`).
5. **Rule 5 - Gunakan Lebih Sedikit Kotak/Seksi (Fewer Boxes, Clean Interface):**
   - Hindari membuat terlalu banyak card kecil terisolasi. Gabungkan metrik terkait dalam satu panel berstruktur jelas.
6. **Rule 6 - Rancang Alur Pandang Mata (F-Pattern Scanning):**
   - Kiri atas: Metrik utama & status umum.
   - Tengah: Tren dan grafik komparasi.
   - Bawah: Tabel rincian operasional, log kasus, atau rekomendasi aksi.

---

## 4. Rincian Spesifikasi Per Halaman

### 4.1 Halaman: Pembinaan (`/pembinaan`)
- **Roles:** `Admin`, `Eksekutif`, `Pembina`
- **Tujuan:** Monitoring capaian pembinaan sertifikasi hulu (primer) dan hilir (pengolahan), serta pipeline unit usaha potensial.
- **Komponen & Konten:**
  1. **Quick Filter:** Tahun Anggaran, Provinsi/Wilayah Pembina, Sektor Pembinaan.
  2. **Top KPI Strip (4 Cards):**
     - Total Unit Usaha Dibina
     - Realisasi Pembinaan Primer
     - Realisasi Pembinaan Pengolahan
     - Total Potensi Siap Sertifikasi
  3. **Section 1: Data Pembinaan Sertifikasi Primer (Sumber: SIAP MUTU):**
     - Visualisasi sebaran pembinaan: **Budidaya**, **Tangkap**, dan **Obat Ikan**.
     - Grafik batang progres target vs realisasi pembinaan primer.
  4. **Section 2: Data Pembinaan Sertifikasi Pengolahan (Sumber: SIAP MUTU):**
     - Distribusi sertifikasi pengolahan: **SKP**, **HACCP**, **SPDI**.
     - Funnel/Pipeline status pembinaan: *Identifikasi Lapangan → Bimbingan Teknis → Verifikasi Kelayakan → Siap Sertifikasi*.
  5. **Section 3: Data Potensi Unit Usaha / Kapal Siap Sertifikasi (Sumber: Mockup):**
     - Tabel daftar unit/kapal dengan kolom: Nama Usaha/Kapal, Jenis Komoditas, Lokasi UPT, Skor Kesiapan (0-100%), Status Rekomendasi, Nama Pembina PIC.

---

### 4.2 Halaman: Pengendalian / Pengawasan

#### Sub-Menu A: Mutu Primer / Pascapanen (`/pengawasan/mutu-primer`)
- **Roles:** `Admin`, `Eksekutif`, `Pengawas`, `Pembina`
- **Tujuan:** Pengawasan teknis kepatuhan standar mutu pascapanen, verifikasi lapangan, dan mutu laboratorium.
- **Komponen & Konten:**
  1. **Core Status: 9 Sertifikasi + 1 Noreg (Sumber: SIAP MUTU & Pus MM):**
     - Visual badge / card ringkasan total sertifikasi aktif dan registrasi nomor registrasi (Noreg) eksportir.
  2. **Jadwal Verifikasi & Surveilans (Sumber: SIAP MUTU & Honnes Pus Pascapanen):**
     - Timeline jadwal pengawasan lapangan terdekat (Status: *Terjadwal*, *Sedang Berjalan*, *Selesai*, *Overdue*).
  3. **Data Update SMKHP (Sumber: SIAP MUTU):**
     - Monitoring status pembaruan Sertifikat Mutu Kelayakan Hasil Perikanan (SMKHP).
     - Indikator unit usaha yang masa berlaku SMKHP mendekati jatuh tempo (< 60 hari).
  4. **Data Uji Hasil Laboratorium (Sumber: UPT Laboratorium Jakarta):**
     - Rekapitulasi pengujian sampel perikanan: Parameter Uji (Mikrobiologi, Kimia, Residu), Jumlah Sampel, Lulus Syarat (%) vs Tidak Memenuhi Syarat.

#### Sub-Menu B: Manajemen Mutu OC (`/pengawasan/manajemen-mutu-oc`)
- **Roles:** `Admin`, `Eksekutif`, `Pengawas`, `Pembina`
- **Tujuan:** Monitoring performa dan kapasitas institusional unit-unit penjaminan mutu di tingkat pusat dan daerah.
- **Komponen & Konten:**
  1. **Struktur Entitas Pengawasan Mutu (Sumber: Pus MM):**
     - 5 Pilar Unit Pemantauan:
       - Unit Pembina
       - Unit Pengendalian & Pengawasan Mutu (Pusat)
       - Unit Pengendalian & Pengawasan Mutu (UPT Daerah)
       - Laboratorium Penguji
       - Laboratorium Acuan
  2. **Matriks Evaluasi Kinerja Unit & Lab:**
     - Status akreditasi ISO/IEC 17025 laboratorium penguji & laboratorium acuan.
     - Tingkat pemenuhan target pengawasan tahunan per UPT daerah.

---

### 4.3 Halaman: Dashboard Eksekutif (`/eksekutif`)
- **Roles:** `Admin`, `Eksekutif`
- **Tujuan:** Ringkasan tingkat tinggi untuk pengambil kebijakan terkait daya saing produk, jangkauan ekspor, serta mitigasi risiko mutu internasional.
- **Komponen & Konten:**
  1. **Lead Insight Card (Pojok Kiri Atas):**
     - **Prosentase Keberterimaan Produk Perikanan Global:**
       $$\text{Persentase Keberterimaan} = \left(1 - \frac{\text{Jumlah Kasus Penolakan}}{\text{Jumlah SMKHP Ekspor}}\right) \times 100\%$$
     - *Data Source:* SIAP MUTU & Pus MM. Dilengkapi badge status hijau/kuning/merah.
  2. **Capaian Sertifikasi Prioritas (Sumber: KKP & Dit Teknis vs SIAP MUTU):**
     - Prosentase Kapal Tersertifikasi **CPIB** (Cara Penanganan Ikan yang Baik).
     - Prosentase Tambak Tersertifikasi **CBIB** (Cara Budidaya Ikan yang Baik).
     - Bar chart ringkasan capaian 9 skema sertifikasi lainnya.
  3. **Jangkauan Ekspor Produk Perikanan (Sumber: SIAP MUTU):**
     - Counter metrik total negara mitra tujuan ekspor.
     - Top 5 negara destinasi ekspor dengan volume kepatuhan tertinggi.
  4. **Early Warning System: Data Kasus Berulang UPI (Sumber: Pus MM):**
     - Highlight/Notifikasi khusus: Unit Pengolahan Ikan (UPI) dengan frekuensi kasus cemaran/penolakan berulang dalam rentang **3 Tahun Terakhir**.
     - Kolom: Nama UPI, Komoditas, Negara Pengimpal Kasus, Kategori Deviasi, Status Tindak Lanjut.
  5. **Jaminan Mutu Lembaga (Sumber: Pus MM):**
     - Evaluasi & Rekomendasi Hasil Verifikasi ke Lembaga Penjamin Mutu.
     - Tracker status Laporan & Data Dukung Kaji Ulang Manajemen (Management Review).

---

## 5. Mock Data Structure (TypeScript Interface)

Untuk memastikan kemandirian frontend selama masa uji coba, agent coding wajib mendefinisikan interface dan data mock berikut:

```typescript
// types/dashboard.ts

export type UserRole = 'Admin' | 'Eksekutif' | 'Pengawas' | 'Pembina';

export interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  roles: UserRole[];
  hidden?: boolean;
  children?: NavItem[];
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
  potensiUnitUsaha: Array<{
    id: string;
    namaUnit: string;
    jenis: 'Kapal' | 'Unit Pengolahan' | 'Tambak';
    lokasi: string;
    readinessScore: number; // 0 - 100
    picPembina: string;
  }>;
}

export interface PengawasanState {
  mutuPrimer: {
    totalSertifikasiAktif: number;
    noregTerdaftar: number;
    jadwalSurveilans: Array<{
      id: string;
      namaUnit: string;
      tanggal: string;
      tipe: 'Verifikasi' | 'Surveilans';
      status: 'Terjadwal' | 'Berjalan' | 'Selesai' | 'Overdue';
    }>;
    updateSmkhp: {
      totalAktif: number;
      akanKedaluwarsa: number;
    };
    ujiLabJakarta: {
      totalSampel: number;
      lulusUjiPersen: number;
      deviasiKasus: number;
    };
  };
  manajemenMutuOc: {
    unitPembinaCount: number;
    unitPusatCount: number;
    unitUptCount: number;
    labPengujiCount: number;
    labAcuanCount: number;
    labAkreditasiPersen: number;
  };
}

export interface EksekutifDashboardState {
  keberterimaanRate: number; // Formula: (1 - Kasus/SMKHP) * 100%
  totalKasus: number;
  totalSmkhp: number;
  sertifikasiTarget: {
    cpibKapalPercent: number;
    cbibTambakPercent: number;
  };
  totalNegaraTujuan: number;
  topNegaraTujuan: Array<{ negara: string; volumeTon: number }>;
  upiKasusBerulang: Array<{
    id: string;
    namaUpi: string;
    wilayah: string;
    insiden3Tahun: number;
    statusMitigasi: 'Critical Alert' | 'Under Surveillance' | 'Resolved';
  }>;
  jaminanMutuLembaga: {
    verifikasiSelesai: number;
    rekomendasiOpen: number;
    kajiUlangStatus: 'Selesai' | 'Dalam Proses' | 'Pending';
  };
}
```

---

## 6. Implementation Checklist untuk Coding Agent

1. **Sidebar Navigation Update:**
   - Ubah konfigurasi routing dan hide menu `/dashboard`.
   - Implementasikan nesting menu untuk `Pengendalian / Pengawasan`.
   - Pasang filter menu berdasarkan role pengguna aktif.
2. **Setup Mock Data Provider:**
   - Buat file mock data yang memenuhi interface pada Section 5.
3. **Pembangunan Halaman `/pembinaan`:**
   - Susun header filter, KPI card, chart pembinaan primer vs pengolahan, dan tabel potensi unit usaha.
4. **Pembangunan Halaman `/pengawasan/mutu-primer` & `/pengawasan/manajemen-mutu-oc`:**
   - Buat card 9 sertifikasi + 1 Noreg, list timeline audit/surveilans, dan status akreditasi lab.
5. **Pembangunan Halaman `/eksekutif`:**
   - Buat Lead Insight Card persentase keberterimaan produk, komparasi CPIB/CBIB, and alert table kasus berulang UPI 3 tahun.