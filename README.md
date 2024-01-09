# Node.js Microservice with MySQL and RabbitMQ

This is a simple Node.js microservice using MySQL for data storage and RabbitMQ for event-driven communication.

## Table of Contents

1. [Built With](#built-with)
2. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
3. [Endpoints](#endpoints)
    - [Get All Products](#get-all-products)
    - [Create a Product](#create-a-product)
    - [Like a Product](#like-a-product)
    - [Get a Product by ID](#get-a-product-by-id)
    - [Update a Product](#update-a-product)
    - [Delete a Product](#delete-a-product)

## Built With

- [Express](https://expressjs.com/)
- [TypeORM](https://typeorm.io/)
- [RabbitMQ](https://www.rabbitmq.com/)
- [MySQL](https://www.mysql.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [pnpm](https://pnpm.io/installation)

## Getting Started

### Prerequisites

1. MySQL database
2. MongoDB database
3. RabbitMQ working instance
4. pnpm package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ioneluoooo/Microservices.git
   cd Microservices

2. Install dependencies

   ```bash
   pnpm install

3. Run the application

   ```bash
   pnpm start

## Endpoints

### Get All Products

- **Endpoint:** `GET /api/products`
- **Description:** Get a list of all products.
- **Example Response:**
  ```json
  [
    {
      "id": 1,
      "title": "Product 1",
      "likes": 10
    },
    {
      "id": 2,
      "title": "Product 2",
      "likes": 5
    }
  ]

### Create a Product

- **Endpoint:** `POST /api/products`
- **Description:** Creates a new product.
- **Request Body:**
  ```json
  {
    "title": "New Product"
  }
- **Example Response:**
  ```json
    {
      "id": 3,
      "title": "New Product",
      "likes": 0
    }
    
 ### Like a Product
 
- **Endpoint:** `POST /api/products/:id/like`
- **Description:** Increase the number of likes for a product.
- **Example Response:**
  ```json
  {
  "id": 3,
  "title": "New Product",
  "likes": 1
  }

### Get a Product by ID

- **Endpoint:** `GET /api/products/:id`
- **Description:** Get details of a specific product by ID.
- **Example Response:**
  ```json
  {
    "id": 3,
    "title": "New Product",
    "likes": 1
  }

## Update a Product

- **Endpoint:** `PUT /api/products/:id`
- **Description:** Update details of a specific product by ID.
- **Request Body:**
  ```json
  {
    "title": "Updated Product"
  }
- **Example Response:**
  ```json
  {
  "id": 3,
  "title": "Updated Product",
  "likes": 1
}

### Delete a Product

- **Endpoint:** `DELETE /api/products/:id`
- **Description:** Delete a product by ID.
- **Example Response:**
  ```json
  {
    "affected": 1,
    "raw": null,
    "generatedMaps": [],
    "generatedColumns": []
  }
   
