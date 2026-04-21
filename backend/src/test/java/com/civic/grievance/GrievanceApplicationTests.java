package com.civic.grievance;

import com.civic.grievance.config.TestSecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * Spring context load test.
 * Verifies the entire application context starts without errors.
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
class GrievanceApplicationTests {

    @Test
    @DisplayName("Spring context loads successfully")
    void contextLoads() {
        // If this passes, all beans are wired correctly
    }
}