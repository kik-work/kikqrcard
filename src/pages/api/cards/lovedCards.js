import { createCardCopyHandler } from "../../../../lib/cardFields";

// POST: save a copy of a card into the loved collection.
export default createCardCopyHandler({ collection: "mylovedCards", flag: "isloved" });
