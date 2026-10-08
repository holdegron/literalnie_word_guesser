package pl.com.pm.literalnie.solver

enum class Mark { ABSENT, PRESENT, CORRECT }

fun feedback(guess: String, answer: String): List<Mark> {
    require(guess.length == answer.length) { "Guess '$guess' and answer '$answer' differ in length" }

    val unmatchedAnswerLetters: Map<Char, Int> = answer.indices
        .filter { guess[it] != answer[it] }
        .groupingBy { answer[it] }
        .eachCount()

    return guess.indices
        .fold(emptyList<Mark>() to unmatchedAnswerLetters) { (marks, pool), i ->
            val letter = guess[i]
            val left = pool[letter] ?: 0
            when {
                letter == answer[i] -> (marks + Mark.CORRECT) to pool
                left > 0 -> (marks + Mark.PRESENT) to (pool + (letter to left - 1))
                else -> (marks + Mark.ABSENT) to pool
            }
        }
        .first
}
