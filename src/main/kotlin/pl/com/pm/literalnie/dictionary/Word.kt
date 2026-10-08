package pl.com.pm.literalnie.dictionary

private val polishWord = Regex("[a-ząćęłńóśźż]+")

fun isPolishWord(text: String): Boolean = polishWord.matches(text)

data class Word(
    val text: String,
    val partsOfSpeech: Set<PartOfSpeech>,
    val qualifiers: Set<String>,
    val rare: Boolean,
)
