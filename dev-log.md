# ScoreHub Backend Dev Log
[2026-04-24 10:12:00] init: project scaffold, solution structure
[2026-04-24 11:30:00] init: add .gitignore, README, Dockerfile stub
[2026-04-24 14:05:00] domain: add User entity and UserRole enum
[2026-04-25 09:40:00] domain: add Course, Module, Activity entities
[2026-04-25 11:15:00] domain: add Team, TeamMember, TaskItem entities
[2026-04-28 10:00:00] infra: EF Core setup, ScoreHubDbContext
[2026-04-28 12:20:00] infra: JWT service implementation
[2026-04-29 09:25:00] api: AuthController - register/login endpoints
[2026-04-29 11:40:00] infra: password hashing with BCrypt
[2026-04-30 10:35:00] infra: initial EF migration, database seed
[2026-04-30 13:15:00] api: Program.cs - DI, JWT middleware, CORS
[2026-05-04 09:10:00] domain: add AssistantApplication, TaskSubmission
