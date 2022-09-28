import AbstractComponentData from "./AbstractComponentData";
import BalloonNotificationrDefine from './BalloonNotification.vue'

export default class BalloonNotification extends AbstractComponentData {
    protected getComponentDefine()
    {
        return BalloonNotificationrDefine
    }

    protected override getProps()
    {
        return {}
    }

    protected override lateInit()
    {
        window.bubble = (text: string, duration = 2000) => {
            this.addMessage(text, duration)
        }
    }

    addMessage(text: string, duration = 2000)
    {
        
        this.vueComponent.addMessage(text, duration)
    }

    async test(count: number)
    {
        for (let index = 0; index < count; index++) 
        {
            let str = ''
            for (let j = 0; j < 20; j++)
                str += index.toString()
            window.bubble(str, 600000)
            await sleep(Math.random() * 700)
        }
    }
}

/**
 * 异步延时函数
 * @param milliseconds 延时时长
 */
async function sleep(milliseconds: number) {
    await new Promise<void>((a, b) => setTimeout(() => a(), milliseconds))
}