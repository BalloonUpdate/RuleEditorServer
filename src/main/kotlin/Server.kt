import fi.iki.elonen.NanoHTTPD
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.URLDecoder
import java.text.SimpleDateFormat
import java.util.jar.JarFile


class Server(host: String, port: Int, val webDir: File2?, val assetsDir: File2) : NanoHTTPD(host, port)
{
    private val fmt = SimpleDateFormat("YYYY-MM-dd HH:mm:ss")
    private val jarFile = if (webDir == null) JarFile(getJarFile().path) else null

    /**
     * 服务主函数
     */
    override fun serve(session: IHTTPSession): Response
    {
        val timestamp = fmt.format(System.currentTimeMillis())
        val start = System.currentTimeMillis()
        val res: Response = handleRequest(session)
        val elapsed = System.currentTimeMillis() - start
        val statusCode = res.status.requestStatus
        val uri = session.uri
        val ip: String = session.javaClass.getDeclaredField("remoteIp").also { it.isAccessible = true }.get(session) as String

        println(String.format("[ %s ] %3s | %-15s | %s (%dms)", timestamp, statusCode, ip, uri, elapsed))

        return res
    }

    /**
     * 服务具体处理过程
     */
    fun handleRequest(session: IHTTPSession): Response
    {
        try {
            // Remove URL arguments
            val uri = session.uri.trim().replace(File.separatorChar, '/')
            val path = if ('?' in uri) uri.substring(0, uri.indexOf('?')) else uri

            // Prohibit getting out of current directory
            if ("../" in path)
                return ResponseHelper.buildForbiddenResponse("Won't serve ../ for security reasons.")

            if (path == "/_" && session.method == Method.POST)
                return handleFileRequest(session) ?: return ResponseHelper.buildForbiddenResponse("no more message")

            // if request on a directory
            val dir = Regex("(?<=^/)[^/]+(?=\\.json\$)").find(path)?.run { File2(this.value) }

            // Rewrite
            if (dir != null) { // 禁止访问任何目录
                return ResponseHelper.buildForbiddenResponse("Directory is unable to show")
            } else {
                if (webDir != null)
                {
                    val file = webDir + path.substring(1)

                    if(!file.exists)
                        return ResponseHelper.buildNotFoundResponse(path)

                    if(file.isFile)
                        return ResponseHelper.buildFileResponse(file)

                    // 100%不会执行到这里
                    return ResponseHelper.buildPlainTextResponse(path)
                } else {
//                    val stream = javaClass.getResourceAsStream(path)

                    val fileInZip = jarFile!!.getJarEntry("web$path") ?: return ResponseHelper.buildNotFoundResponse(path)
                    val stream = jarFile.getInputStream(fileInZip)
                    return ResponseHelper.buildFileStreamResponse(stream, path, fileInZip.size)
                }
            }
        } catch (e: Exception) {
            return ResponseHelper.buildInternalErrorResponse(e.stackTraceToString())
        }
    }

    fun handleFileRequest(session: IHTTPSession): Response?
    {
        val length = session.headers["content-length"] ?: return null

        val buf = ByteArray(length.toInt())
        session.inputStream.read(buf, 0, buf.size)
        val body = JSONObject(buf.decodeToString())

        val action = body["action"] ?: return null
        val path = body["path"] as String? ?: return null
        val file = assetsDir + path

        if (!file.exists)
            return ResponseHelper.buildNotFoundResponse(path)

        when (action)
        {
            "list" -> {
                val output = JSONArray()

                for (f in file)
                {
                    val o = JSONObject()
                    o.put("name", f.name)
                    o.put("modified", if (f.isFile) f.modified / 1000 else 0)
                    if (f.isFile)
                        o.put("length", f.length)
                    output.put(o)
                }

                return ResponseHelper.buildPlainTextResponse(output.toString())
            }

            "read" -> {
                return ResponseHelper.buildPlainTextResponse(file.content)
            }

            "write" -> {
                file.content = body["content"] as String? ?: return null
                return ResponseHelper.buildPlainTextResponse("ok")
            }

            "exists" -> {
                return ResponseHelper.buildPlainTextResponse(if (file.exists) "yes" else "no")
            }

            else -> return null
        }

    }

    /**
     * 获取当前Jar文件路径（仅打包后有效）
     */
    fun getJarFile(): File2
    {
        val url = URLDecoder.decode(javaClass.protectionDomain.codeSource.location.file, "UTF-8").replace("\\", "/")
        return File2(if (url.endsWith(".class") && "!" in url) {
            val path = url.substring(0, url.lastIndexOf("!"))
            if ("file:/" in path) path.substring(path.indexOf("file:/") + "file:/".length) else path
        } else url)
    }
}
