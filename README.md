# Thư Viện Prompt (Prompt Library)

Welcome to the Prompt Library! This is a modern, responsive web application built with React and Vite, designed to explore and copy image generation prompts. It connects to a PocketBase backend in real-time to display a curated gallery of prompts.

![Screenshot of the Prompt Library application](./screenshot.png) <!-- It's recommended to add a screenshot of your app named screenshot.png to the root directory -->

## ✨ Features

- **Real-time Data:** Subscribes to a PocketBase collection to reflect data changes instantly without needing a refresh.
- **Dynamic Filtering:** Filter prompts by categories (Nam, Nữ, Couple, etc.).
- **Pagination:** Efficiently browse through a large number of prompts with customizable page sizes.
- **Responsive Design:** A sleek, mobile-first interface that looks great on all devices, from phones to desktops.
- **Modern UI/UX:** Features a dark theme, smooth animations, skeleton loaders for a better loading experience, and an interactive hover-to-reveal copy button.
- **Copy to Clipboard:** Easily copy any prompt with a single click.
- **Containerized:** Ready for easy deployment with Docker and Docker Compose.

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend Service:** [PocketBase](https://pocketbase.io/)
- **Styling:** CSS with modern features (variables, animations, media queries)
- **Deployment:** [Docker](https://www.docker.com/) & [Caddy Web Server](https://caddyserver.com/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/prompt-library.git
    cd prompt-library
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use). The server supports Hot Module Replacement (HMR) for a fast development experience.

## 🐳 Docker Deployment

The project is fully configured to be built and deployed using Docker.

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker

1.  **Build the Docker image:**
    This command builds the multi-stage Docker image, which first builds the Vite project and then serves the static files using Caddy.
    ```bash
    docker-compose build
    ```

2.  **Run the container:**
    This command starts the container in detached mode.
    ```bash
    docker-compose up -d
    ```

The application will now be running and accessible at **`http://localhost:8000`**.

### Stopping the container

To stop the running container, use:
```bash
docker-compose down
```

## ⚙️ Configuration

The PocketBase backend URL is configured in `src/index.tsx`. If you wish to connect to a different instance, you can change the following constant:

```typescript
// src/index.tsx
const POCKETBASE_URL = 'https://your-pocketbase-url.com';
```
