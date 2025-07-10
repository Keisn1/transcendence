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
