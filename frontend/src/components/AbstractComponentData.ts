import { App, createApp } from "vue";

export default abstract class AbstractComponentData {
    protected vueApp: App = null as any
    protected vueComponent: any

    get vueComponentAny(): any
    {
        return this.vueComponent
    }

    constructor(selector: string)
    {
        let rootProps = this.getProps()
        let componentDefine = this.getComponentDefine()
        
        this.vueApp = createApp(componentDefine, rootProps)
        this.vueComponent = this.vueApp.mount(selector)
        this.earlyInit()
    }

    initialize()
    {
        this.lateInit()
        return this
    }

    protected abstract getComponentDefine(): any

    protected getProps(): any 
    {
        return {}
    }

    /**
     * 早期初始化方法，注意在此方法里无法访问子类中定义的属性。但可以访问vue相关的属性
     */
    protected earlyInit()
    {

    }

    /**
     * 晚期初始化方法，可以访问任何子类中定义的属性
     */
    protected lateInit()
    {

    }

    /**
     * 隔离函数的this上下文
     * @param fun 要隔离的函数
     * @returns 隔离好的函数
     */
    protected isolate(fun: Function): Function
    {
        return fun.bind(this)
    }

    protected unmount()
    {
        this.vueApp?.unmount()
    }

    // use(plugin: any, ...options: any[]): App
    // {
    //     return this.vueApp.use(plugin, ...options)
    // }
}