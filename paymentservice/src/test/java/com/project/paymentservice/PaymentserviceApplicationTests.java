package com.project.paymentservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Full context test requires live PostgreSQL, Kafka, and Eureka infrastructure")
@SpringBootTest
class PaymentserviceApplicationTests {

	@Test
	void contextLoads() {
	}

}
