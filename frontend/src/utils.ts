export function getDirname(path: string): string
{
    return path.substring(0, path.lastIndexOf('/') + 1)
}

export function getBasename(path: string): string
{
    return path.substring(path.lastIndexOf('/') + 1)
}

export function getDirnameAndBasename(path: string): [string, string]
{
    return [
        path.substring(0, path.lastIndexOf('/') + 1),
        path.substring(path.lastIndexOf('/') + 1)
    ]
}

/**
 * 将字节数转换成人类阅读友好的字符串
 * @param bytes 字节数
 * @param space 中间的空格
 * @returns 人类阅读友好的字符串
 */
// https://www.cnblogs.com/jialinG/p/9577724.html
export function bytesToSize(bytes: number, space = ' ') {
    if (bytes === 0) return '0 B';
    var k = 1024, // or 1024
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseInt((bytes / Math.pow(k, i))+'') + space + sizes[i];
}

export function getQueryParamters(url: string): any
{
    let result: any = { }

    if (url.startsWith('?'))
        url = url.substring(1)
    
    let fragments = url.split('&').filter(f => f.length > 1)

    for (const frag of fragments)
    {
        let separator = frag.indexOf('=')
        let key = separator != -1 ? frag.substring(0, separator) : frag
        let value = separator != -1 ? frag.substring(separator + 1) : undefined

        result[key] = value
    }

    return result
}