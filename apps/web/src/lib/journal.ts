import type { Article } from "./types";

export const JOURNAL: Article[] = [
  {
    id: "disappearing",
    chapter: "Chapter I",
    title: "On the art of disappearing.",
    titleItalic: "disappearing.",
    dek: "A fragrance is not what you wear. It is what remains after you have left the room.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80",
    author: "H. Vasseur",
    date: "March MMXXVI",
    minutes: 6,
    body: [
      "We spent four winters composing a perfume that knows when to fall quiet. The brief was not difficult. The brief was a sentence — a fragrance for the moment after.",
      "Most perfumes are about arrival. They announce, they declare, they fill a doorway. Noir, undone is about the inverse. It is the trace of someone who has just gone — a coat left on a chair, the warm silence of a room that has been recently emptied.",
      "To build that, we worked backwards from base notes. Amber and frankincense first, then leather, then iris, then the cold air at the top. Most compositions begin at the top and forget the bottom. We begin at the bottom and ask the top to apologize for itself.",
      "On the skin, it warms. In the air, it disappears. The wrist will hold it for nine hours. The room, for half of one.",
    ],
  },
  {
    id: "matte",
    chapter: "Chapter II",
    title: "Eight rooms, eight reds.",
    titleItalic: "eight reds.",
    dek: "Naming a lipstick after a room you cannot enter.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1600&q=80",
    author: "C. Aubert",
    date: "February MMXXVI",
    minutes: 4,
    body: [
      "Every shade is named after a room in an apartment we will never live in. Salon, Atelier, Boudoir, Véranda. Cuisine, because the kitchen is where lipstick comes off on the rim of a glass.",
      "The Rouge mat was developed over eighteen months in a small workshop in the eleventh arrondissement. The brief was a single word — flat. No sheen, no shimmer, no plumping. A lipstick that admits it is paint.",
    ],
  },
  {
    id: "house",
    chapter: "Chapter III",
    title: "A house, not a brand.",
    titleItalic: "not a brand.",
    dek: "On the difference, and why it matters to us.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1600&q=80",
    author: "The Maison",
    date: "January MMXXVI",
    minutes: 3,
    body: [
      "A brand is a logo and a promise. A house is an address. Eight, rue du Faubourg Saint-Honoré is the only place Kosmos exists, in person. Everything else is correspondence.",
    ],
  },
];

export function getArticle(id: string): Article | undefined {
  return JOURNAL.find((a) => a.id === id);
}

export function getNextArticle(id: string): Article {
  const idx = JOURNAL.findIndex((a) => a.id === id);
  return JOURNAL[(idx + 1) % JOURNAL.length];
}
