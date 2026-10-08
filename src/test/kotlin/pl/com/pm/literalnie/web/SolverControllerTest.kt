package pl.com.pm.literalnie.web

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.assertj.MockMvcTester

@SpringBootTest(properties = ["literalnie.dictionary.path=src/test/resources/sgjp-sample.tab"])
@AutoConfigureMockMvc
class SolverControllerTest(@Autowired private val mvc: MockMvcTester) {

    private fun solve(body: String) =
        mvc.post().uri("/api/solve").contentType(MediaType.APPLICATION_JSON).content(body)

    @Test
    fun `returns ranked candidates consistent with the guesses`() {
        val response = solve(
            """
            {
              "length": 5,
              "guesses": [
                { "word": "LALKA", "marks": ["ABSENT", "ABSENT", "ABSENT", "CORRECT", "CORRECT"] }
              ]
            }
            """,
        )

        assertThat(response).hasStatusOk()
        assertThat(response).bodyJson().extractingPath("$.total").isEqualTo(1)
        assertThat(response).bodyJson().extractingPath("$.funnel").isEqualTo(listOf(15, 1))
        assertThat(response).bodyJson().extractingPath("$.words[0].text").isEqualTo("kotka")
        assertThat(response).bodyJson().extractingPath("$.words[0].partsOfSpeech").isEqualTo(listOf("NOUN"))
    }

    @Test
    fun `limits the number of returned words but reports the total`() {
        val response = solve("""{ "length": 5, "limit": 3 }""")

        assertThat(response).hasStatusOk()
        assertThat(response).bodyJson().extractingPath("$.total").isEqualTo(15)
        assertThat(response).bodyJson().extractingPath("$.words.length()").isEqualTo(3)
    }

    @Test
    fun `rejects an inconsistent puzzle with a problem detail`() {
        val response = solve("""{ "length": 5, "guesses": [{ "word": "kot", "marks": ["ABSENT", "ABSENT", "ABSENT"] }] }""")

        assertThat(response).hasStatus(HttpStatus.BAD_REQUEST)
        assertThat(response).bodyJson().extractingPath("$.detail").isEqualTo("Guess 'kot' must have 5 letters")
    }
}
