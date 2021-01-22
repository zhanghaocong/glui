import { Container, createElement, createPortal, Surface, Text } from '@react-canvas-ui/core'
import { FC, useRef, useState } from 'react'

export const Portal: FC = () => {

  const [portalContainer] = useState(() => {
    return createElement('Container')
  })

  // TODO 更方便使用 stage
  const stage = useRef<Container>()
  const setStageFromContainer = (instance: Container) => {
    console.info('setStage', instance)
    const nextStage = instance?.parent as Container
    if (nextStage === stage.current) {
      return
    }
    if (nextStage) {
      nextStage.removeChild(portalContainer)
    }
    stage.current = nextStage
    if (nextStage) {
      nextStage.addChild(portalContainer)
    }
  }

  return (
    <Surface>
      <Container ref={setStageFromContainer} key="c1" x={100} y={75}>
        <Text content='普通创建' />
        { createPortal(<Text content='通过 createPortal 创建' x={100} />, portalContainer) }
      </Container>
    </Surface>
  )
}
