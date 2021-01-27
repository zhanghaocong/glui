import { Container, Surface } from '@react-canvas-ui/core'
import { FC } from 'react'

export const Draw: FC = () => {
  return (
    <Surface>
      <Container>
      </Container>
    </Surface>
  )
}

export default {
  title: 'renderer/Graphics',
  decorators: [(Story: FC) => <div style={{ width: '100%', height: '100vh' }}><Story/></div>],
}
