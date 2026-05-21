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
[2026-05-04 11:45:00] infra: AddFullDomainModel migration
[2026-05-05 10:05:00] api: CoursesController - CRUD courses
[2026-05-05 12:30:00] infra: AddActivityStatusAndAssistantApps migration
[2026-05-06 09:50:00] api: TeamManagementController - CRUD teams
[2026-05-06 12:00:00] infra: TeachingSetupService - create activities
[2026-05-07 10:25:00] api: TeachingController - lecture management
[2026-05-07 13:40:00] infra: GroupActivityService - help queue logic
[2026-05-08 09:30:00] api: AssistantSessionController - session flow
[2026-05-08 11:55:00] infra: NotificationService - store notifications
[2026-05-12 10:10:00] api: ControlPointController - KT endpoints
[2026-05-12 12:40:00] infra: ControlPointService - KT queue logic
[2026-05-13 09:45:00] api: ScoringController - scores CRUD
[2026-05-13 12:10:00] infra: ScoringService - activity score calculation
[2026-05-14 10:30:00] api: StudentActivitiesController - student view
[2026-05-14 13:00:00] infra: TeamGenerationService - auto team split
[2026-05-15 09:55:00] api: HomeworkController - homework submission
[2026-05-15 12:25:00] infra: HomeworkService - submission and queue logic
[2026-05-19 10:40:00] api: AdminController - user management
[2026-05-19 13:05:00] infra: CourseTemplateService - save/load templates
[2026-05-20 09:20:00] api: NotificationsController - read/unread
[2026-05-20 11:50:00] infra: SignalR hub stub, IRealtimePushService
[2026-05-21 10:15:00] api: CourseTemplatesController - template CRUD
