package com.project.authservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Full context test requires live PostgreSQL and Eureka infrastructure")
@SpringBootTest
class AuthserviceApplicationTests {

	@Test
	void contextLoads() {
	}

}
