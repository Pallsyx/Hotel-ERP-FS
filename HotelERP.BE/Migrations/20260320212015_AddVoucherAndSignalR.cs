using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelERP.BE.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherAndSignalR : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Loyalty_Point_Histories",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    action_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    source_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    points_added = table.Column<int>(type: "int", nullable: false),
                    balance_before = table.Column<int>(type: "int", nullable: false),
                    balance_after = table.Column<int>(type: "int", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_LoyaltyPointHistories_CreatedAt")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LoyaltyPointHistories__3213E83F", x => x.id);
                    table.ForeignKey(
                        name: "FK_LoyaltyPointHistories_Bookings",
                        column: x => x.booking_id,
                        principalTable: "Bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoyaltyPointHistories_Users",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPointHistories_UserId",
                table: "Loyalty_Point_Histories",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ_LoyaltyPointHistories_BookingAction",
                table: "Loyalty_Point_Histories",
                columns: new[] { "booking_id", "action_type" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Loyalty_Point_Histories");
        }
    }
}
