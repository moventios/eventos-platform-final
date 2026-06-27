import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export const metadata = {
  title: 'Kebijakan Privasi - Moventios',
  description: 'Kebijakan privasi dan perlindungan data pengguna platform Moventios.',
};

export default function PolicyPage() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Kebijakan Privasi</h1>
            <p className="text-sm text-muted-foreground mt-1">Terakhir diperbarui: 27 Juni 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat mendaftar akun, memperbarui profil, membuat atau memproses pemesanan ruang, mendaftarkan event, serta data transaksi poin dan saldo kredit internal Anda. Informasi tersebut dapat mencakup nama, alamat email, nomor telepon, afiliasi organisasi, detail pemesanan, dan log aktivitas transaksi poin.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Penggunaan Informasi</h2>
            <p>
              Kami menggunakan informasi yang dikumpulkan untuk:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Menyediakan, memelihara, dan meningkatkan kualitas platform serta layanan kami.</li>
              <li>Memproses reservasi ruang, pendaftaran event, verifikasi tiket kehadiran, dan transaksi kredit poin.</li>
              <li>Mengirimkan email konfirmasi, pembaruan keamanan, dan notifikasi persetujuan administratif.</li>
              <li>Mengelola pencatatan alokasi saldo poin serta riwayat mutasi poin secara aman dan tertib.</li>
              <li>Mendeteksi, mencegah, dan menangani masalah teknis atau penyalahgunaan platform.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Perlindungan dan Isolasi Data</h2>
            <p>
              Keamanan data Anda adalah prioritas kami. Moventios menggunakan mekanisme isolasi data berbasis tenant (organisasi) yang ketat didukung oleh Row-Level Security (RLS) pada database kami. Kami juga membatasi akses ke data pribadi Anda hanya kepada pihak internal yang berwenang dan pihak ketiga yang bekerja sama dengan kami di bawah perjanjian kerahasiaan yang ketat.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Berbagi Informasi</h2>
            <p>
              Kami tidak menjual, menyewakan, atau menukar data pribadi pengguna kepada pihak ketiga untuk tujuan pemasaran tanpa persetujuan tertulis dari Anda. Kami hanya membagikan informasi dalam batas yang diizinkan undang-undang atau untuk mematuhi proses hukum yang sah.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Hak Anda atas Data</h2>
            <p>
              Anda memiliki hak untuk mengakses, memperbarui, atau meminta penghapusan informasi pribadi Anda yang kami simpan. Silakan hubungi kami melalui halaman Kontak jika Anda ingin mengajukan permohonan tersebut.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
