import { Container } from '@pixi/display';
import type { IHitArea } from '@pixi/interaction';
import type { EventTarget } from './event-target';
import type { UpdatePayload } from './types';
import { defaultApplyProps, defaultApplyUpdate, defaultDiffProps } from './utils';

export type ContainerProps = {
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  pivotX?: number
  pivotY?: number
  skewX?: number
  skewY?: number
  rotation?: number
  angle?: number
  zIndex?: number
  cacheAsBitmap?: boolean
  cursor?: string | null
  hitArea?: IHitArea | null
  interactive?: boolean
  interactiveChildren?: boolean
} & EventTarget

export function createContainer (props: ContainerProps) {
  const el = new Container()
  if (props) {
    defaultApplyProps(el, props)
  }
  return el
}

// 告诉 Reconciler 组件如何 diff
Container.prototype.__diffProps = defaultDiffProps

// 告诉 Reconciler 组件如何应用 diff
Container.prototype.__applyUpdate = defaultApplyUpdate

// Workaround for global mixin 
type __Container = Container
type __ContainerProps = ContainerProps

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace GlobalMixins {
    interface Container {
      __diffProps <P extends __ContainerProps>(prevProps: P, nextProps: P): UpdatePayload | null
      __applyUpdate <T extends __Container>(el: T, payload: UpdatePayload): void
    }
  }
}
