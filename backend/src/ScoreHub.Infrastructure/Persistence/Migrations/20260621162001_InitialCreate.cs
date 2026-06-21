using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoreHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    AcademicYear = table.Column<string>(type: "text", nullable: false),
                    KtMultiplierMapJson = table.Column<string>(type: "text", nullable: false),
                    FinalGradingTableJson = table.Column<string>(type: "text", nullable: false),
                    InviteCode = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CourseTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GradeOverrides",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    CellKey = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<decimal>(type: "numeric", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GradeOverrides", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Modules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    StartsAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndsAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Modules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Modules_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModuleTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    StartsAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    EndsAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModuleTemplates_CourseTemplates_CourseTemplateId",
                        column: x => x.CourseTemplateId,
                        principalTable: "CourseTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseEnrollments",
                columns: table => new
                {
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnrolledAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseEnrollments", x => new { x.CourseId, x.UserId });
                    table.ForeignKey(
                        name: "FK_CourseEnrollments_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseEnrollments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipientId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Body = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ReadAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_RecipientId",
                        column: x => x.RecipientId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentActivityScores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleNumber = table.Column<int>(type: "integer", nullable: false),
                    LecturePoints = table.Column<decimal>(type: "numeric", nullable: false),
                    HomeworkPoints = table.Column<decimal>(type: "numeric", nullable: false),
                    KtMultiplier = table.Column<decimal>(type: "numeric", nullable: false),
                    ModuleScore = table.Column<decimal>(type: "numeric", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentActivityScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentActivityScores_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentActivityScores_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeamSwapLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentAId = table.Column<Guid>(type: "uuid", nullable: false),
                    TeamAId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentBId = table.Column<Guid>(type: "uuid", nullable: false),
                    TeamBId = table.Column<Guid>(type: "uuid", nullable: false),
                    InitiatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamSwapLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeamSwapLogs_Users_InitiatedByUserId",
                        column: x => x.InitiatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TeamSwapLogs_Users_StudentAId",
                        column: x => x.StudentAId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TeamSwapLogs_Users_StudentBId",
                        column: x => x.StudentBId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Activities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    StartsAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndsAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PreLectureVideoUrl = table.Column<string>(type: "text", nullable: true),
                    LectureBasePoints = table.Column<decimal>(type: "numeric", nullable: false),
                    MiniTestMaxBonus = table.Column<decimal>(type: "numeric", nullable: false),
                    MiniTestDurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    MiniTestPublished = table.Column<bool>(type: "boolean", nullable: false),
                    MiniTestOpenedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    TaskFileUrl = table.Column<string>(type: "text", nullable: true),
                    TheoryTestUrl = table.Column<string>(type: "text", nullable: true),
                    TaskCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Activities_Modules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "Modules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ActivityTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    TaskFileUrl = table.Column<string>(type: "text", nullable: true),
                    TheoryTestUrl = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityTemplates_ModuleTemplates_ModuleTemplateId",
                        column: x => x.ModuleTemplateId,
                        principalTable: "ModuleTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ActivityAssistants",
                columns: table => new
                {
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssistantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityAssistants", x => new { x.ActivityId, x.AssistantId });
                    table.ForeignKey(
                        name: "FK_ActivityAssistants_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ActivityAssistants_Users_AssistantId",
                        column: x => x.AssistantId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AssistantApplications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssistantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
                    AppliedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssistantApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssistantApplications_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssistantApplications_Users_AssistantId",
                        column: x => x.AssistantId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MiniTestQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    OptionsJson = table.Column<string>(type: "text", nullable: false),
                    CorrectOptionIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MiniTestQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MiniTestQuestions_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskSets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Published = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskSets_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Teams_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Points = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskTemplates_ActivityTemplates_ActivityTemplateId",
                        column: x => x.ActivityTemplateId,
                        principalTable: "ActivityTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MiniTestAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    SelectedOptionIndex = table.Column<int>(type: "integer", nullable: false),
                    AnsweredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    BonusAwarded = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MiniTestAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MiniTestAnswers_MiniTestQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "MiniTestQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MiniTestAnswers_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TaskItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskSetId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Statement = table.Column<string>(type: "text", nullable: true),
                    Points = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskItems_TaskSets_TaskSetId",
                        column: x => x.TaskSetId,
                        principalTable: "TaskSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeamAssistants",
                columns: table => new
                {
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssistantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamAssistants", x => new { x.TeamId, x.AssistantId });
                    table.ForeignKey(
                        name: "FK_TeamAssistants_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeamAssistants_Users_AssistantId",
                        column: x => x.AssistantId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeamGroupScores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    TasksAccepted = table.Column<int>(type: "integer", nullable: false),
                    TasksTotal = table.Column<int>(type: "integer", nullable: false),
                    BasePoints = table.Column<decimal>(type: "numeric", nullable: false),
                    GroupCoefficient = table.Column<decimal>(type: "numeric", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamGroupScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeamGroupScores_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeamGroupScores_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeamHelpRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamHelpRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeamHelpRequests_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeamHelpRequests_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeamMembers",
                columns: table => new
                {
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    JoinedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsAbsent = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamMembers", x => new { x.TeamId, x.UserId });
                    table.ForeignKey(
                        name: "FK_TeamMembers_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeamMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HomeworkSubmissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentUrl = table.Column<string>(type: "text", nullable: false),
                    SubmittedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReviewerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewStartedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Result01 = table.Column<int>(type: "integer", nullable: true),
                    TimeCoefficient = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeworkSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeworkSubmissions_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HomeworkSubmissions_TaskItems_TaskItemId",
                        column: x => x.TaskItemId,
                        principalTable: "TaskItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HomeworkSubmissions_Users_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TaskAssistants",
                columns: table => new
                {
                    TaskItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssistantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskAssistants", x => new { x.TaskItemId, x.AssistantId });
                    table.ForeignKey(
                        name: "FK_TaskAssistants_TaskItems_TaskItemId",
                        column: x => x.TaskItemId,
                        principalTable: "TaskItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskAssistants_Users_AssistantId",
                        column: x => x.AssistantId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TaskSubmissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: true),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ReadyAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReviewerId = table.Column<Guid>(type: "uuid", nullable: true),
                    DefenderUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Result01 = table.Column<int>(type: "integer", nullable: true),
                    DefenderCoefficient = table.Column<decimal>(type: "numeric", nullable: true),
                    SolutionUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskSubmissions_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskSubmissions_TaskItems_TaskItemId",
                        column: x => x.TaskItemId,
                        principalTable: "TaskItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskSubmissions_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TaskSubmissions_Users_DefenderUserId",
                        column: x => x.DefenderUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TaskSubmissions_Users_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TaskSubmissions_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HomeworkSubmissionMembers",
                columns: table => new
                {
                    HomeworkSubmissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeworkSubmissionMembers", x => new { x.HomeworkSubmissionId, x.UserId });
                    table.ForeignKey(
                        name: "FK_HomeworkSubmissionMembers_HomeworkSubmissions_HomeworkSubmi~",
                        column: x => x.HomeworkSubmissionId,
                        principalTable: "HomeworkSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HomeworkSubmissionMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_ModuleId",
                table: "Activities",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityAssistants_AssistantId",
                table: "ActivityAssistants",
                column: "AssistantId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityTemplates_ModuleTemplateId",
                table: "ActivityTemplates",
                column: "ModuleTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_AssistantApplications_ActivityId_AssistantId",
                table: "AssistantApplications",
                columns: new[] { "ActivityId", "AssistantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssistantApplications_AssistantId",
                table: "AssistantApplications",
                column: "AssistantId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseEnrollments_UserId",
                table: "CourseEnrollments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GradeOverrides_CourseId_StudentId_CellKey",
                table: "GradeOverrides",
                columns: new[] { "CourseId", "StudentId", "CellKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HomeworkSubmissionMembers_UserId",
                table: "HomeworkSubmissionMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeworkSubmissions_ActivityId",
                table: "HomeworkSubmissions",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeworkSubmissions_ReviewerId",
                table: "HomeworkSubmissions",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeworkSubmissions_TaskItemId",
                table: "HomeworkSubmissions",
                column: "TaskItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MiniTestAnswers_ActivityId_StudentId_QuestionId",
                table: "MiniTestAnswers",
                columns: new[] { "ActivityId", "StudentId", "QuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MiniTestAnswers_QuestionId",
                table: "MiniTestAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_MiniTestAnswers_StudentId",
                table: "MiniTestAnswers",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_MiniTestQuestions_ActivityId",
                table: "MiniTestQuestions",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_Modules_CourseId",
                table: "Modules",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_ModuleTemplates_CourseTemplateId",
                table: "ModuleTemplates",
                column: "CourseTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientId",
                table: "Notifications",
                column: "RecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentActivityScores_CourseId_StudentId_ModuleNumber",
                table: "StudentActivityScores",
                columns: new[] { "CourseId", "StudentId", "ModuleNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentActivityScores_StudentId",
                table: "StudentActivityScores",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssistants_AssistantId",
                table: "TaskAssistants",
                column: "AssistantId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskItems_TaskSetId",
                table: "TaskItems",
                column: "TaskSetId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSets_ActivityId",
                table: "TaskSets",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSubmissions_ActivityId_TaskItemId_TeamId_StudentId",
                table: "TaskSubmissions",
                columns: new[] { "ActivityId", "TaskItemId", "TeamId", "StudentId" });

            migrationBuilder.CreateIndex(
                name: "IX_TaskSubmissions_DefenderUserId",
                table: "TaskSubmissions",
                column: "DefenderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSubmissions_ReviewerId",
                table: "TaskSubmissions",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSubmissions_StudentId",
                table: "TaskSubmissions",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSubmissions_TaskItemId",
                table: "TaskSubmissions",
                column: "TaskItemId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSubmissions_TeamId",
                table: "TaskSubmissions",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskTemplates_ActivityTemplateId",
                table: "TaskTemplates",
                column: "ActivityTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamAssistants_AssistantId",
                table: "TeamAssistants",
                column: "AssistantId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamGroupScores_ActivityId",
                table: "TeamGroupScores",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamGroupScores_TeamId_ActivityId",
                table: "TeamGroupScores",
                columns: new[] { "TeamId", "ActivityId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TeamHelpRequests_CreatedByUserId",
                table: "TeamHelpRequests",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamHelpRequests_TeamId",
                table: "TeamHelpRequests",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_UserId",
                table: "TeamMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_ActivityId",
                table: "Teams",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamSwapLogs_InitiatedByUserId",
                table: "TeamSwapLogs",
                column: "InitiatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamSwapLogs_StudentAId",
                table: "TeamSwapLogs",
                column: "StudentAId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamSwapLogs_StudentBId",
                table: "TeamSwapLogs",
                column: "StudentBId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityAssistants");

            migrationBuilder.DropTable(
                name: "AssistantApplications");

            migrationBuilder.DropTable(
                name: "CourseEnrollments");

            migrationBuilder.DropTable(
                name: "GradeOverrides");

            migrationBuilder.DropTable(
                name: "HomeworkSubmissionMembers");

            migrationBuilder.DropTable(
                name: "MiniTestAnswers");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "StudentActivityScores");

            migrationBuilder.DropTable(
                name: "TaskAssistants");

            migrationBuilder.DropTable(
                name: "TaskSubmissions");

            migrationBuilder.DropTable(
                name: "TaskTemplates");

            migrationBuilder.DropTable(
                name: "TeamAssistants");

            migrationBuilder.DropTable(
                name: "TeamGroupScores");

            migrationBuilder.DropTable(
                name: "TeamHelpRequests");

            migrationBuilder.DropTable(
                name: "TeamMembers");

            migrationBuilder.DropTable(
                name: "TeamSwapLogs");

            migrationBuilder.DropTable(
                name: "HomeworkSubmissions");

            migrationBuilder.DropTable(
                name: "MiniTestQuestions");

            migrationBuilder.DropTable(
                name: "ActivityTemplates");

            migrationBuilder.DropTable(
                name: "Teams");

            migrationBuilder.DropTable(
                name: "TaskItems");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "ModuleTemplates");

            migrationBuilder.DropTable(
                name: "TaskSets");

            migrationBuilder.DropTable(
                name: "CourseTemplates");

            migrationBuilder.DropTable(
                name: "Activities");

            migrationBuilder.DropTable(
                name: "Modules");

            migrationBuilder.DropTable(
                name: "Courses");
        }
    }
}
