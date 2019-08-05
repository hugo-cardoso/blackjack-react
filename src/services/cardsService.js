const BASE_URL = "https://deckofcardsapi.com/api/deck";

export const createDeck = async quantity => {
  const data = await fetch(`${ BASE_URL }/new/shuffle/?deck_count=${ quantity }`).then(res => res.json());
  return data;
};

export const getCard = async (quantity, deckId) => {
  const data = await fetch(`${ BASE_URL }/${ deckId }/draw/?count=${ quantity }`).then(res => res.json());
  return data;
}