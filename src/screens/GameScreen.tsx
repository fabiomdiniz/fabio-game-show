import { useParams } from 'react-router-dom'
import BoardGameScreen from '../games/boardGame/BoardGameScreen'
import FightingScreen from '../games/fighting/FightingScreen'

export default function GameScreen() {
  const { kind } = useParams()
  switch (kind) {
    case 'boardGame':
      return <BoardGameScreen />
    case 'fighting':
      return <FightingScreen />
    default:
      return <p style={{ padding: 16 }}>Coming soon</p>
  }
}
