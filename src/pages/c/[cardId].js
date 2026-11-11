import Link from "next/link";
import { ChevronRight, Download, Mail, MapPin, Phone, Globe, RefreshCw } from "lucide-react";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { buildVCard, CardFront } from "@/components/business-card";
import { Logo } from "@/components/logo";
import { QR_LINK_ICONS } from "@/components/qr-link-icons";
import { getLinkHref, getLinkSubtitle, getLinkTitle, normalizeQrConfig } from "@/lib/qrConfigTypes";

// The page every printed / shared QR code opens.
// It is rendered on the server on every scan (no caching), so visitors always
// see the owner's latest details, even on cards printed long ago.
export async function getServerSideProps({ params, res }) {
  const [{ default: clientPromise }, { findLiveCard }] = await Promise.all([
    import("../../../lib/mongodb/config"),
    import("../../../lib/publicCard"),
  ]);

  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const client = await clientPromise;
    const card = await findLiveCard(client.db("kikqrcard"), params.cardId);
    if (!card) return { notFound: true };
    return { props: { card } };
  } catch (err) {
    console.error("Public card load error:", err);
    return { props: { card: null, failed: true } };
  }
}

function downloadVCardFile(card) {
  const vcard = buildVCard({
    name: card.name,
    profession: card.profession,
    phone: card.phone,
    quote: card.quote,
    email: card.contactEmail,
    website: card.website,
    address: card.address,
  });
  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${card.name || "contact"}.vcf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function QuickAction({ href, icon: Icon, label }) {
  if (!href) return null;
  const isWeb = /^https?:/i.test(href);
  return (
    <a
      href={href}
      {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-card px-2 py-3 text-xs font-medium text-card-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-accent"
    >
      <Icon className="size-5 text-primary" />
      {label}
    </a>
  );
}

export default function PublicCardLanding({ card, failed }) {
  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-foreground">
          {failed ? "This card could not be loaded. Please scan again in a moment." : "Card not found."}
        </p>
      </div>
    );
  }

  const { links } = normalizeQrConfig(card.qrConfig);
  const website = card.website && /^https?:\/\//i.test(card.website) ? card.website : "";
  const updated = card.updatedAt
    ? new Date(card.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-muted px-4 py-8">
      <Seo title={card.name} path={`/c/${card.id}`} noIndex />
      <div className="mx-auto w-full max-w-sm space-y-6">
        <CardFront
          design={card.design}
          bgGrad={card.bgGrad}
          bgStyle={card.bgStyle}
          pattern={card.pattern}
          name={card.name}
          profession={card.profession}
          phone={card.phone}
          email={card.contactEmail}
          website={card.website}
        />

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{card.name}</h1>
          {card.profession && <p className="mt-1 text-sm text-muted-foreground">{card.profession}</p>}
          {card.quote && <p className="mt-3 text-sm italic text-muted-foreground">&ldquo;{card.quote}&rdquo;</p>}
        </div>

        <div className="flex gap-2">
          <QuickAction href={card.phone ? `tel:${card.phone}` : ""} icon={Phone} label="Call" />
          <QuickAction href={card.contactEmail ? `mailto:${card.contactEmail}` : ""} icon={Mail} label="Email" />
          <QuickAction href={website} icon={Globe} label="Website" />
          <QuickAction
            href={card.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.address)}` : ""}
            icon={MapPin}
            label="Map"
          />
        </div>

        <Button size="lg" className="w-full gap-2" onClick={() => downloadVCardFile(card)}>
          <Download className="size-5" />
          Save Contact
        </Button>

        {links.length > 0 && (
          <ul className="space-y-3">
            {links.map((link, i) => {
              const Icon = QR_LINK_ICONS[link.type];
              const isWeb = /^https?:/i.test(getLinkHref(link));
              return (
                <li key={`${link.type}-${i}`}>
                  <a
                    href={getLinkHref(link)}
                    {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-3 rounded-xl bg-card p-3 text-card-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-accent"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{getLinkTitle(link)}</span>
                      <span className="block truncate text-xs text-muted-foreground">{getLinkSubtitle(link)}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-3 pt-2 text-center">
          {updated && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="size-3" />
              Live card · last updated {updated}
            </p>
          )}
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <Logo size="xxs" />
            Get your own smart card
          </Link>
        </div>
      </div>
    </div>
  );
}
