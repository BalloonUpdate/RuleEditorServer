import fi.iki.elonen.NanoHTTPD
import org.json.JSONObject
import java.util.Base64
import kotlin.system.exitProcess

object RuleEditorServer
{
    @JvmStatic
    fun main(args: Array<String>)
    {
        val isDev = (javaClass.getResource("")?.protocol ?: false) == "file"
        val workDir = File2(System.getProperty("user.dir"))
        val assetsDir = workDir + (if (isDev) "build/production/assets" else (if (args.isNotEmpty()) args[0] else ""))
        val httpPort = if (args.size > 1) args[1].toInt() else 6700
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
        val asBs = assetsDir + "littleserver.json"

        if (!asJson.exists && !asYaml.exists && !asBs.exists)
        {
            println("服务端目录下找不到index.json或者config.yml或者littleserver.json")
            exitProcess(1)
        }

        val config = if (asJson.exists) asJson.name else (if (asYaml.exists) asYaml.name else asBs.name)

        val server = Server("0.0.0.0", httpPort, webDir, assetsDir)
        server.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false)

        val arguments = JSONObject()
        arguments.put("api", "http://127.0.0.1:$httpPort/_")
        arguments.put("config", config)
        arguments.put("res", "res")

        val iface = "http://127.0.0.1:$httpPort/index.html?arguments=" + Base64.getEncoder().encodeToString(arguments.toString().toByteArray())
        val iface2 = "http://127.0.0.1:$httpPort/index.html?api=http://127.0.0.1:$httpPort/_&config=$config&res=res"
        println(iface)
        println(iface2)

        if (!isDev && System.getProperty("os.name").lowercase().startsWith("windows"))
            Runtime.getRuntime().exec("cmd /C start $iface")
    }
}