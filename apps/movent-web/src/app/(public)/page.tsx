import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Building2, Shield, Ticket, ArrowRight, Activity, Cpu, KeyRound } from 'lucide-react';

export const metadata = {
  title: 'Moventios — Kalender Event & Pemesanan Venue Komunitas',
  description: 'Kelola jadwal ruang gathering, pendaftaran peserta, dan tiket masuk dalam satu tempat yang aman dan terorganisir untuk komunitasmu.',
};

export default function MarketingLandingPage() {
  return (
    <div className="bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 border-b border-border/40">
        {/* Decorative Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,148,136,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,148,136,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
        
        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/40 px-3.5 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
              Sistem Manajemen Komunitas Mandiri
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl font-sans">
              Kelola Event & Ruangan{' '}
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 dark:from-teal-400 dark:via-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
                Komunitas Modern
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto">
              Moventios membantu komunitas mengelola tempat kumpul fisik, registrasi event langsung, dan data kehadiran dalam satu dasbor terpadu.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login?tab=register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold text-base py-6 shadow-xl shadow-teal-600/10 rounded-xl">
                  Buat Ruang Kerja <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/events" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-border bg-background/50 hover:bg-accent text-foreground hover:text-foreground text-base py-6 rounded-xl">
                  Lihat Jadwal & Lokasi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats / Connection Points */}
      <section className="border-b border-border/40 bg-card/30 py-10 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: 'Data 100% Aman', desc: 'Setiap komunitas memiliki penyimpanan data terisolasi yang aman.' },
              { val: 'Tiket Digital', desc: 'Verifikasi kehadiran peserta otomatis tanpa antrean.' },
              { val: 'Reservasi Real-Time', desc: 'Kalender pemesanan ruangan terintegrasi bebas bentrok.' },
              { val: 'Kontrol Admin', desc: 'Setiap perubahan penting memerlukan persetujuan sebelum aktif.' },
            ].map((stat) => (
              <div key={stat.val} className="p-4 rounded-xl border border-border/60 bg-card/60 shadow-sm">
                <div className="text-lg font-bold text-teal-600 dark:text-teal-400">{stat.val}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Dirancang untuk Kelancaran Acara Anda
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Berbeda dari sekadar aplikasi kalender biasa, Moventios menyatukan penjadwalan, sewa ruangan, dan kontrol kehadiran peserta dalam satu sistem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Manajemen Event',
                desc: 'Buat acara, jadwalkan waktu pelaksanaan, batasi kuota, dan tayangkan di direktori pencarian publik dengan sekali klik.',
              },
              {
                icon: Building2,
                title: 'Pemesanan Ruangan',
                desc: 'Atur kapasitas tempat duduk, fasilitas pendukung, serta lihat jadwal sewa ruangan secara transparan tanpa bentrok.',
              },
              {
                icon: Ticket,
                title: 'Tiket & Registrasi',
                desc: 'Kirimkan tiket masuk digital ke peserta. Cukup pindai kode unik di pintu masuk saat acara dimulai.',
              },
              {
                icon: Shield,
                title: 'Persetujuan Keanggotaan',
                desc: 'Kelola izin akses tim penyelenggara dan verifikasi pendaftaran anggota baru secara terpusat oleh administrator.',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-card/50 border border-border/60 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/30 transition-colors shadow-sm">
                <div className="space-y-4">
                  <div className="h-10 w-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Specs / Outbox / Event OS Visual Mock */}
      <section className="py-20 border-t border-border/40 bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                <Cpu className="h-4 w-4" />
                Teknologi & Keamanan
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Didesain dengan Standar Keamanan Tinggi
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Keamanan data komunitas adalah prioritas utama. Moventios menggunakan enkripsi data terisolasi untuk memastikan informasi penting komunitas Anda tidak bocor ke pihak luar, serta sistem pencatatan transaksi terverifikasi untuk mencegah kegagalan jadwal reservasi.
              </p>
              
              <ul className="space-y-3.5 text-xs text-foreground">
                <li className="flex items-start gap-2.5">
                  <KeyRound className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Privasi Data Komunitas:</strong> Setiap komunitas memiliki isolasi data penuh. Informasi Anda tidak akan tercampur dengan penyewa lain.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Activity className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Sinkronisasi Instan:</strong> Pembaruan status tiket dan izin masuk terupdate dalam hitungan detik di semua perangkat panitia.</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl" />
              
              {/* Fake Terminal Dashboard Mock */}
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-yellow-500/80 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-emerald-500/80 rounded-full" />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Log Aktivitas Event Terkini
                </span>
              </div>

              <div className="space-y-3 font-mono text-[11px] text-foreground">
                <div className="p-2.5 bg-background border border-border rounded-lg flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-amber-500 rounded-full" />
                    <span className="text-amber-600 dark:text-amber-500 font-bold">[MENUNGGU]</span>
                    <span>Pendaftaran Anggota Baru - Budi Santoso</span>
                  </div>
                  <span className="text-muted-foreground">Persetujuan Admin</span>
                </div>

                <div className="p-2.5 bg-background border border-border rounded-lg flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full" />
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">[BERHASIL]</span>
                    <span>Sewa Ruang Aula Utama - Komunitas Seni</span>
                  </div>
                  <span className="text-muted-foreground">Ruangan Dipesan</span>
                </div>

                <div className="p-2.5 bg-background border border-border rounded-lg flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-blue-600 dark:text-blue-500 font-bold">[SELESAI]</span>
                    <span>Tiket Masuk Dikirim - Budiyono</span>
                  </div>
                  <span className="text-muted-foreground">Terkirim ke Email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
