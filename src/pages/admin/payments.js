import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRequireAdmin } from "@/lib/useRequireAdmin";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending approval" },
  { value: "completed", label: "Completed" },
  { value: "initiated", label: "Initiated" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_VARIANT = {
  pending: "secondary",
  completed: "default",
  initiated: "outline",
  failed: "destructive",
  cancelled: "destructive",
};

function AdminPayments() {
  const { ready } = useRequireAdmin();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const fetchPayments = useCallback(async (status = "all") => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/payments", {
        params: status === "all" ? {} : { status },
      });
      setPayments(data.payments || []);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) fetchPayments(tab);
  }, [ready, tab, fetchPayments]);

  const [busyId, setBusyId] = useState(null);

  // Manual plan requests: approve after the customer pays on bKash / Nagad.
  const review = async (payment, action) => {
    let trxID = "";
    if (action === "approve") {
      trxID = window.prompt(`Approve ${payment.planName || payment.planId} for ${payment.email}?\nTransaction ID (optional):`, "");
      if (trxID === null) return;
    } else if (!window.confirm(`Reject the plan request from ${payment.email}?`)) {
      return;
    }
    setBusyId(payment._id);
    try {
      const { data } = await axios.patch("/api/admin/payments", { id: payment._id, action, trxID });
      toast.success(data.message);
      fetchPayments(tab);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update payment");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout title="Payments" ready={ready}>
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[2.125rem]">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {payments.length} payment{payments.length === 1 ? "" : "s"}
        </p>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList>
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab}>
            <div className="mt-4 overflow-hidden rounded-[1.25rem] bg-card shadow-card [&_tbody_tr]:transition-colors [&_td]:px-4 [&_td]:py-3 [&_th]:h-11 [&_th]:px-4 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground [&_thead]:bg-black/[0.025]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Trx ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        <Loader2 className="mx-auto size-5 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell className="font-medium">{p.email}</TableCell>
                        <TableCell>{p.planName || p.planId || "—"}</TableCell>
                        <TableCell>৳{Number(p.amount).toLocaleString()}</TableCell>
                        <TableCell>{p.trxID || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[p.status] || "outline"}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" disabled={busyId === p._id} onClick={() => review(p, "approve")}>
                                Approve
                              </Button>
                              <Button size="sm" variant="ghost" disabled={busyId === p._id} onClick={() => review(p, "reject")}>
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">{p.method === "manual" ? "Manual" : "bKash"}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
    </AdminLayout>
  );
}

export default AdminPayments;
