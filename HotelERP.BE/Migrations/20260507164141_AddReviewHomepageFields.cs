using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelERP.BE.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewHomepageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_Users",
                table: "Audit_Logs");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Audit_Lo__3213E83FFBFD106E",
                table: "Audit_Logs");

            migrationBuilder.DropIndex(
                name: "IX_Audit_Logs_user_id",
                table: "Audit_Logs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_Trace",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "action",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Audit_Logs")
                .Annotation("Relational:DefaultConstraintName", "DF_AuditLogs_CreatedAt");

            migrationBuilder.DropColumn(
                name: "new_value",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "old_value",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "reason",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "record_id",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "table_name",
                table: "Audit_Logs");

            migrationBuilder.RenameColumn(
                name: "DepositAmount",
                table: "Bookings",
                newName: "deposit_amount");

            migrationBuilder.RenameColumn(
                name: "Tags",
                table: "Articles",
                newName: "tags");

            migrationBuilder.RenameColumn(
                name: "MetaTitle",
                table: "Articles",
                newName: "meta_title");

            migrationBuilder.RenameColumn(
                name: "MetaDescription",
                table: "Articles",
                newName: "meta_description");

            migrationBuilder.AddColumn<string>(
                name: "highlight",
                table: "Reviews",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "like_count",
                table: "Reviews",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "service_quality",
                table: "Reviews",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "notes",
                table: "Invoices",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "deposit_amount",
                table: "Bookings",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<int>(
                name: "user_id",
                table: "Audit_Logs",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "id",
                table: "Audit_Logs",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<string>(
                name: "log_data",
                table: "Audit_Logs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "log_date",
                table: "Audit_Logs",
                type: "date",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "role_name",
                table: "Audit_Logs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "meta_title",
                table: "Articles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "meta_description",
                table: "Articles",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Audit_Logs",
                table: "Audit_Logs",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "UIX_Audit_Daily",
                table: "Audit_Logs",
                columns: new[] { "user_id", "role_name", "log_date" },
                unique: true,
                filter: "[role_name] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Users",
                table: "Audit_Logs",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_Users",
                table: "Audit_Logs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Audit_Logs",
                table: "Audit_Logs");

            migrationBuilder.DropIndex(
                name: "UIX_Audit_Daily",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "highlight",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "like_count",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "service_quality",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "log_data",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "log_date",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "role_name",
                table: "Audit_Logs");

            migrationBuilder.RenameColumn(
                name: "deposit_amount",
                table: "Bookings",
                newName: "DepositAmount");

            migrationBuilder.RenameColumn(
                name: "tags",
                table: "Articles",
                newName: "Tags");

            migrationBuilder.RenameColumn(
                name: "meta_title",
                table: "Articles",
                newName: "MetaTitle");

            migrationBuilder.RenameColumn(
                name: "meta_description",
                table: "Articles",
                newName: "MetaDescription");

            migrationBuilder.AlterColumn<string>(
                name: "notes",
                table: "Invoices",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "DepositAmount",
                table: "Bookings",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldDefaultValue: 0m);

            migrationBuilder.AlterColumn<int>(
                name: "user_id",
                table: "Audit_Logs",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "Audit_Logs",
                type: "int",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<string>(
                name: "action",
                table: "Audit_Logs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Audit_Logs",
                type: "datetime",
                nullable: false,
                defaultValueSql: "(getdate())")
                .Annotation("Relational:DefaultConstraintName", "DF_AuditLogs_CreatedAt");

            migrationBuilder.AddColumn<string>(
                name: "new_value",
                table: "Audit_Logs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "old_value",
                table: "Audit_Logs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "reason",
                table: "Audit_Logs",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "record_id",
                table: "Audit_Logs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "table_name",
                table: "Audit_Logs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "MetaTitle",
                table: "Articles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MetaDescription",
                table: "Articles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK__Audit_Lo__3213E83FFBFD106E",
                table: "Audit_Logs",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "IX_Audit_Logs_user_id",
                table: "Audit_Logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Trace",
                table: "Audit_Logs",
                columns: new[] { "table_name", "record_id", "created_at" });

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Users",
                table: "Audit_Logs",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "id");
        }
    }
}
