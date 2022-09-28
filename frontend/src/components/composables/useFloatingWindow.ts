import { ref } from "vue";
import { SyncEvent } from "../../event/SyncEvent";

export default function useFloatingWindow(initialOpen: boolean) {
    const windowVisible = ref(initialOpen)
    const windowVisibilityEvent = ref(new SyncEvent<boolean>())

    return {
        windowVisible,
        windowVisibilityEvent,
        showHide() {
            windowVisible.value = !windowVisible.value
            windowVisibilityEvent.value.invoke(windowVisible.value)
        },
        show() {
            windowVisible.value = true
            windowVisibilityEvent.value.invoke(true)
        },
        hide() {
            windowVisible.value = false
            windowVisibilityEvent.value.invoke(false)
        }
    }
}