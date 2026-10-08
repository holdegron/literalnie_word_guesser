package pl.com.pm.literalnie.dictionary

internal data class SgjpEntry(
    val form: String,
    val lemma: String,
    val tag: String,
    val qualifiers: Set<String>,
)

private val rareQualifiers = setOf("daw.", "przest.", "rzad.", "indyw.", "gwar.", "reg.")

internal fun parseSgjpLine(line: String): SgjpEntry? =
    line.takeUnless { it.startsWith('#') }
        ?.split('\t')
        ?.takeIf { it.size >= 3 }
        ?.let { columns ->
            SgjpEntry(
                form = columns[0],
                lemma = columns[1].substringBefore(':'),
                tag = columns[2],
                qualifiers = columns.getOrNull(4).orEmpty().split(',').filter(String::isNotBlank).toSet(),
            )
        }

internal val SgjpEntry.isGuessable: Boolean
    get() = form == lemma && isPolishWord(form)

private val SgjpEntry.isRare: Boolean
    get() = qualifiers.any(rareQualifiers::contains)

fun Sequence<String>.toWords(): List<Word> =
    mapNotNull(::parseSgjpLine)
        .filter { it.isGuessable }
        .groupBy(SgjpEntry::form)
        .map { (text, entries) ->
            Word(
                text = text,
                partsOfSpeech = entries.mapTo(sortedSetOf()) { PartOfSpeech.fromSgjpTag(it.tag) },
                qualifiers = entries.flatMapTo(sortedSetOf(), SgjpEntry::qualifiers),
                rare = entries.all { it.isRare },
            )
        }
