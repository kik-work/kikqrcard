import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin-shell";
import BusinessCard, { CARD_PATTERNS } from "@/components/business-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRequireAdmin } from "@/lib/useRequireAdmin";

const GRADIENT_OPTIONS = [
  { bgGrad: "bg-gradient-to-tr", bgStyle: "from-indigo-500 to-sky-500", label: "Indigo / Sky" },
  { bgGrad: "bg-gradient-to-br", bgStyle: "from-orange-600 via-amber-400 to-red-500", label: "Orange / Amber" },
  { bgGrad: "bg-gradient-to-tr", bgStyle: "from-teal-600 to-slate-900", label: "Teal / Slate" },
  { bgGrad: "bg-gradient-to-br", bgStyle: "from-fuchsia-600 to-purple-900", label: "Fuchsia / Purple" },
  { bgGrad: "bg-gradient-to-tr", bgStyle: "from-emerald-500 to-lime-500", label: "Emerald / Lime" },
  { bgGrad: "bg-gradient-to-br", bgStyle: "from-zinc-800 to-zinc-950", label: "Black / Zinc" },
  { bgGrad: "bg-gradient-to-tr", bgStyle: "from-yellow-400 via-yellow-500 to-yellow-700", label: "Gold" },
  { bgGrad: "bg-gradient-to-br", bgStyle: "from-slate-300 via-slate-400 to-slate-600", label: "Silver" },
];

const EMPTY_FORM = {
  name: "",
  profession: "",
  phone: "",
  quote: "",
  price: "",
  active: true,
  gradientIndex: 0,
  pattern: "none",
};

function AdminCardTemplates() {
  const { ready } = useRequireAdmin();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/cardtemplates");
      setTemplates(data.templates || []);
    } catch {
      toast.error("Failed to load card designs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) fetchTemplates();
  }, [ready, fetchTemplates]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (t) => {
    const gradientIndex = Math.max(
      0,
      GRADIENT_OPTIONS.findIndex((g) => g.bgGrad === t.bgGrad && g.bgStyle === t.bgStyle),
    );
    setEditingId(t._id);
    setForm({
      name: t.name || "",
      profession: t.profession || "",
      phone: t.phone || "",
      quote: t.quote || "",
      price: t.price ?? "",
      active: t.active ?? true,
      gradientIndex,
      pattern: t.pattern || "none",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || form.price === "") {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const gradient = GRADIENT_OPTIONS[form.gradientIndex];
    const payload = {
      name: form.name,
      profession: form.profession,
      phone: form.phone,
      quote: form.quote,
      price: Number(form.price),
      active: form.active,
      bgGrad: gradient.bgGrad,
      bgStyle: gradient.bgStyle,
      pattern: form.pattern,
    };

    try {
      if (editingId) {
        await axios.put("/api/admin/cardtemplates", { id: editingId, ...payload });
        toast.success("Design updated");
      } else {
        await axios.post("/api/admin/cardtemplates", payload);
        toast.success("Design created");
      }
      setOpen(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save design");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete("/api/admin/cardtemplates", { data: { id } });
      toast.success("Design deleted");
      fetchTemplates();
    } catch {
      toast.error("Failed to delete design");
    }
  };

  const previewGradient = GRADIENT_OPTIONS[form.gradientIndex];

  return (
    <AdminLayout title="Card Designs" ready={ready}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[2.125rem]">Card Designs</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the design catalog shown on the public cards page.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button onClick={openCreate} />}>
              <Plus className="size-4" />
              New Design
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Design" : "New Design"}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <div className="w-full max-w-xs">
                    <BusinessCard
                      name={form.name || "Full Name"}
                      profession={form.profession || "Job Title"}
                      phone={form.phone || "555 000 0000"}
                      quote={form.quote || "Your quote here."}
                      bgGrad={previewGradient.bgGrad}
                      bgStyle={previewGradient.bgStyle}
                      pattern={form.pattern}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Profession</label>
                    <Input
                      value={form.profession}
                      onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Phone</label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Quote</label>
                    <Input
                      value={form.quote}
                      onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Price (৳)</label>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Pattern</label>
                    <Select
                      value={form.pattern}
                      onValueChange={(v) => setForm((f) => ({ ...f, pattern: v }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CARD_PATTERNS).map(([key, p]) => (
                          <SelectItem key={key} value={key}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Color</label>
                    <Select
                      value={String(form.gradientIndex)}
                      onValueChange={(v) => setForm((f) => ({ ...f, gradientIndex: Number(v) }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADIENT_OPTIONS.map((g, i) => (
                          <SelectItem key={g.label} value={String(i)}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 pt-1">
                    <input
                      id="active"
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                      className="size-4 rounded border-input"
                    />
                    <label htmlFor="active" className="text-sm text-foreground">
                      Visible on public cards page
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.25rem] bg-card shadow-card [&_tbody_tr]:transition-colors [&_td]:px-4 [&_td]:py-3 [&_th]:h-11 [&_th]:px-4 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground [&_thead]:bg-black/[0.025]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Profession</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No designs yet. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.profession || "—"}</TableCell>
                    <TableCell>৳{Number(t.price).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={t.active ? "default" : "outline"}>
                        {t.active ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(t)}>
                        <Pencil className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={<Button variant="ghost" size="icon" aria-label="Delete" />}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this design?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes &ldquo;{t.name}&rdquo; from the catalog.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(t._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
    </AdminLayout>
  );
}

export default AdminCardTemplates;
