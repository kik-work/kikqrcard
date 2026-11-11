import Head from "next/head";
import QRCode from "react-qr-code";
import { Globe, Mail, Phone, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { getPublicCardUrl, usePublicOrigin } from "@/lib/publicUrl";
import {
  CARD_FONTS,
  CARD_PATTERNS,
  designBackground,
  isLightDesign,
  normalizeDesign,
} from "@/lib/cardDesign";

// Kept here for older imports; the source of truth is src/lib/cardDesign.js.
export { CARD_PATTERNS };

export function buildVCard({ name, profession, phone, quote, email, website, address }) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name || ""}`,
    `TITLE:${profession || ""}`,
    phone ? `TEL:${phone}` : "",
    email ? `EMAIL:${email}` : "",
    website ? `URL:${website}` : "",
    address ? `ADR:;;${address};;;;` : "",
    quote ? `NOTE:${quote}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}

// Card design fonts (see CARD_FONTS). Added only on pages that show a v2 design;
// next/head de-duplicates by key, so it loads once per page.
const CARD_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Great+Vibes&family=JetBrains+Mono:wght@400;700&family=Nunito:wght@400;800&family=Playfair+Display:wght@700&family=Poppins:wght@400;600&family=Space+Grotesk:wght@400;700&display=swap";

export function CardFontsLink() {
  return (
    <Head>
      <link key="card-fonts-preconnect" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link key="card-fonts" rel="stylesheet" href={CARD_FONTS_HREF} />
    </Head>
  );
}

const FINISH_OVERLAY = {
  matte: null,
  glossy: "bg-gradient-to-br from-white/25 via-transparent to-black/20 mix-blend-overlay",
  metallic:
    "bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.45)_42%,transparent_58%,rgba(255,255,255,0.15)_80%,transparent)] mix-blend-overlay",
  frosted: "bg-white/10 backdrop-blur-[1px] ring-1 ring-inset ring-white/25",
};

// One face of a card. `design` (v2) renders with inline styles; without it the
// legacy Tailwind class strings in `bgGrad` / `bgStyle` are used.
export function CardSurface({ design, bgGrad = "", bgStyle = "", pattern = "none", className, children }) {
  const d = normalizeDesign(design);
  const patternDef = CARD_PATTERNS[d ? d.pattern : pattern] || CARD_PATTERNS.none;
  const finish = d ? d.finish : "glossy";
  const textColor = d ? d.text : "#ffffff";

  return (
    <div
      className={cn(
        "group relative flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-[6%] p-[5%] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-black/10 transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.55)]",
        !d && cn("bg-black text-white", bgGrad, bgStyle),
        className,
      )}
      style={
        d
          ? {
              background: designBackground(d),
              color: d.text,
              fontFamily: CARD_FONTS[d.font].body,
            }
          : undefined
      }
    >
      {d && <CardFontsLink />}
      {patternDef.overlayStyle && (
        <div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", patternDef.overlayClass)}
          style={{ ...patternDef.overlayStyle, color: textColor }}
        />
      )}
      {FINISH_OVERLAY[finish] && (
        <div aria-hidden className={cn("pointer-events-none absolute inset-0", FINISH_OVERLAY[finish])} />
      )}
      {children}
    </div>
  );
}

function CardLogo({ design }) {
  return (
    <div className="h-[16px] shrink-0">
      <div className="absolute left-2 top-2">
        <Logo size="xxs" variant={isLightDesign(design) ? "filled" : "on-dark"} />
      </div>
    </div>
  );
}

function NameText({ design, name, size = "text-xl", className }) {
  const d = normalizeDesign(design);
  if (!d) {
    return <p className={cn(size, "font-bold italic tracking-wide", className)}>{name}</p>;
  }
  const font = CARD_FONTS[d.font];
  return (
    <p
      className={cn(size, "leading-tight tracking-wide", font.uppercase && "uppercase", className)}
      style={{
        fontFamily: font.name,
        fontWeight: font.nameWeight,
        fontSize: font.nameScale ? `${font.nameScale}em` : undefined,
      }}
    >
      {name}
    </p>
  );
}

