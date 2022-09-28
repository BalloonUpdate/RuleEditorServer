import { SyncEvent } from "../event/SyncEvent"
import BaseException from "../exceptions/BaseException"
import ReadOnlyException from "../exceptions/ReadOnlyException"
import ServerSideException from "../exceptions/ServerSideException"

export class FileInfo 
{
    name: string
    length: number
    modified: number

	constructor(name: string, length: number, modified: number)
	{
		this.name = name
		this.length = length
		this.modified = modified
	}
}

export class DirInfo
{
	name: string
    modified: number

	constructor(name: string, modified: number)
	{
		this.name = name
		this.modified = modified
	}
}

export default abstract class AbstractStorage
{
	onIOOperating: SyncEvent<boolean> = new SyncEvent()

	/**
     * 是否开启了只读模式
     */
	abstract isReadOnly(): boolean
	
        /**
     * 列出一个路径下的文件和目录
     * @param dirPath 需要列出的路径
     * @returns 该目录下的所有文件和子目录
     */
	async list(dirPath: string): Promise<Array<FileInfo|DirInfo>>
	{
		return await this.tryCatchIO(this.impl_list(dirPath))
	}
	
	/**
	 * 读取文件内容
	 * @param path 要读取的文件路径
	 * @returns 文件内容
	 */
	async read(path: string): Promise<string>
	{
		return await this.tryCatchIO(this.impl_read(path))
	}

	/**
	 * 写入一个文件
	 * @param path 要写入的文件路径
	 * @param content 文件内容
	 */
	async write(path: string, content: ArrayBuffer): Promise<void>
	{
		if (this.isReadOnly())
			throw new ReadOnlyException()
		
		return await this.tryCatchIO(this.impl_write(path, content))
	}

	/**
	 * 完全删除一个文件或者目录
	 * @param path 需要删除的文件路径
	 */
	async delete(path: string): Promise<void>
	{
		if (this.isReadOnly())
			throw new ReadOnlyException()
		
		return await this.tryCatchIO(this.impl_delete(path))
	}

	/**
	 * 移动或者重命名一个文件(底层：复制+删除)
	 * @param source 源路径
	 * @param dist 目标路径
	 */
	async move(source: string, dist: string): Promise<void>
	{
		if (this.isReadOnly())
			throw new ReadOnlyException()
		
		return await this.tryCatchIO(this.impl_move(source, dist))
	}

	/**
	 * 复制一个文件或者目录
	 * @param source 源路径
	 * @param dist 目标路径
	 */
	async copy(source: string, dist: string): Promise<void>
	{
		if (this.isReadOnly())
			throw new ReadOnlyException()
		
		return await this.tryCatchIO(this.impl_copy(source, dist))
	}

	/**
	 * 判断文件是否存在
	 * @param path 文件路径
	 * @returns 文件是否存在
	 */
	async exists(path: string): Promise<boolean>
	{
		return await this.tryCatchIO(this.impl_exists(path))
	}

	/**
	 * 创建一个目录
	 * @param path 目录路径
	 */
	async mkdir(path: string): Promise<void>
	{
		if (this.isReadOnly())
			throw new ReadOnlyException()
		
		return await this.tryCatchIO(this.impl_mkdir(path))
	}

	/**
	 * 创建一个文件
	 * @param path 文件路径
	 */
	async create(path: string): Promise<void>
	{
		if (this.isReadOnly())
			throw new ReadOnlyException()
		
		return await this.tryCatchIO(this.impl_write(path, new TextEncoder().encode('')))
	}

	/**
	 * 返回文件的下载地址（尤其是图片）
	 * @param path 文件的路径
	 * @param noscheme 下载地址是否不带scheme
	 * @returns 下载地址
	 */
	async link(path: string, noscheme: boolean): Promise<string>
	{
		return await this.tryCatchIO(this.impl_link(path, noscheme))
	}

	/**
     * 捕捉异常
     * @param p 要捕捉的对象
     * @returns 正常的返回值
     */
	private async tryCatchIO<T>(p: Promise<T>): Promise<Awaited<T>>
	{
		try {
			this.onIOOperating.invoke(true)
			// await sleep(1000)
			return await p
		} catch (e) {
			if (e instanceof BaseException)
				throw e
			throw new ServerSideException(e)
		} finally {
			this.onIOOperating.invoke(false)
		}
	}

	// 子类负责实现的部分
    protected abstract impl_list(path: string): Promise<Array<FileInfo|DirInfo>>

    protected abstract impl_read(path: string): Promise<string>

    protected abstract impl_write(path: string, content: ArrayBuffer): Promise<void>

    protected abstract impl_delete(path: string): Promise<void>

    protected abstract impl_move(source: string, dist: string): Promise<void>

    protected abstract impl_copy(source: string, dist: string): Promise<void>

    protected abstract impl_exists(path: string): Promise<boolean>

    protected abstract impl_mkdir(path: string): Promise<void>

    protected abstract impl_link(path: string, noscheme: boolean): Promise<string>
}