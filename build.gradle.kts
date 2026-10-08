import java.net.URI

plugins {
    kotlin("jvm") version "2.3.21"
    kotlin("plugin.spring") version "2.3.21"
    id("org.springframework.boot") version "4.1.1"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "pl.com.pm"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("tools.jackson.module:jackson-module-kotlin")

    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

val downloadDictionary = tasks.register("downloadDictionary") {
    group = "literalnie"
    description = "Downloads the SGJP inflection dictionary (BSD-2-Clause) to data/sgjp.tab.gz."

    val sgjpVersion = providers.gradleProperty("sgjpVersion").get()
    val source = "https://download.sgjp.pl/morfeusz/$sgjpVersion/sgjp-$sgjpVersion.tab.gz"
    val target = layout.projectDirectory.file("data/sgjp.tab.gz").asFile
    inputs.property("source", source)
    outputs.file(target)

    doLast {
        logger.lifecycle("Downloading $source")
        target.parentFile.mkdirs()
        URI(source).toURL().openStream().use { input ->
            target.outputStream().use { output -> input.copyTo(output) }
        }
    }
}

tasks.bootRun {
    dependsOn(downloadDictionary)
}

tasks.processResources {
    from("web/dist") {
        into("static")
    }
}

tasks.jar {
    enabled = false
}
