import fi.iki.elonen.NanoHTTPD
import kotlin.system.exitProcess

object RuleEditorServer
{
    @JvmStatic
    fun main(args: Array<String>)
    {
        val isDev = (javaClass.getResource("")?.protocol ?: false) == "file"
        val workDir = File2(System.getProperty("user.dir"))
        val httpPort = if (args.isNotEmpty()) args[0].toInt() else 6700
        val assetsDir = workDir + (if (args.size > 1) args[1] else "assets")
        val webDir = if (isDev) workDir + "web" else null

        if (!assetsDir.exists)
        {
            println("服务端目录找不到: ${assetsDir.path}")
            exitProcess(1)
        }

        val res = assetsDir + "res"
        if (!res.exists)
        {
            println("服务端目录下找不到res目录: ${res.path}")
            exitProcess(1)
        }

        val asJson = assetsDir + "index.json"
        val asYaml = assetsDir + "config.yml"

        if (!asJson.exists && !asYaml.exists)
        {
            println("服务端目录下找不到index.json或者config.yml")
            exitProcess(1)
        }

        val config = if (asJson.exists) asJson.name else asYaml.name

        val server = Server("127.0.0.1", httpPort, webDir, assetsDir)
        server.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false)

        println("http://127.0.0.1:$httpPort/index.html?api=http://127.0.0.1:$httpPort/_&config=$config&res=res")
    }
}