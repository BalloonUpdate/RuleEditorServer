const NEVER = 0
const ONCE = 1
const ALWAYS = 2

type SyncListenerCallback<T0, T1, T2> = (arg0: T0, arg1: T1, arg2: T2) => void

export interface EventListener<T0, T1, T2>
{
    callback: SyncListenerCallback<T0, T1, T2>
    type: number
}

export class SyncEvent<T0=void, T1=void, T2=void>
{
    listeners: Array<EventListener<T0, T1, T2>> = []

    always(callback: SyncListenerCallback<T0, T1, T2>)
    {
        this.addListener(callback, ALWAYS)
    }

    once(callback: SyncListenerCallback<T0, T1, T2>)
    {
        this.addListener(callback, ONCE)
    }

    addListener(callback: SyncListenerCallback<T0, T1, T2>, type: number)
    {
        let listener: EventListener<T0, T1, T2> = { callback, type }
        this.listeners.push(listener)
        return listener
    }

    contains(listener: EventListener<T0, T1, T2>): Boolean
    {
        return this.listeners.includes(listener)
    }

    invoke(arg0: T0, arg1: T1, arg2: T2)
    {
        let vaildListeners = this.listeners.filter(e => e.type != NEVER)

        for (const lis of vaildListeners)
        {
            lis.callback(arg0, arg1, arg2)

            if(lis.type == ONCE)
                lis.type = NEVER
        }

        // 删掉所有失效的监听器
        this.listeners = this.listeners.filter(e => e.type != NEVER)
    }
}