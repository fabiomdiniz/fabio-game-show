import { useParams } from 'react-router-dom'
import BoardGameScreen from '../games/boardGame/BoardGameScreen'

export default function GameScreen() {
  const { kind } = useParams()
  switch (kind) {
    case 'boardGame':
      return <BoardGameScreen />
    default:
      return <p style={{ padding: 16 }}>Coming soon</p>
  }
}
