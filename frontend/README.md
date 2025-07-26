---
title: Readme
---

# Dev Setup

# Setup

<https://tailwindcss.com/docs/installation/using-vite>

1.  Create project (framework: vanilla, variant: typescript)

    ``` shell
    npm create vite@latest my-project
    ```

2.  Install Tailwind CSS

    ``` shell
    npm install tailwindcss @tailwindcss/vite
    ```

3.  Configure Vite Plugin

    ``` typescript
    # vite.config.ts
    import { defineConfig } from 'vite'
    import tailwindcss from '@tailwindcss/vite'
    export default defineConfig({
      plugins: [
        tailwindcss(),
      ],
    })
    ```

4.  Add `@import` fo CSS file that imports Tailwind css

    ``` css
    @import "tailwindcss";
    ```

# CORS

- Cross-oriring resource sharing

# AI opponent

- don't use A\* algorithm

# Tournament signup flow

    ┌─────────┐  ┌─────────────┐  ┌─────────┐  ┌─────────────┐
    │ Host    │  │ Frontend    │  │ Backend │  │ Database    │
    │ User    │  │             │  │         │  │             │
    └─────────┘  └─────────────┘  └─────────┘  └─────────────┘
         │              │              │              │
         │ 1. Start     │              │              │
         │ Signup Form  │              │              │
         ├─────────────►│              │              │
         │              │              │              │
         │ 2. Add Player│              │              │
         │ (Enter creds)│              │              │
         ├─────────────►│              │              │
         │              │ 3. POST /verify-player      │
         │              │ (JWT + player creds)        │
         │              ├─────────────►│              │
         │              │              │ 4. Verify JWT│
         │              │              ├─────────────►│
         │              │              │◄─────────────┤
         │              │              │ 5. Verify    │
         │              │              │ Player Creds │
         │              │              ├─────────────►│
         │              │              │◄─────────────┤
         │              │ 6. Player    │              │
         │              │ Valid (user  │              │
         │              │ object)      │              │
         │              │◄─────────────┤              │
         │◄─────────────┤              │              │
         │              │              │              │
         │ Repeat steps 2-6 for each additional player │
         │              │              │              │
         │ 7. Submit    │              │              │
         │ Tournament   │              │              │
         ├─────────────►│              │              │
         │              │ 8. POST /tournament         │
         │              │ (JWT + all players)         │
         │              ├─────────────►│              │
         │              │              │ 9. Create    │
         │              │              │ Tournament   │
         │              │              ├─────────────►│
         │              │              │◄─────────────┤
         │              │ 10. Tournament│              │
         │              │ Created      │              │
         │              │◄─────────────┤              │
         │◄─────────────┤              │              │
