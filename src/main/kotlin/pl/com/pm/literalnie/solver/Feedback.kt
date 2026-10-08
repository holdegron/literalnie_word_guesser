package pl.com.pm.literalnie.solver

/** Tile colour shown by the game after a guess. */
enum class Mark {
    /** Grey: the letter is not in the answer (or all its occurrences are already accounted for). */
    ABSENT,

    /** Yellow: the letter is in the answer, but in a different position. */
    PRESENT,

    /** Green: the letter is in the right position. */
    CORRECT,
}

/**
 * Colours [guess] the way the game would if [answer] were the hidden word.
 *
 * Exact matches are resolved first; the remaining answer letters are then handed out
 * left to right as [Mark.PRESENT], so a repeated letter is yellow only as many times
 * as it still occurs in the answer.
 */
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
