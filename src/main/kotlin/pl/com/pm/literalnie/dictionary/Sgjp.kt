package pl.com.pm.literalnie.dictionary

/**
 * Parsing of the SGJP tab dump (https://download.sgjp.pl/morfeusz/).
 *
 * Every data line has the columns: form, lemma, tag, name category, qualifiers, e.g.
 * `kotem	kot:Sm1	subst:sg:inst:m2	nazwa_pospolita	`. The lemma may carry a homonym
 * suffix after a colon. The file starts with a license header that has no tab-separated columns.
 */
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

/** Base forms written in lowercase Polish letters only: no proper names, acronyms or multi-word entries. */
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
