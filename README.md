<div align="center">
  <img src="src/logos/smartwater-bgi-planer-logo.svg" alt="Smartwater BGI Planer Logo" width="300" />
</div>

<br>
<br>

![](https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F-at%20Technologiestiftung%20Berlin-blue)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Smartwater BGI Planer

Frontend application for the Smartwater BGI Planer project - TBD.

## Overview

TDB...

**Key Features:**

- TBD

## Tech Stack

- **Framework**: Next.js 15.2.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **Mapping**: OpenLayers (ol) with MapTiler integration
- **State Management**: Zustand
- **Deployment**: Docker with GitHub Actions

## Prerequisites

- Node.js >= 18
- npm or similar package manager
- Docker (for containerized deployment)

## Installation

### Local Development Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/technologiestiftung/smartwater-bgi-planer
   cd smartwater-bgi-planer
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env.local` file with the required environment variables:

   ```bash
   NEXT_PUBLIC_XXXX=XXX
   ```

## Running the Project

To start a local development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Other Development Commands

```bash
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:fix   # Auto-fix formatting issues
```

## Docker Deployment

### Building the Docker Image

```bash
docker build -t smartwater-bgi-planer .
```

### Running with Docker

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_XXXX=XXXX \
  smartwater-bgi-planer
```

## Architecture

### Project Structure

```
TBD
```

### Key Components

- **Map Component**: OpenLayers-based interactive map with custom styling

### State Management

The application uses Zustand for state management with separate stores for:

- **App State**: General application state and UI preferences

## Development

### Code Standards

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Extended Next.js configuration with custom rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for code quality

### Adding New Features

1. Create feature branch from `dev`
2. Implement changes with proper TypeScript typing
3. Add translations for new text content
4. Test locally and ensure Docker build works
5. Create pull request to `dev` branch

### Environment Variables

The application supports different environment configurations:

**Build-time Variables** (must start with `NEXT_PUBLIC_`):

- `NEXT_PUBLIC_XXXXX`

**Runtime Variables** (server-side only):

- `XXXXXX` (if needed for server actions)

## Contributing

Before you create a pull request, write an issue so we can discuss your changes.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <a href="https://github.com/LuiseBrandenburger">
          <img src="https://avatars.githubusercontent.com/u/61413319?v=4?s=64" width="64px;" alt="Luise Brandenburger"/>
          <br />
          <sub text-decoration="none">
            <b>Luise Brandenburger</b>
          </sub>
        </a>
        <br />
       <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/commits?author=LuiseBrandenburger" title="Code">💻</a> 
        <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/commits?author=LuiseBrandenburger&path=docs" title="Documentation">📖</a>
        <a title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> 
        <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/pulls?q=is%3Apr+reviewed-by%3ALuiseBrandenburger" title="Reviewed Pull Requests">👀</a>
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/JonathanHaudenschild">
          <img src="https://avatars.githubusercontent.com/u/15103380?v=4?s=64" width="64px;" alt="Jonathan Haudenschild"/>
          <br />
          <sub text-decoration="none">
            <b>Jonathan Haudenschild</b>
          </sub>
        </a>
        <br />
        <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/commits?author=JonathanHaudenschild" title="Code">💻</a> 
        <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/commits?author=JonathanHaudenschild&path=docs" title="Documentation">📖</a>
        <a title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> 
        <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/pulls?q=is%3Apr+reviewed-by%3AJonathanHaudenschild" title="Reviewed Pull Requests">👀</a>
      </td>
      <!--  -->
      <!--  -->
      <!--  -->
      <!--  -->
      <!--  -->
      <!--  -->
      <td align="center" valign="top">
        <a href="https://github.com/guadiromero">
          <img src="https://avatars.githubusercontent.com/u/32439356?v=4" width="64px;" alt="Guadalupe Romero"/>
          <br />
          <sub text-decoration="none">
            <b>Guadalupe Romero</b>
          </sub>
        </a>
        <br />
        <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/commits?author=guadiromero" title="Code">💻</a> 
        <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/commits?author=guadiromero&path=docs" title="Documentation">📖</a>
        <a title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> 
        <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/pulls?q=is%3Apr+reviewed-by%3Aguadiromero" title="Reviewed Pull Requests">👀</a>
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/JS-TSB">
        <img src="https://avatars.githubusercontent.com/u/185074060?v=4" width="64px;" alt="Jakob Sawal"/>
        <br />
        <sub text-decoration="none">
          <b>Jakob Sawal</b>
        </sub>
      </a>
      <br />
      <a title="Design">🎨</a> 
      <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/commits?author=JS-TSB" title="Code">💻</a> 
      <a href="https://github.com/technologiestiftung/smartwater-bgi-planer/pulls?q=is%3Apr+reviewed-by%3AJS-TSB" title="Reviewed Pull Requests">👀</a>
    </tr>
  </tbody>
</table>

<!-- <a href="#design-LuiseBrandenburger" title="Design">🎨</a> -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Content Licensing

Texts and content available as [CC BY](https://creativecommons.org/licenses/by/3.0/de/).

## Credits

© 2025 - TBD

<table>
  <tr>
    <td align="center">
      <strong>Technische Umsetzung</strong><br />
      <a href="https://www.technologiestiftung-berlin.de/">
        <img width="120" src="src/logos/technologiestiftung.svg" alt="Technologiestiftung Berlin" />
      </a>
    </td>
  </tr>
</table>
