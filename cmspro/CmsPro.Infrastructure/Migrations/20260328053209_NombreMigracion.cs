using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CmsPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NombreMigracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DummyField",
                table: "Testimonials");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Testimonials",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Testimonials");

            migrationBuilder.AddColumn<DateTime>(
                name: "DummyField",
                table: "Testimonials",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
