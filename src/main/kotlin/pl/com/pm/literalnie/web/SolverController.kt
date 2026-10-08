package pl.com.pm.literalnie.web

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import pl.com.pm.literalnie.dictionary.Dictionary
import pl.com.pm.literalnie.dictionary.Word
import pl.com.pm.literalnie.solver.Guess
import pl.com.pm.literalnie.solver.Mark
import pl.com.pm.literalnie.solver.Puzzle
import pl.com.pm.literalnie.solver.solve

data class GuessRequest(val word: String, val marks: List<Mark>)

data class SolveRequest(
    val length: Int,
    val guesses: List<GuessRequest> = emptyList(),
    val limit: Int = DEFAULT_LIMIT,
) {
    fun toPuzzle(): Puzzle = Puzzle(length, guesses.map { Guess(it.word.lowercase(), it.marks) })

    companion object {
        const val DEFAULT_LIMIT = 200
        const val MAX_LIMIT = 5_000
    }
}

data class SolveResponse(val total: Int, val funnel: List<Int>, val words: List<Word>)

@RestController
@RequestMapping("/api")
class SolverController(private val dictionary: Dictionary) {

    @PostMapping("/solve")
    fun solve(@RequestBody request: SolveRequest): SolveResponse {
        val (candidates, funnel) = dictionary.solve(request.toPuzzleOrBadRequest())
        return SolveResponse(
            total = candidates.size,
            funnel = funnel,
            words = candidates.take(request.limit.coerceIn(1, SolveRequest.MAX_LIMIT)),
        )
    }

    private fun SolveRequest.toPuzzleOrBadRequest(): Puzzle =
        try {
            toPuzzle()
        } catch (e: IllegalArgumentException) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, e.message, e)
        }
}
