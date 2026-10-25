import type { FeudQuestion } from '../types'

// Fábio's personal survey. Answers are ranked in order — the first answer is
// the top survey answer and carries the most points, decreasing down the list.
export const feudQuestions: FeudQuestion[] = [
  {
    id: 'fav-pokemon',
    question: 'Fábio Favorite Pokemons',
    answers: [
      { text: 'Wartortle', points: 10 },
      { text: 'Psyduck', points: 9 },
      { text: 'Umbreon', points: 8 },
      { text: "Farfetch'd", points: 7 },
      { text: "Sirfetch'd", points: 6 },
      { text: 'Haunter', points: 5 },
      { text: 'Miltank', points: 4 },
      { text: 'Arcanine', points: 3 },
      { text: 'Drowzee', points: 2 },
      { text: 'Eevee', points: 1 },
    ],
  },
  {
    id: 'fav-movies',
    question: 'Fábio Favorite Movies',
    answers: [
      { text: 'Star Wars Episode 5', points: 10 },
      { text: 'High Fidelity', points: 9 },
      { text: 'Groundhog Day', points: 8 },
      { text: 'Kill Bill', points: 7 },
      { text: 'Arrival', points: 6 },
      { text: 'Past Lives', points: 5 },
      { text: 'Porco Rosso', points: 4 },
      { text: 'Before Sunrise', points: 3 },
      { text: 'The Matrix', points: 2 },
      { text: 'Scott Pilgrim vs. the World', points: 1 },
    ],
  },
  {
    id: 'fav-anime',
    question: 'Fábio Favorite Anime / Manga',
    answers: [
      { text: 'Cowboy Bebop', points: 10 },
      { text: 'Evangelion', points: 9 },
      { text: 'Cardcaptor Sakura', points: 8 },
      { text: 'Nichijou', points: 7 },
      { text: 'Steins Gate', points: 6 },
      { text: 'Attack on Titan', points: 5 },
      { text: 'Toradora', points: 4 },
      { text: 'Durarara', points: 3 },
      { text: 'Jujutsu Kaisen', points: 2 },
      { text: 'Nana', points: 1 },
    ],
  },
  {
    id: 'fav-food',
    question: 'Fábio Favorite Food or Drink',
    answers: [
      { text: 'Pizza', points: 10 },
      { text: 'Sorvete', points: 9 },
      { text: 'Queijo', points: 8 },
      { text: 'Cerveja', points: 7 },
      { text: 'Vinho', points: 6 },
      { text: 'Sushi', points: 5 },
      { text: 'Shortbread', points: 4 },
      { text: 'Manga', points: 3 },
      { text: 'Feijoada', points: 2 },
      { text: 'Kiwi', points: 1 },
    ],
  },
  {
    id: 'fav-games',
    question: 'Fábio Favorite Video Game',
    answers: [
      { text: 'Donkey Kong Country', points: 10 },
      { text: 'Hades', points: 9 },
      { text: 'Sekiro', points: 8 },
      { text: 'The Legend of Zelda: Tears of the Kingdom', points: 7 },
      { text: 'Mass Effect', points: 6 },
      { text: 'Super Mario Bros 3', points: 5 },
      { text: 'Balatro', points: 4 },
      { text: 'Pokemon Crystal', points: 3 },
      { text: "Yoshi's Island", points: 2 },
      { text: 'Max Payne', points: 1 },
    ],
  },
]

export function findFeudQuestion(id: string): FeudQuestion | undefined {
  return feudQuestions.find((q) => q.id === id)
}
