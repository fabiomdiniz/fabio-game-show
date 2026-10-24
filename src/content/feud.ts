import type { FeudQuestion } from '../types'

// Fábio's personal survey. Answers are ranked in order — the first answer is
// the top survey answer and carries the most points, decreasing down the list.
export const feudQuestions: FeudQuestion[] = [
  {
    id: 'fav-pokemon',
    question: 'Fábio Favorite Pokemons',
    answers: [
      { text: 'Wartortle', points: 50 },
      { text: 'Psyduck', points: 45 },
      { text: 'Umbreon', points: 40 },
      { text: "Farfetch'd", points: 35 },
      { text: "Sirfetch'd", points: 30 },
      { text: 'Haunter', points: 25 },
      { text: 'Miltank', points: 20 },
      { text: 'Arcanine', points: 15 },
      { text: 'Drowzee', points: 10 },
      { text: 'Eevee', points: 5 },
    ],
  },
  {
    id: 'fav-movies',
    question: 'Fábio Favorite Movies',
    answers: [
      { text: 'Star Wars Episode 5', points: 50 },
      { text: 'High Fidelity', points: 45 },
      { text: 'Groundhog Day', points: 40 },
      { text: 'Kill Bill', points: 35 },
      { text: 'Arrival', points: 30 },
      { text: 'Past Lives', points: 25 },
      { text: 'Porco Rosso', points: 20 },
      { text: 'Before Sunrise', points: 15 },
      { text: 'The Matrix', points: 10 },
      { text: 'Scott Pilgrim vs. the World', points: 5 },
    ],
  },
  {
    id: 'fav-anime',
    question: 'Fábio Favorite Anime / Manga',
    answers: [
      { text: 'Cowboy Bebop', points: 50 },
      { text: 'Evangelion', points: 45 },
      { text: 'Cardcaptor Sakura', points: 40 },
      { text: 'Nichijou', points: 35 },
      { text: 'Steins Gate', points: 30 },
      { text: 'Attack on Titan', points: 25 },
      { text: 'Toradora', points: 20 },
      { text: 'Durarara', points: 15 },
      { text: 'Jujutsu Kaisen', points: 10 },
      { text: 'Nana', points: 5 },
    ],
  },
  {
    id: 'fav-food',
    question: 'Fábio Favorite Food or Drink',
    answers: [
      { text: 'Pizza', points: 50 },
      { text: 'Sorvete', points: 45 },
      { text: 'Queijo', points: 40 },
      { text: 'Cerveja', points: 35 },
      { text: 'Vinho', points: 30 },
      { text: 'Sushi', points: 25 },
      { text: 'Shortbread', points: 20 },
      { text: 'Manga', points: 15 },
      { text: 'Feijoada', points: 10 },
      { text: 'Kiwi', points: 5 },
    ],
  },
  {
    id: 'fav-games',
    question: 'Fábio Favorite Video Game',
    answers: [
      { text: 'Donkey Kong Country', points: 50 },
      { text: 'Hades', points: 45 },
      { text: 'Sekiro', points: 40 },
      { text: 'The Legend of Zelda: Tears of the Kingdom', points: 35 },
      { text: 'Mass Effect', points: 30 },
      { text: 'Super Mario Bros 3', points: 25 },
      { text: 'Sekiro', points: 20 },
      { text: 'Balatro', points: 15 },
      { text: 'Pokemon Crystal', points: 10 },
      { text: "Yoshi's Island", points: 5 },
    ],
  },
]

export function findFeudQuestion(id: string): FeudQuestion | undefined {
  return feudQuestions.find((q) => q.id === id)
}
