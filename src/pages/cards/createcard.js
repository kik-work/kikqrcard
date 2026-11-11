"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  BookOpenCheck,
  Check,
  ExternalLink,
  Heart,
  Loader2,
  Package,
  PinIcon,
  RefreshCw,
  Save,
  Sparkles,
  Star,
  Wand2,
  Workflow,
} from "lucide-react";
import axios from "axios";
import { DashboardLayout } from "@/components/dashboard-shell";
import BusinessCard, { CardFontsLink, CardSurface } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CARD_FINISHES,
  CARD_FONTS,
  CARD_LAYOUTS,
  CARD_PATTERNS,
  DEFAULT_DESIGN,
  DESIGN_PRESETS,
  PALETTES,
  PRESET_CATEGORIES,
  designBackground,
  normalizeDesign,
} from "@/lib/cardDesign";

const EMPTY_INFO = {
  name: "",
  profession: "",
  phone: "",
  quote: "",
  email: "",
  website: "",
  address: "",
};

const AI_SUGGESTIONS = [
  "Navy and gold card for a lawyer",
  "Minimal white card for a doctor",
  "Dark tech card for a software developer",
  "Playful pink card for a home bakery",
  "Luxury black and gold for a real estate agent",
  "Green nature card for an organic farm",
];

// Field rules. Kept short so text fits on a printed 85 x 54 mm card.
const VALIDATORS = {
  name: (v) => (!/^[\p{L}\s.'-]{2,30}$/u.test(v) ? "2-30 letters." : ""),
  profession: (v) => (!/^[\p{L}\d\s&,./+-]{2,40}$/u.test(v) ? "2-40 characters." : ""),
  phone: (v) => (!/^\+?\d{6,15}$/.test(v) ? "Digits only (6-15), optional leading +." : ""),
  quote: (v) => (!v.trim() ? "Add a short tagline." : v.length > 60 ? "Max 60 characters." : ""),
  email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email." : ""),
  website: (v) => (v && !/^https?:\/\/[^\s]+\.[^\s]+$/.test(v) ? "Start with http:// or https://" : ""),
  address: (v) => (v.length > 80 ? "Max 80 characters." : ""),
};

const FIELDS = [
  { key: "name", label: "Name", placeholder: "Your full name", required: true },
  { key: "profession", label: "Profession", placeholder: "e.g. Software Engineer", required: true },
  { key: "phone", label: "Phone", placeholder: "01XXXXXXXXX", required: true, inputMode: "tel" },
  { key: "quote", label: "Tagline", placeholder: "A short line about you", required: true },
  { key: "email", label: "Email", placeholder: "you@example.com", inputMode: "email" },
  { key: "website", label: "Website / portfolio", placeholder: "https://", inputMode: "url" },
  { key: "address", label: "Address", placeholder: "Area, City" },
];

function OptionButton({ active, onClick, children, className, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent",
        className,
      )}
    >
      {children}
    </button>
  );
}

function PresetTile({ preset, active, onClick }) {
  const font = CARD_FONTS[preset.design.font];
  return (
    <button type="button" onClick={onClick} className="group text-left" aria-pressed={active} title={preset.label}>
      <CardSurface
        design={preset.design}
        className={cn("rounded-lg p-2 shadow-none hover:translate-y-0", active ? "ring-2 ring-primary ring-offset-2" : "")}
      >
        <span
          className={cn("relative mt-auto truncate text-sm", font.uppercase && "uppercase")}
          style={{ fontFamily: font.name, fontWeight: font.nameWeight }}
        >
          Aa {preset.label.split(" ")[0]}
        </span>
      </CardSurface>
      <span className="mt-1 block truncate text-xs text-muted-foreground group-hover:text-foreground">{preset.label}</span>
    </button>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-8 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
      />
      {label}
    </label>
  );
}

