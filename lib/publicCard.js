// Resolves the card behind a QR link (/c/<id>) to its live, current data.
//
// The id is usually a myCard _id. Cards copied into the loved / favourite /
// highlighted / public collections get their own _id, and their QR codes carry
// that id, so a copy id is traced back to the original card in myCard:
//   1. by sourceCardId (stored on copies made from a saved card), else
//   2. by the same owner + cardName.
// Only if no original exists is the copy itself shown.
import { ObjectId } from "mongodb";
import { normalizeDesign } from "../src/lib/cardDesign";

const COPY_COLLECTIONS = ["allCards", "mylovedCards", "myfavouritedCards", "myhighlightedCards"];

// Fields safe to show to anyone who scans the QR. Never include the owner's account email.
function toPublic(card) {
  return {
    id: card._id.toString(),
    name: card.name || "",
    profession: card.profession || "",
    phone: card.phone || "",
    quote: card.quote || "",
    contactEmail: card.contactEmail || "",
    website: card.website || "",
    address: card.address || "",
    bgGrad: card.bgGrad || "",
    bgStyle: card.bgStyle || "",
    pattern: card.pattern || "none",
    design: normalizeDesign(card.design),
    qrConfig: card.qrConfig || null,
    updatedAt: (card.updatedAt || card.createdAt || null)?.toISOString?.() || null,
  };
}

export async function findLiveCard(db, id) {
  if (!id || !ObjectId.isValid(id)) return null;
  const _id = new ObjectId(id);
  const myCard = db.collection("myCard");

  const original = await myCard.findOne({ _id });
  if (original) return toPublic(original);

  for (const name of COPY_COLLECTIONS) {
    const copy = await db.collection(name).findOne({ _id });
    if (!copy) continue;

    let live = null;
    if (copy.sourceCardId && ObjectId.isValid(copy.sourceCardId)) {
      live = await myCard.findOne({ _id: new ObjectId(copy.sourceCardId), email: copy.email });
    }
    if (!live && copy.email && copy.cardName) {
      live = await myCard.findOne(
        { email: copy.email, cardName: copy.cardName },
        { sort: { updatedAt: -1, createdAt: -1 } },
      );
    }
    return toPublic(live || copy);
  }

  return null;
}
