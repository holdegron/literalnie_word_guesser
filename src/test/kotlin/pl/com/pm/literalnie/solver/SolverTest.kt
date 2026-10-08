package pl.com.pm.literalnie.solver

import pl.com.pm.literalnie.dictionary.Dictionary
import pl.com.pm.literalnie.dictionary.PartOfSpeech.NOUN
import pl.com.pm.literalnie.dictionary.Word
import pl.com.pm.literalnie.solver.Mark.ABSENT
import pl.com.pm.literalnie.solver.Mark.CORRECT
import pl.com.pm.literalnie.solver.Mark.PRESENT
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class SolverTest {

    private fun word(text: String, rare: Boolean = false) = Word(text, setOf(NOUN), emptySet(), rare)

    private val dictionary = Dictionary(
        listOf("kotek", "kotka", "kawka", "lalka", "palma", "sokół", "słowo", "zamek").map(::word),
    )

    @Test
    fun `without guesses every word of the given length is a candidate`() {
        assertEquals(8, dictionary.solve(Puzzle(length = 5)).candidates.size)
        assertEquals(Solution(emptyList(), listOf(0)), dictionary.solve(Puzzle(length = 6)))
    }

    @Test
    fun `keeps only words consistent with every guess`() {
        val puzzle = Puzzle(
            length = 5,
            guesses = listOf(
                Guess("lalka", listOf(ABSENT, ABSENT, ABSENT, CORRECT, CORRECT)),
                Guess("kotek", listOf(CORRECT, CORRECT, CORRECT, ABSENT, PRESENT)),
            ),
        )

        val solution = dictionary.solve(puzzle)

        assertEquals(listOf("kotka"), solution.candidates.map(Word::text))
        assertEquals(listOf(8, 1, 1), solution.funnel)
    }

    @Test
    fun `ranks words covering the most common letters first and rare words last`() {
        val ranked = listOf(word("kotka", rare = true), word("zzzzz"), word("kawka"), word("lalka")).rankedForNextGuess()

        assertEquals(listOf("kawka", "lalka", "zzzzz", "kotka"), ranked.map(Word::text))
    }

    @Test
    fun `rejects guesses that do not fit the puzzle`() {
        assertFailsWith<IllegalArgumentException> { Puzzle(5, listOf(Guess("kot", List(3) { ABSENT }))) }
        assertFailsWith<IllegalArgumentException> { Guess("KOTEK", List(5) { ABSENT }) }
        assertFailsWith<IllegalArgumentException> { Guess("kotek", List(4) { ABSENT }) }
        assertFailsWith<IllegalArgumentException> { Puzzle(length = 1) }
    }
}
