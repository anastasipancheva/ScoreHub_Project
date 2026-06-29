using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoreHub.Infrastructure.Persistence.Migrations
{
    public partial class AddAssistantInvite : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add AssistantInviteCode to Courses (backfill with unique codes)
            migrationBuilder.AddColumn<string>(
                name: "AssistantInviteCode",
                table: "Courses",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                "UPDATE \"Courses\" SET \"AssistantInviteCode\" = 'a' || lower(to_hex(floor(random() * 4294967296)::bigint)) WHERE \"AssistantInviteCode\" = ''");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_AssistantInviteCode",
                table: "Courses",
                column: "AssistantInviteCode",
                unique: true);

            // Create CourseAssistantRequests table
            migrationBuilder.CreateTable(
                name: "CourseAssistantRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "Pending"),
                    AppliedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseAssistantRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseAssistantRequests_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseAssistantRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseAssistantRequests_CourseId_UserId",
                table: "CourseAssistantRequests",
                columns: new[] { "CourseId", "UserId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "CourseAssistantRequests");
            migrationBuilder.DropIndex(name: "IX_Courses_AssistantInviteCode", table: "Courses");
            migrationBuilder.DropColumn(name: "AssistantInviteCode", table: "Courses");
        }
    }
}