export default function CreateCard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const editId = typeof router.query.id === "string" ? router.query.id : "";
  const isEditMode = editId.length > 0;

  const [cardInfo, setCardInfo] = useState(EMPTY_INFO);
  const [errors, setErrors] = useState({});
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  // Cards saved before the v2 design model keep their Tailwind classes until restyled.
  const [legacy, setLegacy] = useState(null);
  const [cardName, setCardName] = useState("");
  const [editLoaded, setEditLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState("All");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiVariant, setAiVariant] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const [flags, setFlags] = useState({ saved: false, public: false, loved: false, favourite: false, highlighted: false });

  useEffect(() => {
    if (status !== "unauthenticated") return;
    const timer = setTimeout(() => router.push("/authentication/login"), 3000);
    return () => clearTimeout(timer);
  }, [status, router]);

  // New cards get an automatic internal name from name + profession.
  useEffect(() => {
    if (isEditMode) return;
    const n = cardInfo.name.trim().toLowerCase().replace(/\s+/g, "").slice(0, 3);
    const p = cardInfo.profession.trim().toLowerCase().replace(/\s+/g, "").slice(0, 3);
    setCardName(`kik${n}${p}qrcard`);
  }, [isEditMode, cardInfo.name, cardInfo.profession]);

  // Edit mode: load the saved card.
  useEffect(() => {
    const email = session?.user?.email;
    if (!isEditMode || !email || editLoaded) return;
    let cancelled = false;

    axios
      .get(`/api/getCards/getsavedcard?email=${encodeURIComponent(email)}`)
      .then((res) => {
        if (cancelled) return;
        const match = (res.data?.savedCards || []).find((card) => card._id === editId);
        if (!match) {
          toast.error("Card not found for editing.");
          return;
        }
        setCardInfo({
          name: match.name || "",
          profession: match.profession || "",
          phone: match.phone || "",
          quote: match.quote || "",
          email: match.contactEmail || "",
          website: match.website || "",
          address: match.address || "",
        });
        const saved = normalizeDesign(match.design);
        if (saved) {
          setDesign(saved);
          setLegacy(null);
        } else {
          setLegacy({ bgGrad: match.bgGrad, bgStyle: match.bgStyle, pattern: match.pattern || "none" });
        }
        setCardName(match.cardName);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error("Failed to load card for editing.");
          console.error("Error loading card:", err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setEditLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [session, isEditMode, editId, editLoaded]);

  // Which collections already hold this card (drives the action buttons).
  useEffect(() => {
    const email = session?.user?.email;
    if (!email || !cardName) return;
    const name = cardName.toLowerCase();
    let cancelled = false;
    const q = `email=${encodeURIComponent(email)}`;

    Promise.all([
      axios.get(`/api/getCards/getsavedcard?${q}`),
      axios.get(`/api/getCards/getallcards`),
      axios.get(`/api/getCards/getlovedcard?${q}`),
      axios.get(`/api/getCards/getfavouritecard?${q}`),
      axios.get(`/api/getCards/gethighlightedcard?${q}`),
    ])
      .then(([savedRes, allRes, lovedRes, favRes, hiRes]) => {
        if (cancelled) return;
        const has = (list) => (list || []).some((c) => c.cardName === name);
        setFlags({
          saved: has(savedRes.data?.savedCards),
          public: (allRes.data?.allcards || []).some((c) => c.email === email && c.cardName === name),
          loved: has(lovedRes.data?.lovedCards),
          favourite: has(favRes.data?.favouriteCards),
          highlighted: has(hiRes.data?.highlightedCards),
        });
      })
      .catch((err) => console.error("Error checking card status:", err.message));

    return () => {
      cancelled = true;
    };
  }, [session, cardName]);

  const visiblePresets = useMemo(
    () => (category === "All" ? DESIGN_PRESETS : DESIGN_PRESETS.filter((p) => p.category === category)),
    [category],
  );

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg font-semibold text-primary">Checking session...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center px-4 text-center">
        <p className="text-2xl font-semibold text-primary">You are not logged in. Redirecting to login page...</p>
      </div>
    );
  }

  const updateDesign = (patch) => {
    setLegacy(null);
    setDesign((d) => normalizeDesign({ ...d, ...patch }));
  };

  const setField = (key, value) => {
    setCardInfo((info) => ({ ...info, [key]: value }));
    setErrors((e) => ({ ...e, [key]: VALIDATORS[key](value) }));
  };

  const validateAll = () => {
    const next = {};
    for (const key of Object.keys(VALIDATORS)) next[key] = VALIDATORS[key](cardInfo[key] || "");
    setErrors(next);
    return Object.values(next).every((e) => !e);
  };

  const payload = () => ({
    cardName,
    name: cardInfo.name.trim(),
    profession: cardInfo.profession.trim(),
    phone: cardInfo.phone.trim(),
    quote: cardInfo.quote.trim(),
    contactEmail: cardInfo.email.trim(),
    website: cardInfo.website.trim(),
    address: cardInfo.address.trim(),
    ...(legacy ? { bgGrad: legacy.bgGrad, bgStyle: legacy.bgStyle, pattern: legacy.pattern } : { design }),
  });

  const handleSave = async () => {
    if (!validateAll()) {
      toast.error("Fix the highlighted card details first.");
      return;
    }
    setSaving(true);
    try {
      if (isEditMode) {
        await axios.put("/api/cards/updateCard", { id: editId, ...payload() });
        toast.success("Card updated. Your QR now shows the new details.");
        return;
      }
      const { data } = await axios.post("/api/cards/saveCards", payload());
      toast.success("Card saved. Your QR code is live!");
      setFlags((f) => ({ ...f, saved: true }));
      // Switch to edit mode on the saved card so the preview shows its real, permanent QR.
      router.replace(`/cards/createcard?id=${data.id}`, undefined, { shallow: true });
      setEditLoaded(true);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("You already saved a card with this name and design.");
      } else if (error.response?.status === 403) {
        toast.error(error.response.data?.error || "Virtual card limit reached.");
      } else {
        toast.error(error.response?.data?.error || (isEditMode ? "Error updating card." : "Error saving card."));
      }
    } finally {
      setSaving(false);
    }
  };

  const saveCopy = (endpoint, flagKey, flagField, label) => async () => {
    if (flags[flagKey]) return;
    if (!validateAll()) {
      toast.error("Fix the highlighted card details first.");
      return;
    }
    try {
      await axios.post(endpoint, {
        ...payload(),
        [flagField]: true,
        sourceCardId: isEditMode ? editId : undefined,
      });
      toast.success(`Card added to ${label}.`);
      setFlags((f) => ({ ...f, [flagKey]: true }));
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("This card is already there.");
        setFlags((f) => ({ ...f, [flagKey]: true }));
      } else {
        toast.error("Error saving card.");
      }
    }
  };

  const runAi = async (prompt = aiPrompt, variant = 0) => {
    const text = prompt.trim();
    if (text.length < 3) {
      toast.error("Describe the card you want in a few words.");
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await axios.post("/api/ai/design", { prompt: text, variant });
      updateDesign(data.design);
      setAiResult(data);
      setAiVariant(variant);
    } catch (err) {
      toast.error(err.response?.data?.error || "AI design failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const actionButtons = [
    { label: "Love", activeLabel: "Loved", icon: Heart, onClick: saveCopy("/api/cards/lovedCards", "loved", "isloved", "Loved"), active: flags.loved },
    { label: "Favourite", activeLabel: "Favourited", icon: Star, onClick: saveCopy("/api/cards/favouriteCards", "favourite", "isfavourite", "Favourites"), active: flags.favourite },
    { label: "Highlight", activeLabel: "Highlighted", icon: PinIcon, onClick: saveCopy("/api/cards/highlightedCards", "highlighted", "ishighlighted", "Highlighted"), active: flags.highlighted },
    { label: "Public", activeLabel: "Public", icon: BookOpenCheck, onClick: saveCopy("/api/cards/publiccards", "public", "publicCard", "public cards"), active: flags.public },
    {
      label: "QR links",
      icon: Workflow,
      onClick: () => (isEditMode ? router.push(`/cards/qrconfig?id=${editId}`) : toast.error("Save your card first, then set up its QR links.")),
    },
    {
      label: "Order print",
      icon: Package,
      onClick: () => (isEditMode ? router.push(`/payment/orders?card=${editId}`) : toast.error("Save your card first, then order it.")),
    },
  ];

  const preview = {
    name: cardInfo.name || "Your Name",
    profession: cardInfo.profession || "Your Profession",
    phone: cardInfo.phone || "01XXXXXXXXX",
    quote: cardInfo.quote || "Your tagline here",
    email: cardInfo.email,
    website: cardInfo.website,
    address: cardInfo.address,
  };

  return (
    <DashboardLayout title="Create Card" path="/cards/createcard">
      <CardFontsLink />
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[2.125rem]">
              {isEditMode ? "Edit card" : "Create card"}
            </h1>
            <p className="mt-1 text-[0.9375rem] text-muted-foreground">
              {isEditMode
                ? "Changes go live on your QR page as soon as you save."
                : "Pick a template, let AI design it, or style every detail yourself."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={isEditMode || flags.saved ? "default" : "outline"}>
              {isEditMode || flags.saved ? "Saved · QR live" : "Not saved"}
            </Badge>
            <Badge variant={flags.public ? "default" : "outline"}>{flags.public ? "Public" : "Not public"}</Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* left column: details + design */}
          <div className="space-y-6">
            <UICard>
              <CardHeader>
                <CardTitle>Card details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.key} className={cn("space-y-1.5", (f.key === "quote" || f.key === "address") && "sm:col-span-2")}>
                    <Label htmlFor={f.key}>
                      {f.label}
                      {f.required && <span className="ml-0.5 text-destructive">*</span>}
                    </Label>
                    <Input
                      id={f.key}
                      value={cardInfo[f.key]}
                      inputMode={f.inputMode}
                      onChange={(e) => setField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      aria-invalid={!!errors[f.key]}
                    />
                    {errors[f.key] && <p className="text-xs text-destructive">{errors[f.key]}</p>}
                  </div>
                ))}
              </CardContent>
            </UICard>

            <UICard>
              <CardHeader>
                <CardTitle>Design</CardTitle>
              </CardHeader>
              <CardContent>
                {legacy && (
                  <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    This card uses a classic design. Pick any template or style below to upgrade it.
                  </p>
                )}
                <Tabs defaultValue="templates">
                  <TabsList className="w-full">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="ai">
                      <Sparkles className="size-3.5" /> AI design
                    </TabsTrigger>
                    <TabsTrigger value="custom">Customize</TabsTrigger>
                  </TabsList>

                  {/* templates */}
                  <TabsContent value="templates" className="mt-4 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {["All", ...PRESET_CATEGORIES].map((c) => (
                        <OptionButton key={c} active={category === c} onClick={() => setCategory(c)} className="rounded-full px-3 py-1 text-xs">
                          {c}
                        </OptionButton>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {visiblePresets.map((p) => (
                        <PresetTile
                          key={p.id}
                          preset={p}
                          active={!legacy && JSON.stringify(design) === JSON.stringify(p.design)}
                          onClick={() => updateDesign(p.design)}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{DESIGN_PRESETS.length} templates. Fine-tune any of them in Customize.</p>
                  </TabsContent>

                  {/* AI */}
                  <TabsContent value="ai" className="mt-4 space-y-4">
                    <Label htmlFor="ai-prompt">Describe your card</Label>
                    <textarea
                      id="ai-prompt"
                      rows={3}
                      maxLength={300}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Elegant dark blue card with gold accents for a corporate lawyer"
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {AI_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setAiPrompt(s);
                            runAi(s, 0);
                          }}
                          className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => runAi(aiPrompt, 0)} disabled={aiLoading}>
                        {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                        Generate design
                      </Button>
                      {aiResult && (
                        <Button type="button" variant="outline" onClick={() => runAi(aiPrompt, aiVariant + 1)} disabled={aiLoading}>
                          <RefreshCw className="size-4" /> Try another
                        </Button>
                      )}
                    </div>
                    {aiResult && (
                      <div className="rounded-lg border border-border p-3 text-sm">
                        <p className="flex items-center gap-2 font-medium text-foreground">
                          {aiResult.title}
                          <Badge variant="outline">{aiResult.source === "claude" ? "Claude AI" : "Demo AI"}</Badge>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{aiResult.summary}</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* customize */}
                  <TabsContent value="custom" className="mt-4 space-y-6">
                    <section className="space-y-2">
                      <Label>Colour palette</Label>
                      <div className="grid grid-cols-7 gap-2">
                        {Object.entries(PALETTES).map(([key, p]) => (
                          <button
                            key={key}
                            type="button"
                            title={p.label}
                            onClick={() => updateDesign({ colors: p.colors, text: p.text, accent: p.accent })}
                            className={cn(
                              "aspect-square rounded-md border-2 transition-transform hover:scale-105",
                              !legacy && design.colors.join() === p.colors.join() ? "border-primary" : "border-transparent",
                            )}
                            style={{ background: designBackground({ colors: p.colors, angle: 135 }) }}
                          />
                        ))}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <Label>Custom colours</Label>
                      <div className="flex flex-wrap gap-4">
                        {[0, 1, 2].map((i) =>
                          design.colors[i] ? (
                            <ColorInput
                              key={i}
                              label={`Stop ${i + 1}`}
                              value={design.colors[i]}
                              onChange={(v) => {
                                const colors = [...design.colors];
                                colors[i] = v;
                                updateDesign({ colors });
                              }}
                            />
                          ) : null,
                        )}
                        <ColorInput label="Text" value={design.text} onChange={(v) => updateDesign({ text: v })} />
                        <ColorInput label="Accent" value={design.accent} onChange={(v) => updateDesign({ accent: v })} />
                      </div>
                      <div className="flex gap-2">
                        {design.colors.length < 3 && (
                          <Button type="button" size="sm" variant="outline" onClick={() => updateDesign({ colors: [...design.colors, design.accent] })}>
                            Add colour stop
                          </Button>
                        )}
                        {design.colors.length > 1 && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => updateDesign({ colors: design.colors.slice(0, -1) })}>
                            Remove stop
                          </Button>
                        )}
                      </div>
                      <label className="block space-y-1 text-xs text-muted-foreground">
                        Gradient angle: {design.angle}°
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={5}
                          value={design.angle}
                          onChange={(e) => updateDesign({ angle: Number(e.target.value) })}
                          className="w-full accent-primary"
                        />
                      </label>
                    </section>

                    <section className="space-y-2">
                      <Label>Font</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {Object.entries(CARD_FONTS).map(([key, f]) => (
                          <OptionButton key={key} active={!legacy && design.font === key} onClick={() => updateDesign({ font: key })}>
                            <span className={cn("block truncate", f.uppercase && "uppercase")} style={{ fontFamily: f.name, fontWeight: f.nameWeight }}>
                              {f.label}
                            </span>
                          </OptionButton>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-2">
                      <Label>Layout</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(CARD_LAYOUTS).map(([key, l]) => (
                          <OptionButton key={key} active={!legacy && design.layout === key} onClick={() => updateDesign({ layout: key })}>
                            {l.label}
                          </OptionButton>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-2">
                      <Label>Pattern</Label>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {Object.entries(CARD_PATTERNS).map(([key, def]) => (
                          <button
                            key={key}
                            type="button"
                            title={def.label}
                            onClick={() => updateDesign({ pattern: key })}
                            className={cn(
                              "relative h-10 overflow-hidden rounded-md border-2 transition-transform hover:scale-105",
                              !legacy && design.pattern === key ? "border-primary" : "border-border",
                            )}
                            style={{ background: designBackground(design), color: design.text }}
                          >
                            {def.overlayStyle && (
                              <span aria-hidden className={cn("absolute inset-0", def.overlayClass)} style={def.overlayStyle} />
                            )}
                            <span className="relative text-[9px] font-medium">{def.label}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-2">
                      <Label>Finish</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(CARD_FINISHES).map(([key, f]) => (
                          <OptionButton key={key} active={!legacy && design.finish === key} onClick={() => updateDesign({ finish: key })}>
                            {f.label}
                          </OptionButton>
                        ))}
                      </div>
                    </section>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </UICard>
          </div>

          {/* right column: preview */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <BusinessCard
                {...preview}
                design={legacy ? undefined : design}
                bgGrad={legacy?.bgGrad}
                bgStyle={legacy?.bgStyle}
                pattern={legacy?.pattern}
                cardId={isEditMode ? editId : undefined}
                qrPlaceholder
              />
            </div>

            <UICard>
              <CardContent className="space-y-3 pt-6 text-sm">
                {isEditMode ? (
                  <>
                    <p className="text-muted-foreground">
                      Your QR opens a live page that always shows the latest saved details, so printed cards never go out of date.
                    </p>
                    <Link href={`/c/${editId}`} target="_blank" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                      Open live card page <ExternalLink className="size-3.5" />
                    </Link>
                  </>
                ) : (
                  <p className="text-muted-foreground">Save the card to activate its permanent QR code.</p>
                )}
                <Button type="button" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {isEditMode ? "Save changes" : "Save card"}
                </Button>
              </CardContent>
            </UICard>
          </div>
        </div>

        {/* card actions */}
        <UICard>
          <CardHeader>
            <CardTitle>Card actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {actionButtons.map(({ label, activeLabel, icon: Icon, onClick, active, activeClass }) => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  onClick={onClick}
                  disabled={!!active}
                  className={cn(
                    "h-auto flex-col gap-1.5 py-4",
                    active && "border-green-500 bg-green-50 text-green-600 disabled:opacity-100 dark:bg-green-950/40",
                    activeClass,
                  )}
                >
                  {active ? <Check className="size-5" /> : <Icon className="size-5" />}
                  {active ? activeLabel : label}
                </Button>
              ))}
            </div>
          </CardContent>
        </UICard>
      </div>
    </DashboardLayout>
  );
}
