# Enterprise-Grade Event-Driven E-Commerce Backend

A backend e-commerce system built using **Spring Boot Microservices** to demonstrate event-driven architecture, distributed transactions, authentication, caching, resilience, containerization and Kubernetes deployment.

The project was developed as a hands-on implementation of modern microservices concepts including **Choreography-based Saga Pattern** and **Transactional Outbox Pattern**.

---

## 🚀 Tech Stack

- Java 17
- Spring Boot
- Spring Cloud
- Spring Cloud Gateway
- Netflix Eureka
- OpenFeign
- Apache Kafka
- PostgreSQL
- Redis
- Spring Security
- JWT
- BCrypt
- Resilience4j
- Zipkin
- Docker
- Docker Compose
- Kubernetes
- Maven

---

## 🏗️ Microservices

| Service | Responsibility |
|---|---|
| **API Gateway** | Request routing, JWT validation, authorization and gateway security |
| **Service Discovery** | Eureka-based service registration and discovery |
| **User Service** | User registration and user management |
| **Auth Service** | Authentication, password hashing, roles and JWT generation |
| **Product Service** | Product management and Redis caching |
| **Order Service** | Order creation, order management and Kafka events |
| **Payment Service** | Payment processing and transactional outbox |
| **Kafka** | Asynchronous event communication |
| **Redis** | Product caching |
| **Zipkin** | Distributed tracing |

---

## 🔄 Architecture

```text
                         Client
                           |
                           v
                    +--------------+
                    | API Gateway  |
                    +------+-------+
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
    User Service     Product Service    Auth Service
          |                |                |
          |              Redis              |
          |                                 |
          +----------------+----------------+
                           |
                           v
                    +--------------+
                    | Order Service|
                    +------+-------+
                           |
                    OrderCreatedEvent
                           |
                           v
                       +-------+
                       | Kafka |
                       +---+---+
                           |
                           v
                   +---------------+
                   |Payment Service|
                   +-------+-------+
                           |
                    Transactional
                       Outbox
                           |
                           v
                         Kafka
                           |
             +-------------+-------------+
             |                           |
             v                           v
    payment-completed             payment-failed
             |                           |
             +-------------+-------------+
                           |
                           v
                    Order Service
                           |
                    Update Order Status



Registration Flow:

Client
  |
  v
API Gateway
  |
  v
User Service
  |
  +----> Save User
  |
  +----> Auth Service
            |
            +----> BCrypt Password Hash
            |
            +----> Create Credentials


Login Flow:

Client
  |
  v
API Gateway
  |
  v
Auth Service
  |
  +----> User Service
  |          |
  |          +----> Find User
  |
  +----> Verify BCrypt Password
  |
  +----> Generate JWT
  |
  v
Client


Saga Pattern:

1. Client creates order
        |
        v
2. Order Service saves order
        |
        v
3. OrderCreatedEvent
        |
        v
4. Kafka
        |
        v
5. Payment Service processes payment
        |
        +----------------------+
        |                      |
        v                      v
 payment-completed       payment-failed
        |                      |
        +----------+-----------+
                   |
                   v
             Order Service
                   |
             Update Status
              /          \
             v            v
           PAID         FAILED


Transactional Outbox Pattern:

Payment Service
      |
      +---- Save Payment
      |
      +---- Save Outbox Event
                    |
                    v
              PostgreSQL
                    |
                    v
             Outbox Publisher
                    |
                    v
                  Kafka


Idempotent Event Processing:

Kafka Event
    |
    v
Check ProcessedEvent
    |
    +---- Already processed --> Ignore
    |
    +---- New event ---------> Process
                                  |
                                  v
                         Save ProcessedEvent


Kafka Retry & Dead Letter Topic:

Kafka Event
    |
    v
Attempt 1
    |
    v
Attempt 2
    |
    v
Attempt 3
    |
    v
   DLT


Project Structure:

springboot-microservices-saga/
│
├── authservice/
├── gatewayservice/
├── orderservice/
├── paymentservice/
├── productservice/
├── servicediscovery/
├── userservice/
│
├── k8s/
│   ├── auth-service.yaml
│   ├── eureka.yaml
│   ├── gateway.yaml
│   ├── kafka.yaml
│   ├── order.yaml
│   ├── product-deployment.yaml
│   ├── product-service.yaml
│   ├── redis.yaml
│   ├── user-service.yaml
│   └── zookeeper.yaml
│
├── docker-compose.yml
├── .gitignore
└── README.md

