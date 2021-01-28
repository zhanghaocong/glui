import type { AnyElement, AnyProps, UpdatePayload } from './types'

export const defaultApplyProps = (el: AnyElement, props: AnyProps) => {
  for (const key in props) {
    set(el, key, props[key])
  }
}

export const defaultApplyUpdate = (el: AnyElement, payload: UpdatePayload) => {
  for (let i = 0; i < payload.length; i += 2) {
    const key = payload[i]
    const value = payload[i+1]
    set(el, key, value)
  }
}

const set = <T>(el: AnyElement, key: string, value: T) => {
  if (key === 'children') {
    // 不支持文本节点
    return
  }
  el[key] = value
}


export const defaultDiffProps = (prevProps: AnyProps, nextProps: AnyProps) => {
  return []
}
