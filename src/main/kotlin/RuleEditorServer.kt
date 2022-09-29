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

        if (!isDev)
        {
            if (args.size < 3)
            {
                println("缺少参数： 0.服务端目录路径, 1.更新规则文件相对路径(相对与服务端目录), 2.端口")
                exitProcess(1)
            }
        } else {
            if (args.size < 2)
            {
                println("缺少参数： 0.服务端目录路径, 1.更新规则文件相对路径(相对与服务端目录)")
                exitProcess(1)
            }
        }

        val workDir = File2(System.getProperty("user.dir"))
        val serverDir = File2(args[0])
        val ruleFile = serverDir + args[1]
        val httpPort = if (isDev) 6700 else args[2].toInt()
        val webDir = if (isDev) workDir + "web" else null

        if (!serverDir.exists)
        {
            println("服务端目录找不到: ${serverDir.path}")
            exitProcess(1)
        }

        val res = serverDir + "res"
        if (!res.exists)
        {
            println("服务端目录下找不到res目录: ${res.path}")
            exitProcess(1)
        }

        if (!ruleFile.exists)
        {
            println("服务端目录下找不到更新规则文件: ${ruleFile.path}")
            exitProcess(1)
        }

        val ruleFilename = ruleFile.name

        val server = Server("0.0.0.0", httpPort, webDir, serverDir)
        server.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false)

        val arguments = JSONObject()
        arguments.put("api", "http://127.0.0.1:$httpPort/_")
        arguments.put("config", ruleFilename)
        arguments.put("res", "res")

        val iface = "http://127.0.0.1:$httpPort/index.html?arguments=" + Base64.getEncoder().encodeToString(arguments.toString().toByteArray())
        val iface2 = "http://127.0.0.1:$httpPort/index.html?api=http://127.0.0.1:$httpPort/_&config=$ruleFilename&res=res"
        println(iface)
        println(iface2)

        if (!isDev && System.getProperty("os.name").lowercase().startsWith("windows"))
            Runtime.getRuntime().exec("cmd /C start $iface")
    }
}