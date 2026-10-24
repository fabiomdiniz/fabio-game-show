import { Link } from 'react-router-dom'
import { feudQuestions } from '../../content/feud'

export default function FeudAdmin() {
  const answerCount = feudQuestions.reduce((n, q) => n + q.answers.length, 0)

  return (
    <div className="page">
      <h1>Feud Admin</h1>
      <p className="muted-hint">
        {feudQuestions.length} questions · {answerCount} answers
      </p>
      <Link className="btn-link" to="/">
        ← Sessions
      </Link>

      {feudQuestions.map((q) => (
        <article key={q.id}>
          <h2>
            {q.question} <span className="muted-hint">{q.id}</span>
          </h2>
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
    </div>
  )
}
