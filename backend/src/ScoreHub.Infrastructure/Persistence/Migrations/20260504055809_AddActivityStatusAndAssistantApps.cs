using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoreHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityStatusAndAssistantApps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SolutionUrl",
                table: "TaskSubmissions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Activities",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AssistantApplications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ActivityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AssistantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Message = table.Column<string>(type: "TEXT", nullable: true),
                    AppliedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_AssistantApplications_ActivityId_AssistantId",
                table: "AssistantApplications",
                columns: new[] { "ActivityId", "AssistantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssistantApplications_AssistantId",
                table: "AssistantApplications",
                column: "AssistantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssistantApplications");

            migrationBuilder.DropColumn(
                name: "SolutionUrl",
                table: "TaskSubmissions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Activities");
        }
    }
}
