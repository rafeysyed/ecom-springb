package com.project.userservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Full context test requires live PostgreSQL and Eureka infrastructure")
@SpringBootTest
class UserserviceApplicationTests {

	@Test
	void contextLoads() {
	}

}
