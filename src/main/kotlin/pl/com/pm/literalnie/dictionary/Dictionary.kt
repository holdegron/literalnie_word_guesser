package pl.com.pm.literalnie.dictionary

import java.io.BufferedReader
import java.nio.file.Path
import java.util.zip.GZIPInputStream
import kotlin.io.path.inputStream
import kotlin.io.path.isRegularFile
import kotlin.io.path.name

class Dictionary(words: Collection<Word>) {
    private val wordsByLength: Map<Int, List<Word>> = words.groupBy { it.text.length }

    val size: Int = words.size

    fun wordsOfLength(length: Int): List<Word> = wordsByLength[length].orEmpty()
}

fun loadDictionary(path: Path): Dictionary {
    check(path.isRegularFile()) {
        "SGJP dictionary not found at '${path.toAbsolutePath()}'. Run `./gradlew downloadDictionary` first."
    }
    return path.openReader().useLines { Dictionary(it.toWords()) }
}

private fun Path.openReader(): BufferedReader =
    inputStream()
        .let { if (name.endsWith(".gz")) GZIPInputStream(it, 1 shl 16) else it }
        .bufferedReader(Charsets.UTF_8)
