using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CmsPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Feature_TestimonialSchema_Complete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropColumn(
            //     name: "DummyField",
            //     table: "Testimonials");
            //
            // migrationBuilder.DropColumn(
            //     name: "ImageUrl",
            //     table: "Testimonials");

            migrationBuilder.RenameColumn(
                name: "VideoUrl",
                table: "Testimonials",
                newName: "MultimediaUrl");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Testimonials",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "Testimonials",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AddColumn<string>(
                name: "AuthorName",
                table: "Testimonials",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "Testimonials",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Format",
                table: "Testimonials",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "Testimonials",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Testimonials_CategoryId",
                table: "Testimonials",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Testimonials_Categories_CategoryId",
                table: "Testimonials",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Testimonials_Categories_CategoryId",
                table: "Testimonials");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Testimonials_CategoryId",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "AuthorName",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "Format",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Testimonials");

            migrationBuilder.RenameColumn(
                name: "MultimediaUrl",
                table: "Testimonials",
                newName: "VideoUrl");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Testimonials",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "Testimonials",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000);

            migrationBuilder.AddColumn<DateTime>(
                name: "DummyField",
                table: "Testimonials",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Testimonials",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
