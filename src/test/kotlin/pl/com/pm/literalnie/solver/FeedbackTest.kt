package pl.com.pm.literalnie.solver

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import pl.com.pm.literalnie.solver.Mark.ABSENT
import pl.com.pm.literalnie.solver.Mark.CORRECT
import pl.com.pm.literalnie.solver.Mark.PRESENT
import kotlin.test.assertEquals

class FeedbackTest {

    @Test
    fun `marks every letter green when the guess is the answer`() {
        assertEquals(List(5) { CORRECT }, feedback("kotek", "kotek"))
    }

    @Test
    fun `marks letters missing from the answer grey`() {
        assertEquals(List(5) { ABSENT }, feedback("bawić", "kotek"))
    }

    @Test
    fun `marks letters in the wrong position yellow`() {
        assertEquals(listOf(PRESENT, CORRECT, PRESENT, CORRECT), feedback("kasa", "saka"))
    }

    @Test
    fun `repeated guess letter is grey once the answer has no more of it`() {
        assertEquals(listOf(ABSENT, CORRECT, CORRECT, ABSENT, PRESENT), feedback("kokos", "sokół"))
    }

    @Test
    fun `green match takes precedence over an earlier yellow for the same letter`() {
        assertEquals(listOf(ABSENT, CORRECT, CORRECT, ABSENT, CORRECT), feedback("lalka", "palma"))
    }

    @Test
    fun `yellow is handed out left to right`() {
        assertEquals(listOf(ABSENT, CORRECT, CORRECT, ABSENT, PRESENT), feedback("mamut", "tamta"))
    }

    @Test
    fun `rejects words of different length`() {
        assertThrows<IllegalArgumentException> { feedback("kot", "kotek") }
    }
}
