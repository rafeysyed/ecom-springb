package com.project.orderservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.EnableKafkaRetryTopic;

@EnableKafka
@EnableKafkaRetryTopic
@EnableFeignClients
@SpringBootApplication
public class OrderserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderserviceApplication.class, args);
	}

}

//Built an event-driven microservices-based e-commerce backend system.

//• Designed 6+ microservices (User, Order, Payment, Inventory, Notification)
//• Implemented asynchronous communication using Apache Kafka
//• Developed REST APIs using Spring Boot
//• Implemented API Gateway using Spring Cloud Gateway
//• Service discovery using Netflix Eureka
//• Containerized microservices using Docker
//• Used PostgreSQL with Spring Data JPA
