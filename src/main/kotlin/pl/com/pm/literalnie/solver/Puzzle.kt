package pl.com.pm.literalnie.solver

import pl.com.pm.literalnie.dictionary.isPolishWord

sealed interface Clue {
    fun admits(answer: String): Boolean
}

data class Guess(val word: String, val marks: List<Mark>) : Clue {
    init {
        require(isPolishWord(word)) { "Guess '$word' may contain only lowercase Polish letters" }
        require(marks.size == word.length) { "Guess '$word' has ${word.length} letters but ${marks.size} marks" }
    }

    override fun admits(answer: String): Boolean = feedback(word, answer) == marks
}

data class KnownLetters(
    val correct: Map<Int, Char> = emptyMap(),
    val present: Map<Char, Set<Int>> = emptyMap(),
    val absent: Set<Char> = emptySet(),
) : Clue {
    init {
        val letters = correct.values + present.keys + absent
        require(letters.all { isPolishWord(it.toString()) }) { "Letters must be lowercase Polish letters, were $letters" }
        require(absent.none { it in correct.values || it in present.keys }) {
            "Letters ${absent.filter { it in correct.values || it in present.keys }} cannot be both absent and in the word"
        }
    }

    val positions: Set<Int>
        get() = correct.keys + present.values.flatten()

    override fun admits(answer: String): Boolean =
        correct.all { (position, letter) -> answer[position] == letter } &&
            present.all { (letter, notAt) -> letter in answer && notAt.none { answer[it] == letter } } &&
            absent.none { it in answer }
}

data class Puzzle(val length: Int, val clues: List<Clue> = emptyList()) {
    init {
        require(length in LENGTHS) { "Word length must be within $LENGTHS, was $length" }
        clues.forEach { clue ->
            when (clue) {
                is Guess -> require(clue.word.length == length) { "Guess '${clue.word}' must have $length letters" }
                is KnownLetters -> require(clue.positions.all { it in 0..<length }) {
                    "Letter positions must be within 0..${length - 1}, were ${clue.positions}"
                }
            }
        }
    }

    companion object {
        val LENGTHS = 2..30
    }
}
