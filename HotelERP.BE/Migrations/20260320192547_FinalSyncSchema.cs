using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelERP.BE.Migrations
{
    /// <inheritdoc />
    public partial class FinalSyncSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK__Loss_And__3213E83FCAB03BE1",
                table: "Loss_And_Damages");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Rooms",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CloudinaryPublicId",
                table: "Room_Types",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Room_Types",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Room_Types",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "Loss_And_Damages",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                defaultValue: "OPEN",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "OPEN")
                .OldAnnotation("Relational:DefaultConstraintName", "DF_LossAndDamages_Status");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Loss_And_Damages",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldDefaultValueSql: "(getdate())")
                .OldAnnotation("Relational:DefaultConstraintName", "DF_LossAndDamages_CreatedAt");

            migrationBuilder.AddColumn<int>(
                name: "reported_by_user_id",
                table: "Loss_And_Damages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "room_id",
                table: "Loss_And_Damages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_points_awarded",
                table: "Bookings",
                type: "bit",
                nullable: true,
                defaultValue: false);

            migrationBuilder.AlterColumn<decimal>(
                name: "longitude",
                table: "Attractions",
                type: "decimal(10,7)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,7)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "latitude",
                table: "Attractions",
                type: "decimal(10,7)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,7)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Amenities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Amenities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PKLoss_And3213E83FCAB03BE1",
                table: "Loss_And_Damages",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "IX_Loss_And_Damages_room_id",
                table: "Loss_And_Damages",
                column: "room_id");

            migrationBuilder.AddForeignKey(
                name: "FK_LossAndDamages_Rooms",
                table: "Loss_And_Damages",
                column: "room_id",
                principalTable: "Rooms",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LossAndDamages_Rooms",
                table: "Loss_And_Damages");

            migrationBuilder.DropPrimaryKey(
                name: "PKLoss_And3213E83FCAB03BE1",
                table: "Loss_And_Damages");

            migrationBuilder.DropIndex(
                name: "IX_Loss_And_Damages_room_id",
                table: "Loss_And_Damages");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "CloudinaryPublicId",
                table: "Room_Types");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Room_Types");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Room_Types");

            migrationBuilder.DropColumn(
                name: "reported_by_user_id",
                table: "Loss_And_Damages");

            migrationBuilder.DropColumn(
                name: "room_id",
                table: "Loss_And_Damages");

            migrationBuilder.DropColumn(
                name: "is_points_awarded",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Amenities");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Amenities");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "Loss_And_Damages",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "OPEN",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true,
                oldDefaultValue: "OPEN")
                .Annotation("Relational:DefaultConstraintName", "DF_LossAndDamages_Status");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Loss_And_Damages",
                type: "datetime",
                nullable: false,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "(getdate())")
                .Annotation("Relational:DefaultConstraintName", "DF_LossAndDamages_CreatedAt");

            migrationBuilder.AlterColumn<decimal>(
                name: "longitude",
                table: "Attractions",
                type: "decimal(10,7)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,7)");

            migrationBuilder.AlterColumn<decimal>(
                name: "latitude",
                table: "Attractions",
                type: "decimal(10,7)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,7)");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Loss_And__3213E83FCAB03BE1",
                table: "Loss_And_Damages",
                column: "id");
        }
    }
}
