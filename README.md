# GemUp Admin Dashboard

GemUp is a modern, feature-rich admin dashboard built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. It provides a robust foundation for building data-driven admin panels, dashboards, and management interfaces, with a focus on modularity, scalability, and developer experience.

---

## Project Structure

The project is organized for clarity and scalability. Here is an overview of the main directories and their purposes:

```
gemup-main/
├── public/           # Static assets (images, icons, etc.)
├── src/
│   ├── app/          # Next.js app directory (routing, pages, layouts)
│   ├── components/   # Reusable UI and feature components
│   ├── context/      # React context providers (theme, sidebar, etc.)
│   ├── helpers/      # Constants and static data
│   ├── hooks/        # Custom React hooks
│   ├── icons/        # SVG and image icon components
│   ├── layout/       # Application layout components (header, sidebar, etc.)
│   ├── store/        # Redux Toolkit store, slices, and state management
│   ├── utils/        # Utility functions (API, crypto, cookies, etc.)
│   └── ...           # Other supporting files
├── package.json      # Project dependencies and scripts
├── tailwind.config.js# Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration
└── ...
```

---

## Directory Breakdown

### `public/`
Contains static assets such as images, icons, and branding used throughout the application.

### `src/app/`
- Implements the Next.js App Router.
- Organizes all routes, pages, and layouts (including authentication, error pages, and admin sections).
- Supports nested layouts and server/client components.

### `src/components/`
- Houses all reusable UI components (buttons, modals, tables, charts, forms, etc.).
- Organized by feature or UI type for easy discovery and reuse.

### `src/context/`
- Contains React context providers for global state (e.g., theme, sidebar visibility).
- Used to share state and logic across the app without prop drilling.

### `src/helpers/`
- Stores constants, static data, and configuration arrays (e.g., country lists, pricing tiers).

### `src/hooks/`
- Custom React hooks for encapsulating reusable logic (e.g., authentication status, modal state, navigation helpers).

### `src/icons/`
- SVG and image icon components for consistent iconography across the UI.

### `src/layout/`
- Layout components such as the main header, sidebar, and backdrop.
- Used to compose the overall page structure and navigation.

### `src/store/`
- Redux Toolkit store configuration and slices for state management (user, bookings, proxies, etc.).
- Includes hooks for accessing and dispatching state, and integrates with redux-persist for persistence.

### `src/utils/`
- Utility functions for API requests, authentication cookies, encryption, date formatting, and device ID management.

---

## Key Features
- **Modern Next.js 15 App Router** with server and client components
- **Redux Toolkit** for scalable state management
- **Tailwind CSS v4** for rapid, utility-first styling
- **Authentication** flows and protected routes
- **Reusable UI components**: tables, charts, modals, alerts, avatars, etc.
- **Proxy management** and purchase flows
- **Responsive layouts** and dark mode support

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## License

This project is licensed under the MIT License.

---

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

---

## Contact

For questions or support, please contact the project maintainer.
