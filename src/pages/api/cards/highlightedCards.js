import { createCardCopyHandler } from "../../../../lib/cardFields";

// POST: save a copy of a card into the highlighted collection.
export default createCardCopyHandler({ collection: "myhighlightedCards", flag: "ishighlighted" });
