import { registerGame } from '../store/gameRegistry'
import { boardGameDefinition } from './boardGame/definition'
import { fightingDefinition } from './fighting/definition'

registerGame(boardGameDefinition)
registerGame(fightingDefinition)
