import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Ketentuan Layanan - Moventios',
  description: 'Ketentuan dan aturan penggunaan platform Moventios.',
};

export default function TermsPage() {
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
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Ketentuan Layanan</h1>
            <p className="text-sm text-muted-foreground mt-1">Terakhir diperbarui: 27 Juni 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses dan menggunakan platform Moventios, Anda menyetujui untuk terikat oleh Ketentuan Layanan ini, semua hukum dan peraturan yang berlaku, serta bertanggung jawab atas kepatuhan terhadap hukum setempat yang berlaku. Jika Anda tidak menyetujui salah satu dari ketentuan ini, Anda dilarang menggunakan platform ini.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Deskripsi Layanan</h2>
            <p>
              Moventios menyediakan platform manajemen venue, penjadwalan ruang, administrasi event, dan sistem tiket terverifikasi untuk memfasilitasi kolaborasi komunitas dan organisasi. Seluruh fitur disediakan untuk membantu koordinasi aktivitas fisik maupun digital secara tertib.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Hak dan Kewajiban Pengguna</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Anda wajib memberikan informasi yang akurat, lengkap, dan terbaru saat pendaftaran akun.</li>
              <li>Anda bertanggung jawab atas keamanan kredensial akun dan segala aktivitas yang terjadi di bawah akun Anda.</li>
              <li>Anda dilarang menggunakan platform untuk tujuan ilegal, melanggar hak kekayaan intelektual pihak lain, atau menyebarkan konten yang berbahaya.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Pembatalan dan Pemesanan Ruang</h2>
            <p>
              Setiap pemesanan ruangan dan venue tunduk pada ketersediaan dan persetujuan dari masing-masing administrator venue. Moventios berhak membatalkan atau mengubah pemesanan jika ditemukan pelanggaran ketentuan atau bentrok jadwal operasional yang mendesak.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Sistem Poin & Kredit Internal</h2>
            <p>
              Platform ini menyediakan sistem poin / kredit internal sebagai nilai tukar simulasi dan alat koordinasi alokasi tiket serta ruangan:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Poin diperoleh secara gratis saat pertama kali mendaftar (saldo default) atau didistribusikan secara manual oleh administrator sistem.</li>
              <li>Poin bersifat non-moneter, tertutup (closed-loop), tidak memiliki nilai uang riil di luar ekosistem platform, dan tidak dapat ditukar atau ditarik ke dalam mata uang fiat apa pun.</li>
              <li>Jika reservasi ruangan ditolak/dibatalkan atau tiket event dibatalkan oleh pihak penyelenggara, poin yang telah didebet akan otomatis dikembalikan (refund) ke saldo akun pengguna.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">6. Batasan Tanggung Jawab</h2>
            <p>
              Moventios disediakan &ldquo;sebagaimana adanya&rdquo; tanpa jaminan dalam bentuk apa pun, baik tersurat maupun tersirat. Kami tidak bertanggung jawab atas kerugian langsung, tidak langsung, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan platform kami.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">7. Perubahan Ketentuan</h2>
            <p>
              Kami dapat meninjau dan mengubah Ketentuan Layanan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Dengan tetap menggunakan platform ini setelah perubahan dilakukan, Anda menyetujui ketentuan yang baru.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
