import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import java.util.Date
import java.text.SimpleDateFormat

fun getVersionName(tagName: String) = if(tagName.startsWith("v")) tagName.substring(1) else tagName
val gitTagName: String? get() = Regex("(?<=refs/tags/).*").find(System.getenv("GITHUB_REF") ?: "")?.value
val gitCommitSha: String? get() = System.getenv("GITHUB_SHA") ?: null
val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS Z").format(Date()) as String
val debugVersion: String get() = System.getenv("DBG_VERSION") ?: "0.0.0"

plugins {
    kotlin("jvm") version "1.7.10"
    application
}

val mainClassPath = "RuleEditorServer"
val author = "BalloonUpdate"
val website = "https://github.com/BalloonUpdate/RuleEditorServer"

group = "com.github.balloon-update"
version = gitTagName?.run { getVersionName(this) } ?: debugVersion

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.json:json:20220320")
    implementation("org.nanohttpd:nanohttpd:2.3.1")
    implementation("org.nanohttpd:nanohttpd-webserver:2.3.1")
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}

tasks.jar {
    duplicatesStrategy = DuplicatesStrategy.INCLUDE

    // 添加Manifest
    manifest {
        attributes("Main-Class" to mainClassPath)
        attributes("Application-Version" to archiveVersion.get())
        attributes("Author" to author)
        attributes("Website" to website)
        attributes("Git-Commit" to (gitCommitSha ?: ""))
        attributes("Compile-Time" to timestamp)
        attributes("Compile-Time-Ms" to System.currentTimeMillis())
    }

    // 复制依赖库
    from(configurations.runtimeClasspath.get().map {
//        println("- "+it.name)
        if (it.isDirectory) it else zipTree(it)//.matching { exclude("*") }
    })

    doFirst {
        exec {
            commandLine("build-frontend.cmd")
//            isIgnoreExitValue = true
        }
    }

    // 打包web目录
    from("web") { into("web") }

    // 打包源代码
    sourceSets.main.get().allSource.sourceDirectories.map {
        if(it.name != "resources")
            from(it) {into("sources/"+it.name) }
    }

    // 设置输出路径
    destinationDirectory.set(File(project.buildDir, "production"))
}