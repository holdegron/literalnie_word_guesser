package pl.com.pm.literalnie.dictionary

import pl.com.pm.literalnie.dictionary.PartOfSpeech.NOUN
import pl.com.pm.literalnie.dictionary.PartOfSpeech.VERB
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class SgjpTest {
    private val dictionary = loadDictionary(Path.of("src/test/resources/sgjp-sample.tab"))
    private val words = (2..10).flatMap(dictionary::wordsOfLength).associateBy(Word::text)

    @Test
    fun `parses a data line and strips the homonym suffix from the lemma`() {
        assertEquals(
            SgjpEntry(form = "kotem", lemma = "kot", tag = "subst:sg:inst:m1", qualifiers = setOf("pot.", "środ.")),
            parseSgjpLine("kotem\tkot:Sm1\tsubst:sg:inst:m1\tnazwa_pospolita\tpot.,środ."),
        )
    }

    @Test
    fun `ignores the license header`() {
        assertNull(parseSgjpLine("#<COPYRIGHT>"))
        assertNull(parseSgjpLine("Redistribution and use in source and binary forms, with or without"))
    }

    @Test
    fun `keeps only lowercase base forms`() {
        assertEquals(
            setOf(
                "abcug", "absyd", "bawić", "drzwi", "kasza", "kawka", "kotek", "kotka",
                "lalka", "mamut", "palma", "piec", "sokół", "słowo", "zamek", "ładny",
            ),
            words.keys,
        )
    }

    @Test
    fun `merges homonyms into a single word`() {
        assertEquals(setOf(NOUN, VERB), words.getValue("piec").partsOfSpeech)
        assertEquals(setOf("zool."), words.getValue("sokół").qualifiers)
    }

    @Test
    fun `flags words that only have archaic or rare senses`() {
        assertTrue(words.getValue("abcug").rare)
        assertFalse(words.getValue("mamut").rare)
    }

    @Test
    fun `groups words by length`() {
        assertEquals(listOf("piec"), dictionary.wordsOfLength(4).map(Word::text))
        assertEquals(16, dictionary.size)
    }
}
