import { FC } from 'react'

export * from './hello-world.stories'
export * from './portal.stories'

export default {
  title: 'renderer/Surface',
  decorators: [(Story: FC) => <div style={{ width: '100%', height: '100vh' }}><Story/></div>]
}
