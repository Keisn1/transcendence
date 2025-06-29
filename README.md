# In exclamation boxes

- [ ] the use of a small library or tool that solves a simple, unique
  task representing a subcomponent of a larger feature or module, is
  <u>allowed</u>
- [ ] need to justify any use of library/tool which is not
  **explicitly** approved by the project and not in contradiction with
  the project's constraints
- [ ] evaluator will determine whether the use of a specific library or
  tool is legitimate or essentially solves an entire feature/module

# 🪓 Minimal technical requirements

- single-page application
- stable with latest up-to-date version of *Mozilla Firefox*
- no unhandled errors or warnings when browsing the website
- must use Docker to run website

## Backend

- If not pure PHP, then Framework module
- If Backend Framework, then Database module

## Frontend

- If not Typescript, then Frontend Module

## Container deployment

1.  **Locating runtime in /goinfre or /sgoinfre**:
    - probably means to have images in /goinfre, /sgoinfre (configure
      Docker)
2.  Bind-mount volumes
    - Example: `docker run -v /host/path:/container/path my-image`
    - feature is not available if the container uses non-root user IDs,
      due to permission issues in rootless mode
3.  Crafting image with root as unique UID:
    - Creating a custom container image where all processes run as the
      root user (UID 0)
    - suggested as a workaround for the bind-mount limitation, as
      root-owned files in the container can still be accessible
    - raises security issues

# 🏓 Game

- both players use the same keyboard ([5.6](#Remote Players module)
  enhances that)
  - same rules for everyong
    - identical paddle speed
    - applies also to AI
- 1v1 and **tournament** system must clearly display
  - who plays against who
  - the order of playing
  - must work with or without user registration
    - without [5.2.1](#*Standard User Management (major)):
      - users input alias
    - with [5.2.1](#*Standard User Management (major)):
      - aliases are linked to registerd accounts
      - allows persistent stats and friend lists
  - **Matchmaking system**
    - organize matchmaking
    - announce the next match
- **Registration system**
  1.  each player needs to input their alias
      - in default version, users enter an alias manually
  2.  Aliases are reset at the start of a *new* tournament
      - can be altered by [5.2.1](#*Standard User Management (major)):
- must adhere to Frontend constraints
  - may use [5.4](#*Frontend module)
  - override it with [5.5](#*Graphics modules)

# Security concerns

- [ ] any credentials in .env file
- [ ] any password must be hashed
  - [ ] use strong password hashing algorithm
- [ ] website must be protected agains SQL injections/XSS attacks
- [ ] if backend, then enable HTTPS connections for all aspects
  - [ ] WebSocketSecure (wss) instead of WebSocket (ws)
- [ ] validation mechanisms on forms either
  - [ ] on base page (no backend)
  - [ ] server side (with backend)
- [ ] ensure routes are protected (regardless of implementing JWT w/wo
  2FA)
  - [ ] Authentication checks: authenticate means verifying identity of
    user
  - [ ] Authorization checks: ensure users have appropriate permissions
  - [ ] Role-based access controls: Restrict routes based on user roles
  - [ ] Middleware implementations: security checks performed before the
    route handlers

# Modules

- 2 minor moduls count as one major module
- 100% project completion = 7 major modules
- Counter:
  - 3.5

## Web

### <span class="todo TODO">TODO</span> framework for backend (major)

- use **fastify** with **Node.js**

### <span class="todo TODO">TODO</span> database for backend (minor)

- use **SQLLite** DB instances

### <span class="todo TODO">TODO</span> framework/toolkit for frontend (minor)

- use **TailwindCSS** in addition to **typescript**

### KILL Store score of tournament in the Blockchain (major)

## User Management

### <span class="todo TODO">TODO</span> Standard User Management (major)

- extends the tournament logic (does not replace it)
- [ ] securely subscribe to the website
- [ ] securely log in
- [ ] select unique display name to participate in tournaments
- [ ] can update their information
- [ ] can upload an avatar (with default option)
- [ ] can add others as friends
  - [ ] can view online status of friends
    - !!! Need to take care of this (authorization) !!!
- [ ] profile displays stats (such as wins and losses)
- [ ] Match history
  - 1v1 games, dates, relevant details
  - accessible to logged-in users
- [ ] manage duplication of usernames/emails

### WAIT Remote authentication (major)

- implement Google Sign-in
  - [ ] integrate authentication system
  - [ ] obtain necessary credentials and permissions from the authority
  - [ ] implement user-friendly login and authorization flows
    - need to adhere to best practices and security standards (need to
      read up on that)
  - [ ] ensure secure exchange of authentication tokens and user
    information between web application and authentication provider

## Gameplay and user experience

### Remote players

## Frontend module

## Graphics modules

## Remote Players Module
