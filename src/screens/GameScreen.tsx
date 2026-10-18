import { useParams } from 'react-router-dom'
import BoardGameScreen from '../games/boardGame/BoardGameScreen'
import FightingScreen from '../games/fighting/FightingScreen'
import FeudScreen from '../games/feud/FeudScreen'
import JeopardyScreen from '../games/jeopardy/JeopardyScreen'

export default function GameScreen() {
  const { kind } = useParams()
  switch (kind) {
    case 'boardGame':
      return <BoardGameScreen />
    case 'fighting':
      return <FightingScreen />
    case 'feud':
      return <FeudScreen />
    case 'jeopardy':
      return <JeopardyScreen />
    default:
      return <p className="page">Coming soon</p>
  }
}
