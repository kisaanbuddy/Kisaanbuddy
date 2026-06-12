'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, User, Phone, Globe, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ContactClient() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      return;
    }
    
    setStatus('submitting');
    
    // Simulate API request
    setTimeout(() => {
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 1200);
  };

  return (
    <div className="-mt-8 -mx-4 md:-mx-8 flex flex-col relative pb-12 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Hero Header */}
      <section className="relative overflow-hidden px-6 md:px-12 py-16 md:py-24 border-b border-border/20 bg-card/25 backdrop-blur-md">
        <div className="mx-auto max-w-5xl text-center md:text-left">
          <div className="flex justify-center md:justify-start items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
              {t("contactUs")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-foreground leading-tight">
            How can we <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">help you</span>?
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
            Have questions about our AI features, partnership options, or technical concerns? Reach out directly and our founding team will respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-5 items-start">
          
          {/* Left: Contact Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold font-display text-foreground">Get in Touch Directly</h2>
              <p className="text-xs text-muted-foreground">Feel free to write to any of our team members for support or queries.</p>
            </div>

            <div className="space-y-4">
              {[
                { name: "Aditya Ishwar", role: "Founder & CEO", shortRole: "Founder", email: "adityaoutlier5@gmail.com" },
                { name: "Utkarsh Sinha", role: "Managing Director", shortRole: "MD", email: "utkarsh.sinha.dev@gmail.com" },
                { name: "Sanidhya Sharma", role: "CTO", shortRole: "CTO", email: "sanidhyasharma.dev@gmail.com" },
                { name: "Yash Singh", role: "Co-Founder & CMO", shortRole: "Co-Founder", email: "yashkumaryashsingh384@gmail.com" }
              ].map((c) => (
                <a
                  key={c.email}
                  href={`mailto:${c.email}`}
                  className="block rounded-xl border border-border/20 bg-card/25 p-4 hover:border-emerald-500/20 hover:bg-card/45 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400 font-extrabold">
                      {c.name.split(" ")[0]} &middot; {c.shortRole}
                    </span>
                    <Mail className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div className="text-xs font-bold text-foreground mt-1.5">{c.name}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{c.email}</div>
                </a>
              ))}
            </div>

            <div className="rounded-xl border border-border/20 bg-muted/10 p-5 space-y-3.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>Patna, Bihar, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>https://krishiaiindia.vercel.app</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>+91 9876543210 (Founding Support Helpline)</span>
              </div>
            </div>
          </div>

          {/* Right: Message Form (3 cols) */}
          <div className="lg:col-span-3 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md p-6 md:p-8 shadow-xl">
            <h3 className="text-lg font-bold font-display text-foreground mb-4">Send a Message</h3>
            
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 animate-pulse-glow">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-foreground">Message Sent Successfully!</h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Thank you for reaching out. We have received your query and will respond shortly.
                </p>
                <Button 
                  onClick={() => setStatus('idle')}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 px-4 text-xs mt-2"
                >
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                    <div className="relative">
                      <Input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Farmer/Partner Name"
                        className="pl-9 h-10 rounded-xl border border-border bg-background/30"
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address *</label>
                    <div className="relative">
                      <Input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="pl-9 h-10 rounded-xl border border-border bg-background/30"
                      />
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                    <div className="relative">
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9999999999"
                        className="pl-9 h-10 rounded-xl border border-border bg-background/30"
                      />
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subject</label>
                    <div className="relative">
                      <Input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Inquiry Topic"
                        className="pl-9 h-10 rounded-xl border border-border bg-background/30"
                      />
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can KrishiAI support your farming operations?"
                    className="w-full rounded-xl border border-border bg-background/30 p-3 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-500 font-semibold">
                    Please fill out all required fields (Name, Email, Message).
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white font-bold h-10 px-5 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-500/10"
                >
                  {status === 'submitting' ? (
                    'Sending...'
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
