package pl.com.pm.literalnie.solver

import pl.com.pm.literalnie.dictionary.Dictionary
import pl.com.pm.literalnie.dictionary.Word

data class Solution(val candidates: List<Word>, val funnel: List<Int>)

fun Dictionary.solve(puzzle: Puzzle): Solution {
    val pools = puzzle.clues.runningFold(wordsOfLength(puzzle.length)) { pool, clue ->
        pool.filter { clue.admits(it.text) }
    }
    return Solution(candidates = pools.last().rankedForNextGuess(), funnel = pools.map { it.size })
}

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
