using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoreHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHomeworkDefenderCoefficient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DefenderCoefficient",
                table: "HomeworkSubmissions",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefenderCoefficient",
                table: "HomeworkSubmissions");
        }
    }
}
