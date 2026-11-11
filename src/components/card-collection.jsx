import { useState } from "react";
import Link from "next/link";
import { Trash2, Package, Pencil } from "lucide-react";
import Card from "@/pages/cards/card";
import { EmptyState, Surface } from "@/components/dashboard-ui";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

function CardSkeleton() {
  return (
    <Surface className="overflow-hidden" aria-hidden="true">
      <div className="h-56 animate-pulse bg-muted" />
      <div className="flex items-center justify-between px-5 py-4">
        <div className="space-y-2">
          <div className="h-3.5 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
      </div>
    </Surface>
  );
}

// Grid of card previews with Edit / Order / Delete actions. Delete asks for confirmation first.
export function CardCollection({
  cards,
  loading = false,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  onDelete,
  editHref,
}) {
  const [pending, setPending] = useState(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!cards.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        {cards.map((card, index) => (
          <Surface
            key={card._id ?? index}
            className="group overflow-hidden transition-shadow duration-300 ease-apple hover:shadow-lift"
          >
            <div className="bg-gradient-to-b from-black/[0.035] to-black/[0.015] px-4 py-8 sm:px-8">
              <div className="mx-auto max-w-xl">
                <Card
                  name={card.name}
                  profession={card.profession}
                  phone={card.phone}
                  quote={card.quote}
                  email={card.contactEmail}
                  website={card.website}
                  bgGrad={card.bgGrad}
                  bgStyle={card.bgStyle}
                  pattern={card.pattern}
                  design={card.design}
                  cardId={card._id}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-[-0.015em] text-foreground">
                  {card.name || "Untitled card"}
                </p>
                {card.profession && (
                  <p className="truncate text-sm text-muted-foreground">{card.profession}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {editHref && (
                  <Link
                    href={editHref(card)}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "px-3.5")}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Link>
                )}
                <Link
                  href={`/payment/orders?card=${card.sourceCardId || card._id}`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "px-3.5")}
                >
                  <Package className="size-3.5" />
                  Order
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${card.name || "card"}`}
                  onClick={() => setPending(card)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </Surface>
        ))}
      </div>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent className="rounded-[1.5rem] p-6">
          <AlertDialogHeader className="sm:group-data-[size=default]/alert-dialog-content:place-items-center sm:group-data-[size=default]/alert-dialog-content:text-center">
            <AlertDialogTitle className="text-lg font-semibold tracking-[-0.02em]">
              Delete this card?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.name ? `“${pending.name}”` : "This card"} will be removed from your
              collection. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mx-0 mb-0 grid grid-cols-2 gap-2 border-0 bg-transparent p-0 pt-2">
            <AlertDialogCancel variant="secondary" size="lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              size="lg"
              onClick={() => {
                onDelete(pending._id, pending.cardName);
                setPending(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default CardCollection;
