package com.cardealership;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test to verify the Spring application context loads successfully.
 */
@SpringBootTest
@ActiveProfiles("test")
class CarDealershipApplicationTests {

	@Test
	void contextLoads() {
		// Verifies that the Spring application context starts without errors
	}
}
