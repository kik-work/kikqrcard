import { createCardCopyHandler } from "../../../../lib/cardFields";

// POST: save a copy of a card into the favourites collection.
export default createCardCopyHandler({ collection: "myfavouritedCards", flag: "isfavourite" });
