import Link from 'next/link';
import { ArrowLeft, Users2, Sparkles, Milestone, Coins } from 'lucide-react';

export const metadata = {
  title: 'Tentang Kami - Moventios',
  description: 'Mengenal Moventios, platform manajemen event dan koordinasi ruang kolaboratif.',
};

export default function AboutPage() {
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
            <Users2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Tentang Kami</h1>
            <p className="text-sm text-muted-foreground mt-1">Platform Koordinasi Komunitas Modern</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-4">
            <p className="text-base text-foreground font-medium">
              Moventios hadir sebagai solusi operasional yang menyatukan alokasi ruang fisik, koordinasi event, dan kredensial kehadiran komunitas ke dalam satu sistem terintegrasi.
            </p>
            <p>
              Kami percaya bahwa interaksi tatap muka dan kolaborasi fisik adalah pondasi dari berkembangnya inovasi serta relasi sosial yang sehat. Oleh karena itu, Moventios dirancang untuk mempermudah organisasi, kreator, dan manajer aset fisik dalam mengelola ruang berkumpul mereka serta menyelenggarakan event yang berdampak.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-foreground">Visi Kami</h3>
              <p className="text-xs">
                Menciptakan ekosistem di mana ruang fisik dan event komunitas dapat terkelola secara otomatis, adil, transparan, dan terpercaya.
              </p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Milestone className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-foreground">Misi Kami</h3>
              <p className="text-xs">
                Menyediakan perangkat digital yang aman dengan isolasi tenant yang andal, pencegahan bentrok jadwal secara real-time, dan sistem tiket terverifikasi.
              </p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Coins className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-foreground">Sistem Kredit</h3>
              <p className="text-xs">
                Mengintegrasikan ekonomi kredit poin internal tertutup untuk distribusi pass tiket dan ruang pemesanan yang adil secara mandiri.
              </p>
            </div>
          </div>

          <section className="space-y-3 border-t border-border/40 pt-6">
            <h2 className="text-lg font-bold text-foreground">Pendekatan Kami</h2>
            <p>
              Kami mengutamakan pengalaman pengguna yang human-centric dengan copywriting yang ramah dan desain UI/UX yang premium serta profesional. Setiap baris kode dan keputusan arsitektur dioptimalkan untuk memastikan privasi data, kestabilan performa, serta kemudahan bagi admin maupun peserta dalam jaringan ekosistem Moventios.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
