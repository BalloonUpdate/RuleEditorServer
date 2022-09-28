import { ref } from "vue";

export default function useDrag() {
    const winPos = ref({ x: 0, y: 0 }) as any

    const dragHelper = ref(new DragHelper((x, y) => {
        winPos.value.x = x
        winPos.value.y = y
    })) as any

    return {
        winPos,
        dragHelper,
        onMouseDown (e: MouseEvent) {
            this.dragHelper.press(e, this.winPos.x, this.winPos.y)
        },
        onMouseUp (e: MouseEvent) {
            this.dragHelper.release(e)
        },
        onMouseMove (e: MouseEvent) {
            this.dragHelper.drag(e)
        },
        headbarStyle(winWidth: number, winHeight: number) {
            return this.obj2str({
                left: `calc(50% - ${winWidth}px / 2 + ${this.winPos.x}px)`,
                top: `calc(50% - ${winHeight}px / 2 + ${this.winPos.y}px)`,
                width: winWidth + 'px',
                height: winHeight + 'px',
            })
        },
        obj2str(obj: any) {
            let result = ''
            for (const key in obj)
                result += `${key}: ${obj[key]};`
            return result
        }
    }
}

/**
 * 窗口拖拽辅助类
 */
class DragHelper {
    timeoutMs: number
    onMove: (x: number, y: number) => void

    mouseX = 0
    mouseY = 0
    pressing = false
    winX = 0
    winY = 0
    timer: NodeJS.Timeout|null = null as any

    constructor(onMove: (x: number, y: number) => void, timeoutMs: number = 1000)
    {
        this.timeoutMs = timeoutMs
        this.onMove = onMove
    }
    
    /**
     * 鼠标按下
     * @param event 原始事件
     * @param winX 鼠标按下时窗口所在的位置x
     * @param winY 鼠标按下时窗口所在的位置y
     */
    press(event: MouseEvent, winX: number, winY: number)
    {
        this.mouseX = event.x
        this.mouseY = event.y
        this.winX = winX
        this.winY = winY
        this.pressing = true

        this.resetTimer()
    }

    /**
     * 鼠标释放
     * @param event 原始事件
     */
    release(event: MouseEvent)
    {
        this.pressing = false

        this.clearTimer()
    }

    /**
     * 鼠标拖动
     * @param event 原始事件
     */
    drag(event: MouseEvent)
    {
        if(!this.pressing)
            return

        let deltaX = event.x - this.mouseX
        let deltaY = event.y - this.mouseY

        let windowX = this.winX + deltaX
        let windowY = this.winY + deltaY

        this.resetTimer()

        this.onMove(windowX, windowY)
    }

    private resetTimer()
    {
        this.clearTimer()

        this.timer = setTimeout(() => {
            this.pressing = false
            this.timer = null
        }, this.timeoutMs);
    }

    private clearTimer()
    {
        if(this.timer != null)
            clearTimeout(this.timer)
        
        this.timer = null
    }
}