# URL Crawler with Redis and MongoDB Integration

Welcome to the URL Crawler project repository! This project is designed to extract and validate product URLs from websites, leveraging Redis and MongoDB for caching and persistence. Below, you'll find detailed information about the project's purpose, setup, architecture, approach for finding product URLs, and usage instructions.

---

## Table of Contents
- [About the Project](#about-the-project)
- [Features](#features)
- [Architecture](#architecture)
- [Approach for Finding Product URLs](#approach-for-finding-product-urls)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## About the Project

The URL Crawler project is a Node.js application built with TypeScript that extracts product URLs from websites using web scraping techniques. It validates URLs for accessibility and caches results using Redis for performance optimization while persisting data in MongoDB for long-term storage.

This tool is particularly useful for e-commerce platforms or aggregators that need to collect product links from various domains efficiently.

---

## Features

- **Web Scraping**: Extracts links from websites using Playwright and Cheerio.
- **URL Validation**: Ensures extracted URLs are valid and accessible.
- **Caching**: Uses Redis for fast retrieval of previously processed URLs.
- **Persistence**: Stores validated URLs in MongoDB for long-term access.
- **Hard Check Option**: Performs deeper validation of URLs if enabled.
- **Scalable Design**: Built with modular services to support future enhancements.

---

### Use of Multiple User Agents, Locales, and Timezones

To enhance the reliability and accuracy of web scraping, the project employs multiple user agents, locales, and timezones. This approach helps mimic real-world browsing behavior and reduces the chances of being blocked by websites.

1. **User Agents**  
   A pool of user agents is used to simulate requests from different devices and browsers, such as:
   - Desktop browsers (e.g., Chrome, Safari, Firefox)
   - Mobile browsers (e.g., iPhone Safari)

   A random user agent is selected for each request to make the scraper appear as a legitimate user.

2. **Locales**  
   Different locales (e.g., `en-US`, `en-GB`, `fr-FR`) are used to simulate browsing from various regions. This ensures compatibility with websites that serve localized content.

3. **Timezones**  
   Random timezones (e.g., `America/New_York`, `Europe/Berlin`, `Asia/Tokyo`) are applied to further diversify the requests and mimic users from different parts of the world.

This combination of user agents, locales, and timezones is implemented in the [`urlExtractor`](src/services/urlService/index.ts) method of the `UrlService` class. It ensures that the scraper behaves more like a real user, improving its effectiveness and reducing the likelihood of detection or blocking.

## Architecture

The project follows a modular architecture pattern:

| Component       | Description                                              |
|------------------|----------------------------------------------------------|
| **Controller**   | Handles incoming HTTP requests and orchestrates services. |
| **Redis Service**| Manages caching operations (get, set, delete) with Redis. |
| **URL Service**  | Handles URL extraction, validation, and filtering logic.  |
| **MongoDB Model**| Defines schema and interacts with MongoDB for persistence.|
| **Routes**       | Defines API endpoints for interacting with the crawler service.|

### High-Level Diagram
```
Client -> Express Router -> Controller -> Services (Redis + URL) -> MongoDB
```

---

## Approach for Finding Product URLs

The project uses a multi-step approach to identify product-related URLs:

1. **URL Extraction**  
    - **Primary method**: Uses Playwright to simulate browser behavior and extract links from the DOM.  
    - **Fallback method**: Uses Cheerio to parse HTML if Playwright fails.

2. **Pattern Matching**  
    Extracted URLs are filtered based on predefined patterns commonly found in e-commerce websites:  
    - Examples: `/products/`, `/items/`, `/shop/`, `categories`, `/collections/`, `/p/`, `/pd/`.

3. **Validation**  
    URLs are validated using HTTP HEAD requests:  
    - Ensures the URL responds with a status code between 200 and 399.  
    - If `hardCheck` is enabled, every URL undergoes additional validation.

4. **Caching & Persistence**  
    - Validated URLs are cached in Redis with a TTL (Time-to-Live) of 24 hours.  
    - URLs are stored in MongoDB for long-term access if not already present.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v16+)
- npm or yarn
- MongoDB (local or cloud instance)
- Redis server

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/url-crawler.git
    cd url-crawler
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Install dependencies:
    ```bash
    npx playwright install --with-deps
    ```

4. Set up environment variables:  
    Create a `.env` file in the root directory with the following:
    ```text
    MONGO_DB_URL=<your-mongodb-url>
    REDIS_HOST=<your-redis-host>
    REDIS_PORT=<your-redis-port>
    REDIS_PASSWORD=<your-redis-password>
    ```

5. Start the application:
    ```bash
    npm run start
    ```

---

## Usage

### Running Locally

Start the server on `http://localhost:3000`. You can interact with the API using tools like Postman or cURL.

#### Example Request (POST `/crawler`)
```json
{
  "urls": ["https://example.com", "https://another-example.com"],
  "hardCheck": true //optional field by default is false
}
```

#### Example Response
```json
{
  "example.com": ["https://example.com/products/item1", "https://example.com/products/item2"],
  "another-example.com": ["https://another-example.com/shop/item3"]
}
```

---

## API Documentation

### Endpoints

#### Health Check (GET `/`)
Returns a simple health check response.

#### Crawl URLs (POST `/crawler`)
Extracts and validates product-related URLs from the provided list of domain URLs.

| Parameter   | Type       | Description                              |
|-------------|------------|------------------------------------------|
| `urls`      | `string[]` | Array of domain URLs to crawl            |
| `hardCheck` | `boolean`  | Optional flag for deeper URL validation  |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
3. Make your changes and commit:
    ```bash
    git commit -m "Add feature"
    ```
4. Push to your fork:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

Feel free to reach out via GitHub Issues or Discussions if you have any questions or suggestions!