function CardFrontContent({ design, name, profession, phone, email, website }) {
  const d = normalizeDesign(design);
  const layout = d ? d.layout : "centered";
  const accent = d ? d.accent : undefined;
  const phoneRow = phone ? (
    <span className="flex items-center gap-x-2 opacity-80">
      <Phone className="size-3 shrink-0" style={{ color: accent }} />
      <span className="whitespace-nowrap font-mono text-xs tracking-[0.2em]">{phone}</span>
    </span>
  ) : null;

  if (layout === "left") {
    return (
      <>
        <div className="flex flex-1 items-center">
          <div className="flex items-stretch gap-3">
            <span className="w-1 shrink-0 rounded-full" style={{ background: accent || "currentColor" }} />
            <div className="text-left">
              <div className="text-lg"><NameText design={design} name={name} size="text-lg" /></div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] opacity-70">{profession}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-start">{phoneRow}</div>
      </>
    );
  }

  if (layout === "split") {
    return (
      <div className="flex flex-1 items-center gap-3">
        <div className="min-w-0 flex-1 text-left">
          <div className="text-lg"><NameText design={design} name={name} size="text-lg" /></div>
          <p className="mt-1 text-[10px] opacity-70">{profession}</p>
        </div>
        <span className="h-3/5 w-px shrink-0 opacity-40" style={{ background: accent || "currentColor" }} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-[9px] opacity-85">
          {phone && (
            <span className="flex items-center gap-1.5 truncate">
              <Phone className="size-2.5 shrink-0" style={{ color: accent }} />
              {phone}
            </span>
          )}
          {email && (
            <span className="flex items-center gap-1.5 truncate">
              <Mail className="size-2.5 shrink-0" style={{ color: accent }} />
              <span className="truncate">{email}</span>
            </span>
          )}
          {website && (
            <span className="flex items-center gap-1.5 truncate">
              <Globe className="size-2.5 shrink-0" style={{ color: accent }} />
              <span className="truncate">{website.replace(/^https?:\/\//, "")}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  if (layout === "minimal") {
    return (
      <>
        <div className="flex justify-end text-[9px] opacity-70">{phone}</div>
        <div className="text-left">
          <div className="text-base"><NameText design={design} name={name} size="text-base" /></div>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] opacity-60">{profession}</p>
        </div>
      </>
    );
  }

  if (layout === "banner") {
    return (
      <>
        <div className="-mx-[5.5%] flex flex-1 items-center">
          <div
            className="w-full px-[6%] py-2 text-center shadow-sm"
            style={{ background: accent, color: d ? d.colors[0] : undefined }}
          >
            <NameText design={design} name={name} size="text-lg" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10px] opacity-75">{profession}</p>
          {phoneRow}
        </div>
      </>
    );
  }

  // centered (default, and every legacy card)
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <NameText design={design} name={name} />
        <p className="mt-2 text-[10px] opacity-60">{profession}</p>
      </div>
      <div className="mt-6 flex items-center justify-center">{phoneRow}</div>
    </>
  );
}

// Front face only: used by the public card page.
export function CardFront(props) {
  return (
    <CardSurface {...props}>
      <CardLogo design={props.design} />
      <CardFrontContent {...props} />
    </CardSurface>
  );
}

export function BusinessCard({
  name,
  profession,
  phone,
  quote,
  email,
  website,
  address,
  bgGrad = "",
  bgStyle = "",
  pattern = "none",
  design,
  cardId,
  // true: an unsaved card shows "save to activate" instead of a QR.
  qrPlaceholder = false,
}) {
  const origin = usePublicOrigin();
  // Saved cards point at their live public page (/c/<cardId>): the page always
  // reads the latest card data, so printed QR codes never need reprinting.
  // Showcase / template cards with no id fall back to a plain contact vCard.
  const publicUrl = getPublicCardUrl(origin, cardId);
  const qrValue = publicUrl || (qrPlaceholder ? "" : buildVCard({ name, profession, phone, quote, email, website, address }));
  const surface = { design, bgGrad, bgStyle, pattern };

  return (
    <div className="mx-auto flex w-full flex-col gap-4 sm:flex-row">
      {/* back: QR + quote */}
      <CardSurface {...surface}>
        <CardLogo design={design} />
        <div className="flex flex-1 items-center justify-center gap-4">
          {qrValue ? (
            <div className="shrink-0 rounded-md bg-white p-2 shadow-sm">
              <QRCode value={qrValue} size={64} className="size-16" />
            </div>
          ) : (
            <div className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-current p-1 text-center opacity-70">
              <QrCode className="size-6" />
              <span className="text-[8px] leading-tight">Save card to activate QR</span>
            </div>
          )}
          <p className="line-clamp-3 flex-1 text-center text-sm italic leading-snug opacity-80">{quote}</p>
        </div>
        <div className="pt-6">
          <p className="text-center text-[9px] font-light tracking-wide opacity-50">
            &copy; {new Date().getFullYear()}, KIK QRcards. All rights reserved.
          </p>
        </div>
      </CardSurface>

      {/* front: name + profession + contact */}
      <CardSurface {...surface}>
        <CardLogo design={design} />
        <CardFrontContent design={design} name={name} profession={profession} phone={phone} email={email} website={website} />
      </CardSurface>
    </div>
  );
}

export default BusinessCard;
