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

- both players use the same keyboard ([5.3.1](#*Remote players (major))
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
  - may use Frontend module
  - override it with [5.8](#*Graphics modules)

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

|                                                       | Major | Minor |
|-------------------------------------------------------|-------|-------|
| Web                                                   |       |       |
| \- Backend Framework (quick win)                      | 1     |       |
| \- Database (quick win)                               |       | 0.5   |
| \- framework/toolkit Frontend (quick win)             | 1     |       |
|                                                       |       |       |
| User Management                                       |       |       |
| \- Standard User Management (quick win)               | 1     |       |
| GamePlay and User experience                          |       |       |
| \- Remote players (major project)                     | 0     |       |
| \- Live Chat (major project)                          | 0     |       |
| Cyber-Security                                        |       |       |
| non-negotiable                                        |       |       |
| \- WAF/ModSecurity/HashiCorp                          | 1     |       |
| \- GDPR                                               |       | 0.5   |
| \- 2FA and JWT                                        | 1     |       |
|                                                       |       |       |
| Devops                                                |       |       |
| \- Designing the Backend as Microservices (quick win) | 1     |       |
| \- Monitoring System                                  |       | 0.5   |
| \- Infrastructure Setup with ELK                      | 1     |       |
| Accessibility                                         |       |       |
| \- Server-Side Rendering                              |       | 0.5   |
| Sum                                                   | 7     | 2\.   |

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

### <span class="todo TODO">TODO</span> Remote players (major)

- players located at seperate computers, playing same Pong game

### WAIT Multiple Players (major)

### <span class="todo TODO">TODO</span> Live Chat (major)

- [ ] send **direct messages** to other users
- [ ] block other users (prevent from seeing further messages for the
  blocked account)
- [ ] invite other users through the chat interface
- [ ] tournament can notify users about next game
- [ ] access other player' profiles through the chat interface

### WAIT another game with user history and matchmaking (major)

### WAIT Game customization options (Minor)

## AI-Algo

### WAIT Introduce AI opponent (major)

### WAIT User and Game stats Dashboards (minor)

- [ ] create user-friendly dashboards with their gaming statistics
- [ ] seperate dashboard for game sessions (statistics, outcomes,
  historical data for each match)
- [ ] ensure intuitive and informative user interface for tracking and
  analyzing the data
- [ ] implement data visualization techniques (charts and graphs)
- [ ] allow users to access and explore their own gaming history and
  performance metrics

## Cyber-Security

### <span class="todo TODO">TODO</span> WAF/ModSecurity/HashiCorp Vault (major)

- [ ] configure and deploy WAF and ModSecurity
- [ ] integrate HashiCorp Vault
  - manage and store sensitive information (APIkeys, credentials,
    environment variables)
  - ensure encryption and isolation

### <span class="todo TODO">TODO</span> GDPR compliance (Minor)

[Legal framework of EU data
protection](https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en)

- [ ] users can request anonymization of personal data
- [ ] provide tools for users to manage their local data
  - view, edit, delete personal information stored in system
- [ ] streamlined process for users to request permanent deletion of
  their account
- [ ] maintain clear and transparent communication with users regarding
  their dta privacy rights, with easily accessible option to exercise
  these rights

### <span class="todo TODO">TODO</span> Two-Factor Authentication (2FA) and JWT (major)

- [ ] 2FA with secondary verification method
- [ ] JWT for authentication
- [ ] user-friendly setup process (options for SMS, authenticatorApss or
  email-based verification)

## Devops

### <span class="todo TODO">TODO</span> Infrastructure Setup with ELK (Elasticsearch/Logstash/Kibana) for Log Management (major)

- [ ] Deploy Elasticsearch to efficiantly store and index log data
  - easily searchable and accessible
- [ ] configure Logstash (collect, process and transform log data from
  various sources, sending it to ES)
- [ ] Setup Kibana (visualizing)
- [ ] define retention and archiving policies to manage log data storage
  effectively
- [ ] implement security measures to protect log data and access to the
  EL stack components

### <span class="todo TODO">TODO</span> Monitoring System (Minor)

- [ ] Deploy Prometheus as the monitoring and alreting toolkit
  - monitor health and performance
- [ ] configure data exprters and integrations to capture metrics from
  different services, databases, and infrastructure components
- [ ] create custom dashboards and visualizations using **Grafana** to
  providde real-time insights into system metrics and performance
- [ ] ensure proper data retention and storage strategies for historical
  metrics data
- [ ] implement secure authentication and access control mechanisms for
  **Grafana** to protect sensitive monitoring data

### <span class="todo TODO">TODO</span> Designing the Backend as Microservices

- [ ] divide backend into smaller loosely-coupled microservices
  - responsible for specific functions or features
- [ ] define clear boundaries and interfaces between microservices
  - enable independent developement, deployment and scaling
- [ ] implement communication mechnisms between microservices
  - RESTful APIs or message queues
- [ ] ensure that each microservice is responsible for a single,
  well-defined task or business capability

## Graphics

## Graphics modules

### Implementing advanced 3D Techniques (major)

## Accessibility

### Support on all devices (minor)

### Expanding browser Compatibility (minor)

### Multiple language support (minor)

### Add accessibility for Visually impaired Users (minor)

### Server-Side Rendering (minor)

## Server-Side Pong

### Replace Basic Pong with Server-Side Pong (Major)

# Bonus

- Five points will be avarded for each minor module
- ten points will be awarded for each major module
- therefore 2.5 points would be 125
