package pl.com.pm.literalnie.dictionary

import org.slf4j.LoggerFactory
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.nio.file.Path
import kotlin.time.measureTimedValue

@ConfigurationProperties("literalnie.dictionary")
data class DictionaryProperties(val path: Path)

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(DictionaryProperties::class)
class DictionaryConfiguration {

    private val log = LoggerFactory.getLogger(javaClass)

    @Bean
    fun dictionary(properties: DictionaryProperties): Dictionary {
        val (dictionary, duration) = measureTimedValue { loadDictionary(properties.path) }
        log.info("Loaded {} words from {} in {}", dictionary.size, properties.path, duration)
        return dictionary
    }
}
