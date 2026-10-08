package pl.com.pm.literalnie.dictionary

private val polishWord = Regex("[a-ząćęłńóśźż]+")

fun isPolishWord(text: String): Boolean = polishWord.matches(text)

/**
 * A guessable word: a lowercase base form from SGJP, merged across all its homonyms.
 * [rare] is true when every sense is marked archaic, rare, dialectal and so on.
 */
data class Word(
    val text: String,
    val partsOfSpeech: Set<PartOfSpeech>,
    val qualifiers: Set<String>,
    val rare: Boolean,
)
