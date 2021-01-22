/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactReconciler from 'react-reconciler'

export const Reconciler = process.env.DEBUG_RECONCILER ? DebugReconciler : ReactReconciler

const log = <F extends (...args: any[]) => any>(label: string, fn: F): F => {
  const enhanced = (...args: any[]) => {
    console.group(label, args)
    const val = fn(...args)
    console.groupCollapsed('return')
    console.info(val)
    console.groupEnd()
    console.groupEnd()
    return val
  }
  return enhanced as unknown as F
}

const logAll = (target: any) => {
  Object.keys(target).forEach(key => {
    const fn = target[key]
    if (typeof fn === 'function') {
      target[key] = log(key, fn)
    }
  })
}

function DebugReconciler <Type, Props, Container, Instance, TextInstance, HydratableInstance, PublicInstance, HostContext, UpdatePayload, ChildSet, TimeoutHandle, NoTimeout>
(config: ReactReconciler.HostConfig<Type, Props, Container, Instance, TextInstance, HydratableInstance, PublicInstance, HostContext, UpdatePayload, ChildSet, TimeoutHandle, NoTimeout>) {
  logAll(config)
  return ReactReconciler(config)
}
