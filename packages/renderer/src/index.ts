import {foo} from './foo'

export const hello = (msg: string) => {
  console.log(`hello ${msg}`)
}


export const bar = () => {
  return foo
}

export * from './host-config'
