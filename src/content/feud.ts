import type { FeudCategory, FeudQuestion } from '../types'

export const feudCategories: FeudCategory[] = [
  {
    id: 'pop-culture',
    name: 'Pop Culture',
    questions: [
      {
        id: 'pop-1',
        question: 'Name a social media app people check first thing in the morning.',
        answers: [
          { text: 'Instagram', points: 40 },
          { text: 'WhatsApp', points: 25 },
          { text: 'TikTok', points: 20 },
          { text: 'X (Twitter)', points: 15 },
        ],
      },
      {
        id: 'pop-2',
        question: 'Name something people binge-watch on a weekend.',
        answers: [
          { text: 'A TV series', points: 45 },
          { text: 'Reality TV', points: 25 },
          { text: 'Anime', points: 20 },
          { text: 'Movies', points: 10 },
        ],
      },
    ],
  },
  {
    id: 'brazil',
    name: 'Brazil',
    questions: [
      {
        id: 'br-1',
        question: 'Name a food you would find at a Brazilian churrasco.',
        answers: [
          { text: 'Picanha', points: 40 },
          { text: 'Farofa', points: 25 },
          { text: 'Pão de queijo', points: 20 },
          { text: 'Rice and beans', points: 15 },
        ],
      },
      {
        id: 'br-2',
        question: 'Name something Brazil is famous for around the world.',
        answers: [
          { text: 'Football (soccer)', points: 50 },
          { text: 'Carnival', points: 30 },
          { text: 'Samba', points: 15 },
          { text: 'The Amazon', points: 5 },
        ],
      },
    ],
  },
  {
    id: 'anime',
    name: 'Anime',
    questions: [
      {
        id: 'an-1',
        question: 'Name an anime with a huge global fanbase.',
        answers: [
          { text: 'Naruto', points: 35 },
          { text: 'One Piece', points: 30 },
          { text: 'Dragon Ball', points: 20 },
          { text: 'Attack on Titan', points: 15 },
        ],
      },
      {
        id: 'an-2',
        question: 'Name a Studio Ghibli movie.',
        answers: [
          { text: 'Spirited Away', points: 45 },
          { text: 'My Neighbor Totoro', points: 30 },
          { text: "Howl's Moving Castle", points: 15 },
          { text: 'Princess Mononoke', points: 10 },
        ],
      },
    ],
  },
  {
    id: 'music',
    name: 'Music',
    questions: [
      {
        id: 'mu-1',
        question: 'Name a musical instrument people learn as a kid.',
        answers: [
          { text: 'Piano', points: 40 },
          { text: 'Guitar', points: 30 },
          { text: 'Violin', points: 15 },
          { text: 'Drums', points: 15 },
        ],
      },
      {
        id: 'mu-2',
        question: 'Name a place people go to hear live music.',
        answers: [
          { text: 'A concert', points: 40 },
          { text: 'A festival', points: 25 },
          { text: 'A bar', points: 20 },
          { text: 'A stadium', points: 15 },
        ],
      },
    ],
  },
  {
    id: 'movies',
    name: 'Movies',
    questions: [
      {
        id: 'mo-1',
        question: 'Name a movie genre that always fills a theater.',
        answers: [
          { text: 'Action', points: 40 },
          { text: 'Comedy', points: 25 },
          { text: 'Horror', points: 20 },
          { text: 'Superhero', points: 15 },
        ],
      },
      {
        id: 'mo-2',
        question: 'Name something people buy at the movie theater.',
        answers: [
          { text: 'Popcorn', points: 50 },
          { text: 'Soda', points: 25 },
          { text: 'Candy', points: 15 },
          { text: 'Tickets', points: 10 },
        ],
      },
    ],
  },
]

export function findFeudQuestion(id: string): FeudQuestion | undefined {
  for (const category of feudCategories) {
    for (const question of category.questions) {
      if (question.id === id) return question
    }
  }
  return undefined
}
