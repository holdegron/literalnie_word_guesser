package pl.com.pm.literalnie.solver

import pl.com.pm.literalnie.dictionary.isPolishWord

data class Guess(val word: String, val marks: List<Mark>) {

    init {
        require(isPolishWord(word)) { "Guess '$word' may contain only lowercase Polish letters" }
        require(marks.size == word.length) { "Guess '$word' has ${word.length} letters but ${marks.size} marks" }
    }

    /** True when [answer] would have produced exactly the marks the game showed for this guess. */
    fun admits(answer: String): Boolean = feedback(word, answer) == marks
}

data class Puzzle(val length: Int, val guesses: List<Guess> = emptyList()) {

    init {
        require(length in LENGTHS) { "Word length must be within $LENGTHS, was $length" }
        guesses.forEach { require(it.word.length == length) { "Guess '${it.word}' must have $length letters" } }
    }

    companion object {
        val LENGTHS = 2..30
    }
}
