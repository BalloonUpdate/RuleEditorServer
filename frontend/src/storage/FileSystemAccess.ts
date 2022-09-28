import FileNotFoundException from "../exceptions/FileNotFoundException";
import { getDirnameAndBasename } from "../utils";
import AbstractStorage, { DirInfo, FileInfo } from "./AbstractStorage";

export class FileSystemAccess extends AbstractStorage
{
    root: FileSystemDirectoryHandle

    constructor(root: FileSystemDirectoryHandle)
    {
        super()

        this.root = root
    }

    private async getFileInternal(path: string, isfile: boolean): Promise<FileSystemFileHandle | FileSystemDirectoryHandle>
    {
        try {
            let split = path.split("/")
            let dir: FileSystemDirectoryHandle = this.root

            if (split.length > 1)
                for (const name of split.slice(0, split.length - 1))
                {
                    console.log('ddd: ' + name);
                    
                    dir = await this.root.getDirectoryHandle(name)
                }
            
            let end = split[split.length - 1]
            console.log('qqq: ' + end);
            return isfile ?
                dir.getFileHandle(end) :
                dir.getDirectoryHandle(end)
        } catch (e) {
            if (e?.name == 'NotFoundError')
                throw new FileNotFoundException(path + '(' + e.message + ')')
            throw e
        }
    }

    isReadOnly(): boolean 
    {
        return false
    }

    async impl_list(path: string): Promise<Array<(FileInfo | DirInfo)>>
    {
        console.log('f', path);

        try {
            let result: Array<(FileInfo | DirInfo)> = []
            
            let dir = await this.getFileInternal(path, false)
            for await (const entry of (dir as any).values())
            {
                if (entry.kind == 'file')
                {
                    let file = await (entry as FileSystemFileHandle).getFile()
                    result.push(new FileInfo(file.name, file.size, file.lastModified))
                } else if (entry.kind == 'directory') {
                    let dir = (entry as FileSystemDirectoryHandle)
                    result.push(new DirInfo(dir.name, 0))
                }
            }
    
            return result
        } catch (e) {
            if (e?.name == 'NotFoundError')
                throw new FileNotFoundException(path + ' (' + e.message + ')')
            throw e
        }
    }

    async impl_read(path: string): Promise<string>
    {
        try {
            let file = await this.getFileInternal(path, true)
            let f: File = await (file as any).getFile()
            return await f.text()
        } catch (e) {
            if (e?.name == 'NotFoundError')
                throw new FileNotFoundException(path + ' (' + e.message + ')')
            throw e
        }
    }

    async impl_write(path: string, content: any): Promise<void>
    {
        try {
            let file = await this.getFileInternal(path, true)
            let writableStream: any = await (file as any).createWritable()
            await writableStream.write(content)
            await writableStream.close()
        } catch (e) {
            if (e?.name == 'NotFoundError')
                throw new FileNotFoundException(path + ' (' + e.message + ')')
            throw e
        }
    }

    async impl_delete(path: string): Promise<void>
    {
        try {
            let [dname, bname] = getDirnameAndBasename(path)
            let dir = (await this.getFileInternal(dname, false)) as FileSystemDirectoryHandle
            await dir.removeEntry(bname)
        } catch (e) {
            if (e?.name == 'NotFoundError')
                throw new FileNotFoundException(path + ' (' + e.message + ')')
            throw e
        }
    }

    async impl_move(source: string, dist: string): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    async impl_copy(source: string, dist: string): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
    
    async impl_exists(path: string): Promise<boolean>
    {
        try {
            let [dname, bname] = getDirnameAndBasename(path)
            let dir = (await this.getFileInternal(dname, false)) as FileSystemDirectoryHandle

            for await (let e of (dir as any).values())
                if (e.name == bname)
                    return true
            
            return false
        } catch (e) {
            if (e?.name == 'NotFoundError')
                throw new FileNotFoundException(path + ' (' + e.message + ')')
            throw e
        }
    }

    async impl_mkdir(path: string): Promise<void>
    {
        try {
            let [dname, bname] = getDirnameAndBasename(path)
            let dir = (await this.getFileInternal(dname, false)) as FileSystemDirectoryHandle
            await dir.getDirectoryHandle(bname, { create: true })
        } catch (e) {
            if (e?.name == 'NotFoundError')
                throw new FileNotFoundException(path + ' (' + e.message + ')')
            throw e
        }
    }

    async impl_link(path: string, noscheme: boolean): Promise<string>
    {
        throw new Error("the 'link' Method not implemented.");
    }
}

// private async tryLoadFileSystemAccessStorage(): Promise<void>
// {
//     let root: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker()

//     let config = localStorage.getItem('rule-editor-config') ?? 'index.json'
//     let res = localStorage.getItem('rule-editor-res') ?? 'res'
    
//     let config_ = prompt('输入配置文件名(通常是config.yml或index.json)', config)
//     if (config_ == null)
//         return
//     config = config_
//     let res_ = prompt('输入资源目录名(通常是res)', res)
//     if (res_ == null)
//         return
//     res = res_

//     localStorage.setItem('rule-editor-config', config)
//     localStorage.setItem('rule-editor-res', res)
    
//     this.configPath = config
//     this.resPath = res
//     this.storage = new FileSystemAccess(root)

//     await this.loadRulesAndFirstFolder()
// }