package dev.fortheweebs.mico

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MicoApplication

fun main(args: Array<String>) {
    runApplication<MicoApplication>(*args)
}
