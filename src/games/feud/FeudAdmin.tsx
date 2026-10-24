import { Link } from 'react-router-dom'
import { feudCategories } from '../../content/feud'

export default function FeudAdmin() {
  const questionCount = feudCategories.reduce((n, c) => n + c.questions.length, 0)
  const answerCount = feudCategories.reduce(
    (n, c) => n + c.questions.reduce((m, q) => m + q.answers.length, 0),
    0,
  )

  return (
    <div className="page">
      <h1>Feud Admin</h1>
      <p className="muted-hint">
        {feudCategories.length} categories · {questionCount} questions · {answerCount} answers
      </p>
      <Link className="btn-link" to="/">
        ← Sessions
      </Link>

      {feudCategories.map((category) => (
        <section key={category.id}>
          <h2>
            {category.name} <span className="muted-hint">({category.questions.length})</span>
          </h2>
          {category.questions.map((q) => (
            <article key={q.id}>
              <h3>
                {q.question} <span className="muted-hint">{q.id}</span>
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Answer</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {q.answers.map((a, i) => (
                    <tr key={i}>
                      <td>{a.text}</td>
                      <td>{a.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </section>
      ))}
    </div>
  )
}
