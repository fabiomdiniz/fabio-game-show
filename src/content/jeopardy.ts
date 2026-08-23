import type { JeopardyBoard, JeopardyCategory } from '../types'

export const jeopardyBoard: JeopardyBoard = {
  categories: [
    {
      id: 'pop-culture',
      name: 'Pop Culture',
      clues: [
        { id: 'pop-100', value: 100, clue: 'This "Spider-Man" actor was the first to wear the suit in the MCU.', response: 'Who is Tom Holland?' },
        { id: 'pop-200', value: 200, clue: 'This reality show asks contestants to "survive" on an island and vote each other off.', response: 'What is Survivor?' },
        { id: 'pop-300', value: 300, clue: 'This 2023 film about a doll and a physicist became the year\'s biggest box-office hit.', response: 'What is Barbie?' },
        { id: 'pop-400', value: 400, clue: 'This K-pop group broke YouTube records with "Dynamite".', response: 'Who is BTS?' },
        { id: 'pop-500', value: 500, clue: 'This streaming service coined the phrase "Netflix and chill".', response: 'What is Netflix?', dailyDouble: true },
      ],
    },
    {
      id: 'brazil',
      name: 'Brazil',
      clues: [
        { id: 'br-100', value: 100, clue: 'Brazil\'s most famous annual celebration held before Lent.', response: 'What is Carnival?' },
        { id: 'br-200', value: 200, clue: 'This Brazilian city is famous for its Christ the Redeemer statue.', response: 'What is Rio de Janeiro?' },
        { id: 'br-300', value: 300, clue: 'Brazil\'s national dish is a black bean and pork stew known by this name.', response: 'What is feijoada?' },
        { id: 'br-400', value: 400, clue: 'This Brazilian footballer, known as "O Rei", won three World Cups.', response: 'Who is Pelé?' },
        { id: 'br-500', value: 500, clue: 'This Portuguese word describes a deep nostalgic longing, central to Brazilian music.', response: 'What is saudade?' },
      ],
    },
    {
      id: 'anime',
      name: 'Anime',
      clues: [
        { id: 'an-100', value: 100, clue: 'This anime follows Monkey D. Luffy on his quest to become Pirate King.', response: 'What is One Piece?' },
        { id: 'an-200', value: 200, clue: 'This studio produced "Spirited Away" and "My Neighbor Totoro".', response: 'What is Studio Ghibli?' },
        { id: 'an-300', value: 300, clue: 'This series about titans attacking humanity aired its final season in 2023.', response: 'What is Attack on Titan?' },
        { id: 'an-400', value: 400, clue: 'This anime character is the world\'s most famous electric-type Pokémon.', response: 'Who is Pikachu?' },
        { id: 'an-500', value: 500, clue: 'This mecha anime franchise began in 1979 with the original "Mobile Suit" series.', response: 'What is Gundam?' },
      ],
    },
    {
      id: 'music',
      name: 'Music',
      clues: [
        { id: 'mu-100', value: 100, clue: 'This instrument has 88 keys and is central to classical music.', response: 'What is the piano?' },
        { id: 'mu-200', value: 200, clue: 'This British band wrote "Bohemian Rhapsody".', response: 'Who is Queen?' },
        { id: 'mu-300', value: 300, clue: 'This genre, born in the Bronx in the 1970s, features MCs and DJs.', response: 'What is hip-hop?' },
        { id: 'mu-400', value: 400, clue: 'This Brazilian bossa nova song "The Girl from Ipanema" was written by these two composers.', response: 'Who are Antônio Carlos Jobim and Vinícius de Moraes?' },
        { id: 'mu-500', value: 500, clue: 'This 2012 song by Psy was the first YouTube video to reach one billion views.', response: 'What is "Gangnam Style"?' },
      ],
    },
    {
      id: 'movies',
      name: 'Movies',
      clues: [
        { id: 'mo-100', value: 100, clue: 'This 1994 film follows a group of friends and a magical board game in "Jumanji".', response: 'What is Jumanji?' },
        { id: 'mo-200', value: 200, clue: 'This director made "Pulp Fiction" and "Kill Bill".', response: 'Who is Quentin Tarantino?' },
        { id: 'mo-300', value: 300, clue: 'This 1977 space opera began the "Star Wars" saga.', response: 'What is A New Hope?' },
        { id: 'mo-400', value: 400, clue: 'This 2008 superhero film featured Heath Ledger as the Joker.', response: 'What is The Dark Knight?' },
        { id: 'mo-500', value: 500, clue: 'This 1942 film "Casablanca" is set in this Moroccan city during WWII.', response: 'What is Casablanca?' },
      ],
    },
  ],
  finalJeopardy: {
    category: 'World Records',
    clue: 'As of 2024, this country holds the record for the most FIFA World Cup titles, with five.',
    response: 'What is Brazil?',
  },
}

export function findJeopardyCategory(id: string): JeopardyCategory | undefined {
  return jeopardyBoard.categories.find((c) => c.id === id)
}
