import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin-shell";
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

function AdminCards() {
  const { ready } = useRequireAdmin();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchCards = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/cards", { params: { q } });
      setCards(data.cards || []);
    } catch {
      toast.error("Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) fetchCards();
  }, [ready, fetchCards]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCards(query);
  };

  const deleteCard = async (card) => {
    try {
      await axios.delete("/api/admin/cards", { data: { id: card._id, source: card.source } });
      toast.success("Card deleted");
      fetchCards(query);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete card");
    }
  };

  return (
    <AdminLayout title="Cards" ready={ready}>
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[2.125rem]">Cards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cards.length} card{cards.length === 1 ? "" : "s"} across all users
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex max-w-sm gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or card name..."
          />
          <Button type="submit" variant="outline" size="icon" aria-label="Search">
            <Search className="size-4" />
          </Button>
        </form>

        <div className="mt-4 overflow-hidden rounded-[1.25rem] bg-card shadow-card [&_tbody_tr]:transition-colors [&_td]:px-4 [&_td]:py-3 [&_th]:h-11 [&_th]:px-4 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground [&_thead]:bg-black/[0.025]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : cards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No cards found.
                  </TableCell>
                </TableRow>
              ) : (
                cards.map((card) => (
                  <TableRow key={`${card.source}-${card._id}`}>
                    <TableCell className="font-medium">{card.cardName}</TableCell>
                    <TableCell>{card.name}</TableCell>
                    <TableCell>{card.email}</TableCell>
                    <TableCell>{card.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{card.source}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={<Button variant="ghost" size="icon" aria-label="Delete card" />}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this card?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently deletes &ldquo;{card.cardName}&rdquo; owned by{" "}
                              {card.email}. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCard(card)}>
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

export default AdminCards;
