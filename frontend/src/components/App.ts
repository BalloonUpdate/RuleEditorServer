import File from "../data/File";
import ConfigFileNotFound from "../exceptions/ConfigFileNotFound";
import ResFolderNotFound from "../exceptions/ResFolderNotFound";
import ServerSideException from "../exceptions/ServerSideException";
import RuleList from "../RuleList";
import AbstractStorage, { DirInfo, FileInfo } from "../storage/AbstractStorage";
import PrivateProtocol from "../storage/PrivateProtocol";
import Webdav from "../storage/Webdav";
import { getQueryParamters } from "../utils";
import AbstractComponentData from "./AbstractComponentData";
import AppDefine from './App.vue'

export default class App extends AbstractComponentData
{
    storage: AbstractStorage|null = null

    rootFile!: File
    ruleList!: RuleList

    configPath!: string
    resPath!: string

    protected getProps()
    {
        this.ruleList = new RuleList()
        this.rootFile = new File(null, '', 0, -1, [], true, false)
        
        return {
            rootFile: this.rootFile,
            listFiles: this.isolate(this.listFiles),
            getFileState: this.isolate(this.getFileState),
            setFileState: this.isolate(this.setFileState),
            saveRules: this.isolate(this.saveRules),
            getInvalidRules: this.isolate(this.getInvalidRules),
            removeRule: this.isolate(this.removeRule),
            getRuleCount: this.isolate(this.getRuleCount),
        }
    }

    protected getComponentDefine()
    {
        return AppDefine
    }

    protected lateInit()
    {
        ;(async () => {
            let parameters = getQueryParamters(location.search)

            let args: string|null = parameters.arguments ?? null
            if (args != null)
                parameters = JSON.parse(atob(args))
                // parameters = JSON.parse(Buffer.from(args, 'base64').toString())
            
            console.log(parameters);

            let api: string|null = parameters.api ?? null
            let server: string|null = parameters.server ?? null
            let path: string|null = parameters.path ?? null
            let user: string|null = parameters.user ?? null
            let pass: string|null = parameters.pass ?? null
            let config: string|null = parameters.config ?? null
            let res: string|null = parameters.res ?? null

            let isPrivateProtocol = api != null

            if (isPrivateProtocol)
            {
                if (config == null || res == null)
                {
                    window.bubble('私有协议参数不完整', 5000)
                    throw new Error("私有协议参数不完整");
                }

                this.configPath = config
                this.resPath = res

                this.storage = new PrivateProtocol(api ?? '/_')
            } else {
                if (server == null || path == null || user == null || pass == null || config == null || res == null)
                {
                    window.bubble('Webdav协议参数不完整', 5000)
                    throw new Error("Webdav协议参数不完整");
                }

                this.configPath = config
                this.resPath = res

                this.storage = new Webdav({ server: server, basepath: path, username: user, password: pass })
            }
            
            await this.loadRulesAndFirstFolder()
        })()
    }

    private async loadRulesAndFirstFolder(): Promise<void>
    {
        let isJson = this.configPath.endsWith('json')
        let content!: string
        try {
            content = await this.storage!.read(this.configPath)
        } catch (e) {
            if (e instanceof ServerSideException)
                throw new ConfigFileNotFound('找不到或者无法读取配置文件文件: ' + this.configPath)
        }
        
        console.log(content)

        this.ruleList.loadRules(content, isJson)
        
        let firstFolder!: Array<(FileInfo | DirInfo)>
        try {
            firstFolder = await this.storage!.list(this.resPath)
        } catch (e) {
            if (e instanceof ServerSideException)
                throw new ResFolderNotFound('找不到或者无法读取资源目录: ' + this.resPath)
        }

        for (const t of firstFolder)
            this.rootFile.files!.push(this.FileDirInfo2File(t, null))
        
        this.vueComponent.$forceUpdate()
        this.vueComponent.$refs.fr.$forceUpdate()
    }

    private FileDirInfo2File(fdi: FileInfo|DirInfo, parent: File|null): File
    {
        if (fdi instanceof FileInfo)
            return File.fromFile(fdi.name, fdi.modified, fdi.length, parent)
        else
            return File.fromDir(fdi.name, fdi.modified, parent)
    }

    private async saveRules(): Promise<void>
    {
        let text = this.ruleList.toText()
        await this.storage!.write(this.configPath, text)
        window.bubble('更新规则已保存')
    }

    private async listFiles(file: File): Promise<void>
    {
        file.fetching = true
        let path = file.getPath()
        let result = await this.storage!.list(this.resPath + (path != '' ? '/' : '') + path)
        // await new Promise((a, b) => setTimeout(() => a(undefined), Math.random() * 600))
        file.fetching = false
        file.files = result.map(f => this.FileDirInfo2File(f, file))
    }

    private getFileState(file: File): number
    {
        return this.ruleList.getFileState(file.getPath())
    }

    private setFileState(file: File, state: number)
    {
        this.ruleList.setFileState(file.getPath(), state)
    }

    private getInvalidRules(path: string, filenames: Array<string>): [Array<string>, Array<string>]
    {
        return this.ruleList.getInvalidRules(path, filenames)
    }

    private removeRule(rule: string, isCommonRule: boolean)
    {
        this.ruleList.removeRule(rule, isCommonRule)
    }

    private getRuleCount(path: string): number
    {
        return this.ruleList.getRuleCount(path)
    }
}