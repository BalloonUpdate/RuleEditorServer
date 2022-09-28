import moment from "moment";
import { AuthType, createClient, WebDAVClient } from "webdav/web";
import ServerSideException from "../exceptions/ServerSideException";
import AbstractStorage, { DirInfo, FileInfo } from "./AbstractStorage";

export interface WebdavConfig {
    /**
     * Webdav服务器地址
     */
    server: string,
    
    /**
     * Webdav的基本路径，不要以/结尾。如果不使用请留空
     */
    basepath: string, 

    /**
     * Webdav验证用户名
     */
    username: string, 

    /**
     * Webdav验证密码
     */
    password: string,
}

export default class Webdav extends AbstractStorage {
    private client: WebDAVClient
    private _options: WebdavConfig

    constructor(options: WebdavConfig)
    {
        super()
        
        this._options = options

        this.client = createClient(options.server, {
            authType: AuthType.Password,
            username: options.username,
            password: options.password
        })
    }

    private get prefix(): string
    {
        return this._options!!.basepath + '/'
    }

    isReadOnly(): boolean 
    {
        return false
    }
    
    async impl_list(path: string): Promise<Array<FileInfo|DirInfo>> 
    {
        let files: Array<FileInfo|DirInfo> = []

        let dc
        try {
            dc = await this.client.getDirectoryContents(this.prefix + path) as Array<any>
        } catch (e) {
            throw new ServerSideException(path + ' (' + e.message + ')')
        }
        // 过滤上级目录
        dc.splice(0, 1)

        // // 过滤上级目录
        // let slashCounts = dc.map(e => e.filename.split('/').length)
        // let maxCount = -1000
        // let minCount = 1000
        // for (const sc of slashCounts)
        // {
        //     maxCount = Math.max(maxCount, sc)
        //     minCount = Math.min(minCount, sc)
        // }
        
        // // 有上级目录
        // if (maxCount != -1000 && minCount != 1000 && maxCount != minCount)
        // {
        //     console.log('before filtering', dc);
        //     dc = dc.filter(e => e.filename.split('/').length > minCount)
        //     console.log('after filtering', dc);
        // }
        
        for (const file of dc)
        {
            if(file.type == 'file')
            {
                files.push(new FileInfo(file.basename, file.size, moment(file.lastmod).unix()))
            } else {
                files.push(new DirInfo(file.basename, moment(file.lastmod).unix()))
            }
        }

        return files.sort((a, b) => {
            let aIsDir = a instanceof DirInfo
            let bIsDir = b instanceof DirInfo
            
            if (aIsDir != bIsDir)
                return aIsDir ? -1 : 1
            
            return a.name.localeCompare(b.name)
        })
    }

    async impl_read(path: string): Promise<string> 
    {
        try {
            return await this.client.getFileContents(this.prefix + path, { format: 'text' }) as string
        } catch (e) {
            throw new ServerSideException(path + ' (' + e.message + ')')
        }
    }

    async impl_write(path: string, content: ArrayBuffer): Promise<void>
    {
        try {
            await this.client.putFileContents(this.prefix + path, content, { overwrite: true, contentLength: content.byteLength })
        } catch (e) {
            throw new ServerSideException(path + ' (' + e.message + ')')
        }
    }

    async impl_delete(path: string): Promise<void>
    {
        try {
            await this.client.deleteFile(this.prefix + path)
        } catch (e) {
            throw new ServerSideException(path + ' (' + e.message + ')')
        }
    }

    async impl_move(source: string, dist: string)
    {
        try {
            await this.client.moveFile(this.prefix + source, this.prefix + dist)
        } catch (e) {
            throw new ServerSideException(source + ' -> ' + dist + ' (' + e.message + ')')
        }
    }

    async impl_copy(source: string, dist: string)
    {
        try {
            await this.client.copyFile(this.prefix + source, this.prefix + dist)
        } catch (e) {
            throw new ServerSideException(source + ' -> ' + dist + ' (' + e.message + ')')
        }
    }

    async impl_exists(path: string): Promise<boolean> 
    {
        try {
            return await this.client.exists(this.prefix + path) !== false
        } catch (e) {
            throw new ServerSideException(path + ' (' + e.message + ')')
        }
    }

    async impl_mkdir(path: string)
    {
        try {
            await this.client.createDirectory(this.prefix + path)
        } catch (e) {
            throw new ServerSideException(path + ' (' + e.message + ')')
        }
    }

    async impl_create(path: string, content?: string)
    {
        try {
            await this.write(path, new TextEncoder().encode(''))
        } catch (e) {
            throw new ServerSideException(path + ' (' + e.message + ')')
        }
    }

    async impl_link(path: string, noscheme: boolean): Promise<string> 
    {
        try {
            let realLink = decodeURI(this.client.getFileDownloadLink(this.prefix + path))
            return realLink
        } catch (e) {
            throw new ServerSideException(path + ' (' + e.message + ')')
        }
    }
}