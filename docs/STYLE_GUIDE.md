# Graphite Style Guide

This guide ensures visual and structural consistency across the Graphite platform.

## 1. Typography

- **Primary Font:** Poppins (Sans-serif).
- **Headings:** Bold tracking-tight.
- **Body:** Normal tracking-normal.

## 2. Color System (Semantic Tokens)

We use a themed system based on Catppuccin. **Never use hardcoded hex values in components.**

| Token         | Usage                                                     |
| :------------ | :-------------------------------------------------------- |
| `primary`     | Primary actions, links, brand elements.                   |
| `secondary`   | Secondary actions, badges, subtle backgrounds.            |
| `muted`       | Non-essential text, decorative borders, scrollbar thumbs. |
| `accent`      | Highlighting specific areas.                              |
| `destructive` | Errors, delete actions, warnings.                         |
| `background`  | Main page background.                                     |
| `foreground`  | Primary text color.                                       |
| `glow`        | Animated pulse effects (e.g., CTA buttons).               |

## 3. Standard Layouts

- **Tool Layout:** Header + Sidebar (left) + Content (right). Used for Graph and SVG tools.
- **Marketing Layout:** Full-width sections with standard padding (`section-container`).

## 4. Components & Naming

- **File Naming:** PascalCase for components (`GraphPage.tsx`).
- **Exporting:** Use named exports for UI components, default exports for Pages/Routes.
- **Props:** Always define an `interface` for component props.

## 5. Animation Patterns

- **Standard Entrance:** `animate-fade-in` (slide up + fade).
- **Sidebar Entrance:** `slide-in-from-left`.
- **Docs Entrance:** `slide-in-from-right`.
- **Interactive:** `hover-zoom` for cards and images.

## 6. Iconography

- **Library:** Lucide React.
- **Stroke Width:** 2px (default).
- **Sizes:**
  - Standard Button: `w-4 h-4`.
  - Feature Icon: `w-6 h-6`.
  - Large Hero Icon: `w-10 h-10`.
