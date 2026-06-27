'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Hubungi Kami</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Punya pertanyaan tentang platform Moventios? Tim kami siap membantu Anda.
              </p>
            </div>

            <div className="space-y-4 pt-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground">hello@moventios.co</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Telepon</p>
                  <p className="text-muted-foreground">+62 (21) 500-8888</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Kantor Pusat</p>
                  <p className="text-muted-foreground">Bandung Creative Hub, Jawa Barat, Indonesia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
              {submitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold">Pesan Terkirim!</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Terima kasih telah menghubungi kami. Kami akan merespons pesan Anda secepatnya.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Alamat Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="anda@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Pesan Anda</Label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Tuliskan pertanyaan, masukan, atau kebutuhan kerja sama Anda di sini..."
                      className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-brand border-0 text-white hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      'Mengirim…'
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
