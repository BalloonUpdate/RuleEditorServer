import { WebdavConfig } from "../storage/Webdav";
import AbstractComponentData from "./AbstractComponentData";
import WebdavAuthDefine from './WebdavAuth.vue'

export default class WebdavAuth extends AbstractComponentData {
    private webdavConfig?: WebdavConfig

    protected getComponentDefine()
    {
        return WebdavAuthDefine
    }

    protected override getProps()
    {
        return {
            onClickSave: this.isolate(this.onClickSave),
            onClickEmpty: this.isolate(this.onClickEmpty),
        }
    }

    protected override earlyInit()
    {
        let server = localStorage.getItem('balloon-update-server') ?? ''
        let basepath = localStorage.getItem('balloon-update-basepath') ?? ''
        let username = localStorage.getItem('balloon-update-username') ?? ''
        let password = localStorage.getItem('balloon-update-password') ?? ''

        this.webdavConfig = { server, basepath, username, password }

        this.vueComponent.server = server
        this.vueComponent.basepath = basepath
        this.vueComponent.username = username
        this.vueComponent.password = password
    }

    protected override lateInit()
    {
        
    }

    private onClickSave()
    {
        let server = this.vueComponent.server as string
        let basepath = this.vueComponent.basepath as string
        let username = this.vueComponent.username as string
        let password = this.vueComponent.password as string

        if(server != '' && !new RegExp('^https?://[a-zA-Z0-9.]+(:\\d+)?').test(server))
        {
            alert('主机地址的格式不对')
            return
        }

        if(basepath != '' && !new RegExp('^/[^/]*(/[^/]+)*$').test(basepath))
        {
            alert('基本路径的格式不对（以/开头，无/结尾，留空禁用）')
            return
        }

        localStorage.setItem('balloon-update-server', server)
        localStorage.setItem('balloon-update-basepath', basepath)
        localStorage.setItem('balloon-update-username', username)
        localStorage.setItem('balloon-update-password', password)

        location.reload()
    }

    private onClickEmpty() 
    {
        if(confirm('确定要清空吗?'))
        {
            this.vueComponent.server = ''
            this.vueComponent.basepath = ''
            this.vueComponent.username = ''
            this.vueComponent.password = ''

            alert('点击"保存"按钮来保存修改')
        }
    }
    
    getConfig(): WebdavConfig|null
    {
        let server = this.webdavConfig?.server ?? ''
        let basepath = this.webdavConfig?.basepath ?? ''
        let username = this.webdavConfig?.username ?? ''
        let password = this.webdavConfig?.password ?? ''

        if(server=='' || username=='' || password=='')
            return null

        return { server, basepath, username, password }
    }

    showHide()
    {
        this.vueComponent.showHide()
    }

    show()
    {
        this.vueComponent.show()
    }

    hide()
    {
        this.vueComponent.hide()
    }
}