import { Box } from '@react-canvas-ui/components'
import {foo} from './foo'

export const hello = (msg: string) => {
  console.log(`hello ${msg}`)
}


export const bar = () => {
  return foo
}

export const create = () => {
  return new Box()
}

export * from './host-config'
