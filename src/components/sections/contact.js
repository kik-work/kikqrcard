import { forwardRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionIntro } from "@/components/sections/section-intro";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/profile.php?id=61578126735116", icon: "/facebook.svg", label: "Facebook" },
  { href: "https://wa.me/8801923089370", icon: "/wp.svg", label: "WhatsApp" },
  { href: "https://rb.gy/6t2at1", icon: "/linkedin.svg", label: "LinkedIn" },
];

const CHANNELS = [
  { icon: Phone, label: "Call us", value: "01923089370", href: "tel:+8801923089370" },
  { icon: MessageCircle, label: "WhatsApp", value: "Chat with the team", href: "https://wa.me/8801923089370" },
  { icon: Mail, label: "Email", value: "kakon.aiubcse@gmail.com", href: "mailto:kakon.aiubcse@gmail.com" },
  { icon: MapPin, label: "Location", value: "Dhaka, Bangladesh" },
];

const EMPTY = { name: "", email: "", phone: "", message: "" };
const fieldClass = "h-12 rounded-xl border-border/80 bg-background px-4 text-[0.95rem]";

const Contact = forwardRef((props, ref) => {
  const [formData, setFormData] = useState(EMPTY);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Thanks! We'll get back to you soon.");
        setFormData(EMPTY);
      } else {
        toast.error("Failed to send message.");
        console.error(result);
      }
    } catch (error) {
      toast.error("Failed to send message.");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <section ref={ref} id="contact" className="relative w-full overflow-hidden bg-[#f7f6fc] py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-50 mask-radial" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Contact"
          title="Talk to a real person."
          description="Questions about bulk orders, designs or plans? We usually reply within a day."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-ink p-7 text-white shadow-float sm:p-9">
              <div aria-hidden className="absolute inset-0 bg-grid-dark" />
              <div aria-hidden className="absolute -bottom-24 -left-16 size-72 rounded-full bg-primary/40 blur-3xl" />
              <div className="relative flex h-full flex-col">
                <h3 className="text-2xl font-bold tracking-tight">Get in touch</h3>
                <p className="mt-2 text-white/60">Pick the channel that suits you.</p>

                <ul className="mt-8 flex flex-col gap-3">
                  {CHANNELS.map(({ icon: Icon, label, value, href }) => {
                    const body = (
                      <>
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition-colors group-hover:bg-primary">
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-white/50">{label}</span>
                          <span className="block truncate font-semibold">{value}</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={label}>
                        {href ? (
                          <a
                            href={href}
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-white/[0.06]"
                          >
                            {body}
                          </a>
                        ) : (
                          <div className="group flex items-center gap-4 p-2">{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-auto flex gap-3 pt-10">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex size-11 items-center justify-center rounded-full bg-white transition-transform duration-300 ease-out-expo hover:-translate-y-1"
                    >
                      <Image src={social.icon} width={20} height={20} className="size-5" alt="" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <form
              onSubmit={handleSubmit}
              className="flex h-full flex-col gap-5 rounded-[1.75rem] border border-border/70 bg-card p-7 shadow-card sm:p-9"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input id="contact-name" name="name" required autoComplete="name" onChange={handleChange} value={formData.name} placeholder="Your name" className={fieldClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-phone">Phone number</Label>
                  <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" onChange={handleChange} value={formData.phone} placeholder="01XXXXXXXXX" className={fieldClass} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" name="email" type="email" required autoComplete="email" onChange={handleChange} value={formData.email} placeholder="you@example.com" className={fieldClass} />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="contact-message">How can we help?</Label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  onChange={handleChange}
                  value={formData.message}
                  placeholder="Tell us a little about what you need…"
                  rows={5}
                  className="flex min-h-32 w-full flex-1 resize-none rounded-xl border border-border/80 bg-background px-4 py-3 text-[0.95rem] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <Button type="submit" size="lg" disabled={sending} className="group h-12 rounded-full text-[0.95rem] shadow-glow">
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                )}
                {sending ? "Sending…" : "Send message"}
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
});

Contact.displayName = "Contact";

export default Contact;
