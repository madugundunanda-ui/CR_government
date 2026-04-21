package com.civic.grievance.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.mockito.Mockito;

@TestConfiguration
public class TestSecurityConfig {

    /** Mock JavaMailSender so tests don't need a real SMTP server. */
    @Bean
    public JavaMailSender javaMailSender() {
        return Mockito.mock(JavaMailSender.class);
    }
}