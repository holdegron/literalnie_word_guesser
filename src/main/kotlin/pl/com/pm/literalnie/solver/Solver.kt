package pl.com.pm.literalnie.solver

import pl.com.pm.literalnie.dictionary.Dictionary
import pl.com.pm.literalnie.dictionary.Word

/**
 * @property candidates words that are still possible answers, best next guesses first
 * @property funnel number of candidates before the first guess and after each following one
 */
data class Solution(val candidates: List<Word>, val funnel: List<Int>)

fun Dictionary.solve(puzzle: Puzzle): Solution {
    val pools = puzzle.guesses.runningFold(wordsOfLength(puzzle.length)) { pool, guess ->
        pool.filter { guess.admits(it.text) }
    }
    return Solution(candidates = pools.last().rankedForNextGuess(), funnel = pools.map { it.size })
}

/**
 * Orders candidates so that the most informative guess comes first: common words before rare ones,
 * then words whose distinct letters (and letters in their exact positions) are shared by the largest
 * number of remaining candidates. Whatever colours such a guess gets, it splits the pool the most.
 */
fun List<Word>.rankedForNextGuess(): List<Word> {
    val letterCoverage = flatMap { it.text.toSet() }.groupingBy { it }.eachCount()
    val positionCoverage = flatMap { it.text.withIndex() }.groupingBy { it }.eachCount()

    val informationScore = associateWith { word ->
        word.text.toSet().sumOf(letterCoverage::getValue) + word.text.withIndex().sumOf(positionCoverage::getValue)
    }

    return sortedWith(
        compareBy<Word> { it.rare }
            .thenByDescending(informationScore::getValue)
            .thenBy(Word::text),
    )
}
