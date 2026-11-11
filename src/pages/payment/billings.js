import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Receipt, Loader2, Check, Sparkles, Building2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { DashboardLayout } from "@/components/dashboard-shell";
import {
  Banner,
  EmptyState,
  FullscreenStatus,
  HistoryList,
  HistoryRow,
  IconTile,
  ListSkeleton,
  PageHeader,
  SectionHeading,
  Surface,
  useDashboardUser,
} from "@/components/dashboard-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLANS } from "@/../lib/bkash/plans";

// "manual" (default): plan requests go to the owner on WhatsApp/email and are approved by hand.
// Set NEXT_PUBLIC_PAYMENT_MODE=bkash once a bKash merchant account is configured.
const MANUAL_PAYMENTS = process.env.NEXT_PUBLIC_PAYMENT_MODE !== "bkash";

const PLAN_DISPLAY = {
  personal: {
    id: "personal",
    name: "Personal",
    icon: Sparkles,
    tone: "indigo",
    price: `৳${Number(PLANS.personal.amount).toLocaleString("en-US")}`,
    cycle: "/month",
    tagline: "For individuals building their network.",
    features: [
      "5 physical card orders / month",
      "Up to 5 virtual cards",
      "QR contact sharing",
      "Standard support",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    icon: Building2,
    tone: "blue",
    price: `৳${Number(PLANS.business.amount).toLocaleString("en-US")}`,
    cycle: "/year",
    tagline: "For teams issuing cards at scale.",
    features: [
      "10–50 physical card orders / month",
      "Up to 100 virtual cards",
      "QR contact sharing",
      "Priority support",
    ],
    highlight: true,
  },
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";

const Billings = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = useDashboardUser();
  const [loading, setLoading] = useState(false);
  const [payingPlan, setPayingPlan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const { plan, status: paymentStatus, trxID } = router.query;
  const preselectedPlan = PLAN_DISPLAY[plan] ? plan : null;
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan);

  useEffect(() => {
    if (preselectedPlan) setSelectedPlan(preselectedPlan);
  }, [preselectedPlan]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/authentication/login");
    }
  }, [status]);

  const fetchHistory = useCallback(async (email) => {
    setLoadingHistory(true);
    try {
      const { data } = await axios.get("/api/payment/bkash/history", {
        params: { email },
      });
      setPayments(data.payments || []);
    } catch (err) {
      console.error("Error fetching payment history:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    fetchHistory(email);
  }, [session, fetchHistory]);

  useEffect(() => {
    if (!paymentStatus) return;
    if (paymentStatus === "success") {
      toast.success(trxID ? `Payment successful. Transaction ID: ${trxID}` : "Payment successful.");
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled.");
    } else if (paymentStatus === "failed" || paymentStatus === "error") {
      toast.error("Payment failed. Please try again.");
    }
    const email = session?.user?.email;
    if (email) fetchHistory(email);
  }, [paymentStatus, trxID]);

  // No merchant account yet: save a plan request, alert the owner and open WhatsApp
  // so the customer can pay by bKash / Nagad. The owner activates the plan from /admin/payments.
  const handleManualRequest = async () => {
    setLoading(true);
    setPayingPlan(selectedPlan);
    try {
      const { data } = await axios.post("/api/payment/plans/request", { planId: selectedPlan });
      toast.success(
        data.alreadyPending
          ? `Your request ${data.invoiceNumber} is already waiting for approval.`
          : `Request ${data.invoiceNumber} sent. We will activate your plan after payment.`,
      );
      if (data.whatsappUrl) window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      const email = session?.user?.email;
      if (email) fetchHistory(email);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send plan request.");
    } finally {
      setLoading(false);
      setPayingPlan(null);
    }
  };

  const handlePay = async () => {
    if (!selectedPlan) return;
    if (MANUAL_PAYMENTS) return handleManualRequest();
    setLoading(true);
    setPayingPlan(selectedPlan);
    try {
      const res = await fetch("/api/payment/bkash/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan }),
      });
      const data = await res.json();

      if (!res.ok || !data.bkashURL) {
        toast.error(data.error || "Failed to start bKash payment.");
        setLoading(false);
        setPayingPlan(null);
        return;
      }

      window.location.href = data.bkashURL;
    } catch (err) {
      toast.error("Failed to start bKash payment.");
      setLoading(false);
      setPayingPlan(null);
    }
  };

  if (status === "loading") {
    return <FullscreenStatus title="Loading…" />;
  }

  const activePlan = selectedPlan ? PLAN_DISPLAY[selectedPlan] : null;
  const currentPlanId = PLAN_DISPLAY[user?.plan] ? user.plan : null;

  return (
    <DashboardLayout title="Billing" path="/payment/billings" width="max-w-5xl">
      <div className="space-y-8 sm:space-y-10">
        <PageHeader
          title="Plans & billing"
          description="Choose a plan to unlock more virtual cards and physical card orders."
        />

        {paymentStatus === "success" && (
          <Banner tone="success">
            Payment successful{trxID ? ` — Transaction ID: ${trxID}` : ""}. Your plan is now active.
          </Banner>
        )}
        {(paymentStatus === "failed" || paymentStatus === "error") && (
          <Banner tone="danger">Payment failed. Please try again.</Banner>
        )}
        {paymentStatus === "cancelled" && <Banner tone="neutral">Payment was cancelled.</Banner>}

        {/* plan picker */}
        <div role="radiogroup" aria-label="Choose a plan" className="grid gap-4 md:grid-cols-2 md:gap-6">
          {Object.values(PLAN_DISPLAY).map((p) => {
            const isSelected = selectedPlan === p.id;
            const isCurrent = currentPlanId === p.id;
            return (
              <Surface
                key={p.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setSelectedPlan(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPlan(p.id);
                  }
                }}
                className={cn(
                  "cursor-pointer p-6 outline-none ring-2 ring-transparent transition-all duration-300 ease-apple focus-visible:ring-ring/60 sm:p-7",
                  isSelected ? "ring-primary shadow-lift" : "hover:shadow-lift",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconTile icon={p.icon} tone={p.tone} />
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                      {p.name}
                    </h2>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {isCurrent && (
                      <span className="rounded-full bg-ios-green/15 px-2.5 py-1 text-xs font-medium text-success">
                        Current plan
                      </span>
                    )}
                    {p.highlight && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        Most popular
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-[-0.035em] text-foreground">
                    {p.price}
                  </span>
                  <span className="text-sm text-muted-foreground">BDT{p.cycle}</span>
                </p>

                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div
                  className={cn(
                    "mt-7 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-black/[0.06] text-foreground",
                  )}
                >
                  {isSelected && <Check className="size-4" strokeWidth={2.5} />}
                  {isSelected ? "Selected" : "Select plan"}
                </div>
              </Surface>
            );
          })}
        </div>

        {/* checkout bar */}
        {activePlan && (
          <div className="sticky bottom-24 z-20 md:bottom-6">
            <Surface className="flex flex-col items-start justify-between gap-4 bg-card/85 p-4 shadow-lift backdrop-blur-2xl sm:flex-row sm:items-center sm:px-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Checking out</p>
                <p className="text-base font-semibold tracking-[-0.015em] text-foreground">
                  {activePlan.name} plan · {activePlan.price}
                  <span className="text-sm font-normal text-muted-foreground"> BDT{activePlan.cycle}</span>
                </p>
              </div>
              <Button
                size="lg"
                onClick={handlePay}
                disabled={loading}
                className="w-full bg-[#e2136e] text-white hover:bg-[#c10f5e] sm:w-auto"
              >
                {loading && payingPlan === activePlan.id ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {MANUAL_PAYMENTS ? "Sending request…" : "Redirecting to bKash…"}
                  </>
                ) : MANUAL_PAYMENTS ? (
                  "Request plan on WhatsApp"
                ) : (
                  "Pay with bKash"
                )}
              </Button>
            </Surface>
          </div>
        )}

        {/* transaction history */}
        <section className="space-y-4">
          <SectionHeading title="Transactions" />
          {loadingHistory ? (
            <Surface>
              <ListSkeleton />
            </Surface>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              message="All your payment details will display here."
            />
          ) : (
            <Surface className="overflow-hidden">
              <HistoryList>
                {payments.map((p) => (
                  <HistoryRow
                    key={p._id || p.paymentID}
                    icon={Receipt}
                    title={`${p.planName} plan`}
                    subtitle={`${p.invoiceNumber} · ${formatDate(p.createdAt)}`}
                    amount={`${p.amount} ${p.currency}`}
                    status={p.status}
                  />
                ))}
              </HistoryList>
            </Surface>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Billings;
