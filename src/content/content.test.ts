import { describe, it, expect } from 'vitest'
import { feudCategories, findFeudQuestion } from './feud'
import { jeopardyBoard, findJeopardyCategory } from './jeopardy'

describe('bundled content', () => {
  it('feud categories, questions, and answers are well-formed', () => {
    expect(feudCategories.length).toBeGreaterThan(0)
    for (const category of feudCategories) {
      expect(category.questions.length).toBeGreaterThan(0)
      for (const q of category.questions) {
        expect(q.answers.length).toBeGreaterThanOrEqual(2)
        for (const a of q.answers) {
          expect(a.text.trim().length).toBeGreaterThan(0)
          expect(a.points).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('findFeudQuestion resolves bundled ids', () => {
    const q = feudCategories[0].questions[0]
    expect(findFeudQuestion(q.id)).toBe(q)
    expect(findFeudQuestion('does-not-exist')).toBeUndefined()
  })

  it('jeopardy board has categories, positive clue values, and finalJeopardy', () => {
    expect(jeopardyBoard.categories.length).toBeGreaterThan(0)
    for (const category of jeopardyBoard.categories) {
      expect(category.clues.length).toBeGreaterThan(0)
      for (const clue of category.clues) {
        expect(clue.value).toBeGreaterThan(0)
        expect(Number.isInteger(clue.value)).toBe(true)
        expect(clue.clue.trim().length).toBeGreaterThan(0)
        expect(clue.response.trim().length).toBeGreaterThan(0)
      }
    }
    expect(jeopardyBoard.finalJeopardy.clue.trim().length).toBeGreaterThan(0)
  })

  it('findJeopardyCategory resolves bundled ids', () => {
    const c = jeopardyBoard.categories[0]
    expect(findJeopardyCategory(c.id)).toBe(c)
    expect(findJeopardyCategory('nope')).toBeUndefined()
  })
})
