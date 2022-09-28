declare module '*.vue' {
    import { defineComponent } from 'vue';
    const component: ReturnType<typeof defineComponent>;
    export default component;
}

declare interface Window {
    bubble: (text: string, duration?: number) => void
}