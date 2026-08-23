import { registerGame } from '../store/gameRegistry'
import { boardGameDefinition } from './boardGame/definition'
import { fightingDefinition } from './fighting/definition'
import { feudDefinition } from './feud/definition'
import { jeopardyDefinition } from './jeopardy/definition'

registerGame(boardGameDefinition)
registerGame(fightingDefinition)
registerGame(feudDefinition)
registerGame(jeopardyDefinition)
