using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoreHub.Infrastructure.Persistence.Migrations
{
    public partial class FixAssistantRequestColumnTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""CourseAssistantRequests""
                    ALTER COLUMN ""Id""          TYPE uuid                    USING ""Id""::uuid,
                    ALTER COLUMN ""CourseId""    TYPE uuid                    USING ""CourseId""::uuid,
                    ALTER COLUMN ""UserId""      TYPE uuid                    USING ""UserId""::uuid,
                    ALTER COLUMN ""AppliedAt""   TYPE timestamp with time zone USING ""AppliedAt""::timestamp with time zone,
                    ALTER COLUMN ""ReviewedAt""  TYPE timestamp with time zone USING ""ReviewedAt""::timestamp with time zone;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""CourseAssistantRequests""
                    ALTER COLUMN ""Id""          TYPE text USING ""Id""::text,
                    ALTER COLUMN ""CourseId""    TYPE text USING ""CourseId""::text,
                    ALTER COLUMN ""UserId""      TYPE text USING ""UserId""::text,
                    ALTER COLUMN ""AppliedAt""   TYPE text USING ""AppliedAt""::text,
                    ALTER COLUMN ""ReviewedAt""  TYPE text USING ""ReviewedAt""::text;
            ");
        }
    }
}
