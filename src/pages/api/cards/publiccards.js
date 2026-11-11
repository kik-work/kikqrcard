import { createCardCopyHandler } from "../../../../lib/cardFields";

// POST: save a copy of a card into the public (allCards) collection.
export default createCardCopyHandler({ collection: "allCards" });
