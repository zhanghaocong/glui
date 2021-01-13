import { FC, memo } from 'react'
import useMeasure from 'react-use-measure'

const defaultStyles: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: 'aqua',
}

export const Canvas: FC = memo(() => {
  const [setRef, size, forceResize] = useMeasure({ scroll: true, debounce: { scroll: 50, resize: 0 }})
  console.info(size)
  return (
    <div ref={ setRef } style={ { ...defaultStyles } }>
      <canvas width={size.width} height={size.height} style={{ display: 'block' }} />
    </div>
  )
})
