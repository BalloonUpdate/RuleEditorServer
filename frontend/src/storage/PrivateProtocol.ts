import ServerSideException from "../exceptions/ServerSideException";
import AbstractStorage, { DirInfo, FileInfo } from "./AbstractStorage";

export default class PrivateProtocol extends AbstractStorage
{
    api: string

    constructor(api: string)
    {
        super();
        
        this.api = api
    }

    isReadOnly(): boolean 
    {
        return false
    }

    private async fetch(path: string, url: string, body: any): Promise<string>
    {
        let rsp = await fetch(url + '?path=' + path, {
            method: 'post',
            mode: 'cors',
            cache: 'no-cache',
            // credentials: 'include',
            body: JSON.stringify(body),
        })

        if (!rsp.ok)
            throw new ServerSideException(rsp.statusText)
        
        return await rsp.text()
    }

    protected async impl_list(path: string): Promise<(FileInfo | DirInfo)[]> 
    {
        let files: Array<(FileInfo | DirInfo)> = []
        
        let r = JSON.parse(await this.fetch(path, this.api, { action: 'list', path: path, }))
        for (const f of r)
        {
            if ('length' in f)
            {
                files.push(new FileInfo(f.name, f.length, f.modified))
            } else {
                files.push(new DirInfo(f.name, f.modified))
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

    protected async impl_read(path: string): Promise<string> 
    {
        return await this.fetch(path, this.api, {
            action: 'read',
            path: path,
        })
    }

    protected async impl_write(path: string, content: ArrayBuffer): Promise<void> 
    {
        await this.fetch(path, this.api, {
            action: 'write',
            path: path,
            content: content,
        })
    }

    protected async impl_delete(path: string): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }

    protected async impl_move(source: string, dist: string): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }

    protected async impl_copy(source: string, dist: string): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }

    protected async impl_exists(path: string): Promise<boolean> 
    {
        return (await this.fetch(path, this.api, {
            action: 'exists',
            path: path,
        })).length > 0
    }

    protected async impl_mkdir(path: string): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }

    protected async impl_link(path: string, noscheme: boolean): Promise<string> 
    {
        throw new Error("Method not implemented.");
    }
    
}