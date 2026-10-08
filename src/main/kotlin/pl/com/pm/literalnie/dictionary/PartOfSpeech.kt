package pl.com.pm.literalnie.dictionary

enum class PartOfSpeech(private val sgjpTags: Set<String>) {
    NOUN(setOf("subst", "depr", "ger")),
    ADJECTIVE(setOf("adj", "adja", "adjp", "adjc")),
    VERB(setOf("inf", "fin", "praet", "impt", "imps", "winien")),
    ADVERB(setOf("adv")),
    NUMERAL(setOf("num", "numcomp")),
    PRONOUN(setOf("ppron12", "ppron3", "siebie")),
    PREPOSITION(setOf("prep")),
    CONJUNCTION(setOf("conj", "comp")),
    PARTICLE(setOf("part", "qub")),
    INTERJECTION(setOf("interj")),
    OTHER(emptySet());

    companion object {
        private val byTag: Map<String, PartOfSpeech> =
            entries.flatMap { pos -> pos.sgjpTags.map { it to pos } }.toMap()

        fun fromSgjpTag(tag: String): PartOfSpeech = byTag[tag.substringBefore(':')] ?: OTHER
    }
}
