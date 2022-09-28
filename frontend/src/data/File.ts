export default class File
{
    parent: File|null = null
    filename: string
    modified: number
    length: number
    files: Array<File>|null
    expanded: boolean
    fetching: boolean

    constructor(
        parent: File|null,
        filename: string, 
        modified: number, 
        length: number, 
        files: Array<File>|null, 
        expanded: boolean,
        fetching: boolean,
    ) {
        this.parent = parent
        this.filename = filename
        this.modified = modified
        this.length = length
        this.files = files
        this.expanded = expanded
        this.fetching = fetching
    }

    static fromFile(filename: string, modified: number, length: number, parent: File|null)
    {
        return new File(parent, filename, modified, length, null, false, false)
    }

    static fromDir(filename: string, modified: number, parent: File|null)
    {
        return new File(parent, filename, modified, -1, null, false, false)
    }

    isDirectory()
    {
        return this.length < 0
    }

    isDirectoryFetched(): boolean
    {
        if (!this.isDirectory())
            throw this.filename + ' not found'
        
        return this.files != null
    }

    getPath(): string
    {
        let path = this.filename
        let p: File|null = this.parent
        while(p != null)
        {
            path = p.filename + '/' + path
            p = p.parent
        }
        return path
    }

    getFile(path: String): File|null
    {
        if (!this.isDirectory())
            throw this.filename + ' not found'

        let split = path.split("/")
        let currentDir: File = this
        let index = 0

        for (const name of split)
        {
            let reachEnd = index == split.length - 1

            if (currentDir.files == null)
                throw this.filename + ' not fetched'

            let search = currentDir.files.find(v => v.filename == name)
            if (search == undefined)
                return null

            let current = search

            if (!reachEnd) 
                currentDir = current 
            else 
                return current

            index += 1
        }

        return null
    }

    removeFile(path: String)
    {
        if (!this.isDirectory())
            throw this.filename + ' not found'

        let split = path.split("/")
        let currentDir: File = this
        let index = 0

        for (const name of split)
        {
            let reachEnd = index == split.length - 1
            
            if (currentDir.files == null)
                throw this.filename + ' not fetched'
            
            let search = currentDir.files.find(v => v.filename == name)
            if (search == undefined)
                throw name + ' not found'
            
            let current = search
            
            if (!reachEnd) 
                currentDir = current 
            else 
                currentDir.files = currentDir.files.filter(f => f.filename != name)

            index += 1
        }
    }
}