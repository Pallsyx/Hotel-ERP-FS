using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelERP.BE.Migrations
{
    /// <inheritdoc />
    public partial class InitialHotelDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Amenities",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    icon_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_Amenities_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Amenities_CreatedAt"),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Amenitie__3213E83FF99261C0", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Article_Categories",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_ArticleCategories_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_ArticleCategories_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Article___3213E83FB8B8DB71", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Attractions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    distance_km = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    image_public_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    map_embed_link = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_Attractions_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Attractions_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    latitude = table.Column<decimal>(type: "decimal(10,7)", nullable: false),
                    longitude = table.Column<decimal>(type: "decimal(10,7)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Attracti__3213E83F6D39421C", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Memberships",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tier_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    min_points = table.Column<int>(type: "int", nullable: false),
                    discount_percent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    benefits = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_Memberships_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Memberships_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Membersh__3213E83F4203903C", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    group_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Permissions_CreatedAt")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Permissi__3213E83F61370857", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_Roles_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Roles_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Roles__3213E83F9F5496FA", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Room_Types",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    base_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    capacity_adults = table.Column<int>(type: "int", nullable: false),
                    capacity_children = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    bed_type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    size_sqm = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    early_checkin_fee_percent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    late_checkout_fee_percent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    extra_hour_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_RoomTypes_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_RoomTypes_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CloudinaryPublicId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Room_Typ__3213E83F2475B660", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Service_Categories",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_ServiceCategories_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_ServiceCategories_CreatedAt")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Service___3213E83F13335840", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Vouchers",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    discount_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    discount_value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    min_booking_value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    min_booking_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    valid_from = table.Column<DateTime>(type: "datetime", nullable: true),
                    valid_to = table.Column<DateTime>(type: "datetime", nullable: true),
                    usage_limit = table.Column<int>(type: "int", nullable: true),
                    used_count = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_Vouchers_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Vouchers_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Vouchers__3213E83FF1D19D35", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Role_Permissions",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false),
                    permission_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_RolePermissions_CreatedAt")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role_Permissions", x => new { x.role_id, x.permission_id });
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions",
                        column: x => x.permission_id,
                        principalTable: "Permissions",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_id = table.Column<int>(type: "int", nullable: true),
                    membership_id = table.Column<int>(type: "int", nullable: true),
                    full_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    avatar_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    avatar_public_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    loyalty_points = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                        .Annotation("Relational:DefaultConstraintName", "DF_Users_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Users_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    last_login_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__3213E83F80FC9A84", x => x.id);
                    table.ForeignKey(
                        name: "FK_Users_Memberships",
                        column: x => x.membership_id,
                        principalTable: "Memberships",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_Users_Roles",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Room_Images",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    room_type_id = table.Column<int>(type: "int", nullable: true),
                    image_url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    cloud_public_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    is_primary = table.Column<bool>(type: "bit", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_RoomImages_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_RoomImages_CreatedAt")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Room_Ima__3213E83F32B8D80B", x => x.id);
                    table.ForeignKey(
                        name: "FK_RoomImages_RoomTypes",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    room_type_id = table.Column<int>(type: "int", nullable: true),
                    room_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    floor = table.Column<int>(type: "int", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Available")
                        .Annotation("Relational:DefaultConstraintName", "DF_Rooms_Status"),
                    cleaning_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Clean")
                        .Annotation("Relational:DefaultConstraintName", "DF_Rooms_CleaningStatus"),
                    notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Rooms_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Rooms__3213E83FF5591627", x => x.id);
                    table.ForeignKey(
                        name: "FK_Rooms_RoomTypes",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "RoomType_Amenities",
                columns: table => new
                {
                    room_type_id = table.Column<int>(type: "int", nullable: false),
                    amenity_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_RoomTypeAmenities_CreatedAt")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomType_Amenities", x => new { x.room_type_id, x.amenity_id });
                    table.ForeignKey(
                        name: "FK_RoomTypeAmenities_Amenities",
                        column: x => x.amenity_id,
                        principalTable: "Amenities",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_RoomTypeAmenities_RoomTypes",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    category_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_Services_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Services_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Services__3213E83F37D05537", x => x.id);
                    table.ForeignKey(
                        name: "FK_Services_ServiceCategories",
                        column: x => x.category_id,
                        principalTable: "Service_Categories",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Articles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    category_id = table.Column<int>(type: "int", nullable: true),
                    author_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    slug = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    summary = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    thumbnail_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    thumbnail_public_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_Articles_Status"),
                    published_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Articles_PublishedAt"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Articles_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Articles__3213E83FD5347E3B", x => x.id);
                    table.ForeignKey(
                        name: "FK_Articles_ArticleCategories",
                        column: x => x.category_id,
                        principalTable: "Article_Categories",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_Articles_Users",
                        column: x => x.author_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Audit_Logs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    table_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    record_id = table.Column<int>(type: "int", nullable: false),
                    old_value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    new_value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_AuditLogs_CreatedAt")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Audit_Lo__3213E83FFBFD106E", x => x.id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    guest_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    guest_phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    guest_email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    booking_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    voucher_id = table.Column<int>(type: "int", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending")
                        .Annotation("Relational:DefaultConstraintName", "DF_Bookings_Status"),
                    booked_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Bookings_BookedAt"),
                    hold_expires_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    booking_subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    discount_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    final_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    payment_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "UNPAID")
                        .Annotation("Relational:DefaultConstraintName", "DF_Bookings_PaymentStatus"),
                    notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Bookings_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    is_points_awarded = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Bookings__3213E83FD44E63A2", x => x.id);
                    table.ForeignKey(
                        name: "FK_Bookings_Users",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_Bookings_Vouchers",
                        column: x => x.voucher_id,
                        principalTable: "Vouchers",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Refresh_Tokens",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    jwt_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    is_used = table.Column<bool>(type: "bit", nullable: false),
                    is_revoked = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    expire_at = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Refresh_Tokens", x => x.id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    room_type_id = table.Column<int>(type: "int", nullable: true),
                    rating = table.Column<int>(type: "int", nullable: false),
                    comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    image_public_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    is_approved = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                        .Annotation("Relational:DefaultConstraintName", "DF_Reviews_IsApproved"),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "VISIBLE")
                        .Annotation("Relational:DefaultConstraintName", "DF_Reviews_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Reviews_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Reviews__3213E83F49842445", x => x.id);
                    table.ForeignKey(
                        name: "FK_Reviews_RoomTypes",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_Reviews_Users",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Room_Inventory",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    room_id = table.Column<int>(type: "int", nullable: true),
                    item_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    item_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ASSET")
                        .Annotation("Relational:DefaultConstraintName", "DF_RoomInventory_ItemType"),
                    unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                        .Annotation("Relational:DefaultConstraintName", "DF_RoomInventory_Quantity"),
                    price_if_lost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ACTIVE")
                        .Annotation("Relational:DefaultConstraintName", "DF_RoomInventory_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_RoomInventory_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Room_Inv__3213E83F11FADD17", x => x.id);
                    table.ForeignKey(
                        name: "FK_RoomInventory_Rooms",
                        column: x => x.room_id,
                        principalTable: "Rooms",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Booking_Details",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_id = table.Column<int>(type: "int", nullable: true),
                    room_id = table.Column<int>(type: "int", nullable: true),
                    room_type_id = table.Column<int>(type: "int", nullable: true),
                    check_in_date = table.Column<DateTime>(type: "datetime", nullable: false),
                    check_out_date = table.Column<DateTime>(type: "datetime", nullable: false),
                    price_per_night = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    adults_count = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                        .Annotation("Relational:DefaultConstraintName", "DF_BookingDetails_AdultsCount"),
                    children_count = table.Column<int>(type: "int", nullable: false),
                    nights = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                        .Annotation("Relational:DefaultConstraintName", "DF_BookingDetails_Nights"),
                    early_check_in_fee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    late_check_out_fee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    line_total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Booked")
                        .Annotation("Relational:DefaultConstraintName", "DF_BookingDetails_Status"),
                    identity_document_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    identity_document_public_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    actual_check_in_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    actual_check_out_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_BookingDetails_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Booking___3213E83FCD1B6048", x => x.id);
                    table.ForeignKey(
                        name: "FK_BookingDetails_Bookings",
                        column: x => x.booking_id,
                        principalTable: "Bookings",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_BookingDetails_RoomTypes",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_BookingDetails_Rooms",
                        column: x => x.room_id,
                        principalTable: "Rooms",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_id = table.Column<int>(type: "int", nullable: true),
                    invoice_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    total_room_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_service_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_damage_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    discount_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    manual_adjustment_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    tax_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    final_total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    refund_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Draft")
                        .Annotation("Relational:DefaultConstraintName", "DF_Invoices_Status"),
                    notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    issued_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    paid_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Invoices_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Invoices__3213E83F4CEB2555", x => x.id);
                    table.ForeignKey(
                        name: "FK_Invoices_Bookings",
                        column: x => x.booking_id,
                        principalTable: "Bookings",
                        principalColumn: "id");
                });

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

            migrationBuilder.CreateTable(
                name: "Loss_And_Damages",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_detail_id = table.Column<int>(type: "int", nullable: true),
                    room_inventory_id = table.Column<int>(type: "int", nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    penalty_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    evidence_image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    evidence_public_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "OPEN"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    room_id = table.Column<int>(type: "int", nullable: true),
                    reported_by_user_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PKLoss_And3213E83FCAB03BE1", x => x.id);
                    table.ForeignKey(
                        name: "FK_LossAndDamages_BookingDetails",
                        column: x => x.booking_detail_id,
                        principalTable: "Booking_Details",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_LossAndDamages_RoomInventory",
                        column: x => x.room_inventory_id,
                        principalTable: "Room_Inventory",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_LossAndDamages_Rooms",
                        column: x => x.room_id,
                        principalTable: "Rooms",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Order_Services",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_detail_id = table.Column<int>(type: "int", nullable: true),
                    order_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    order_date = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_OrderServices_OrderDate"),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending")
                        .Annotation("Relational:DefaultConstraintName", "DF_OrderServices_Status"),
                    notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_OrderServices_CreatedAt"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Order_Se__3213E83F90202CA2", x => x.id);
                    table.ForeignKey(
                        name: "FK_OrderServices_BookingDetails",
                        column: x => x.booking_detail_id,
                        principalTable: "Booking_Details",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    invoice_id = table.Column<int>(type: "int", nullable: true),
                    payment_method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    amount_paid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    transaction_code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    payment_date = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Payments_PaymentDate"),
                    payment_direction = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "IN")
                        .Annotation("Relational:DefaultConstraintName", "DF_Payments_PaymentDirection"),
                    gateway_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    provider_response = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "SUCCESS")
                        .Annotation("Relational:DefaultConstraintName", "DF_Payments_Status"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                        .Annotation("Relational:DefaultConstraintName", "DF_Payments_CreatedAt")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payments__3213E83FC756B6FE", x => x.id);
                    table.ForeignKey(
                        name: "FK_Payments_Invoices",
                        column: x => x.invoice_id,
                        principalTable: "Invoices",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Order_Service_Details",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_service_id = table.Column<int>(type: "int", nullable: true),
                    service_id = table.Column<int>(type: "int", nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    line_total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Order_Se__3213E83F7E2A779A", x => x.id);
                    table.ForeignKey(
                        name: "FK_OrderServiceDetails_OrderServices",
                        column: x => x.order_service_id,
                        principalTable: "Order_Services",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_OrderServiceDetails_Services",
                        column: x => x.service_id,
                        principalTable: "Services",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "UQ_Amenities_Name",
                table: "Amenities",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_ArticleCategories_Name",
                table: "Article_Categories",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Articles_author_id",
                table: "Articles",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_Articles_category_id",
                table: "Articles",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "UQ_Articles_Slug",
                table: "Articles",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Audit_Logs_user_id",
                table: "Audit_Logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Trace",
                table: "Audit_Logs",
                columns: new[] { "table_name", "record_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_Booking_Details_booking_id",
                table: "Booking_Details",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_BookingDetails_RoomDateRange",
                table: "Booking_Details",
                columns: new[] { "room_id", "check_in_date", "check_out_date" });

            migrationBuilder.CreateIndex(
                name: "IX_BookingDetails_RoomTypeDateRange",
                table: "Booking_Details",
                columns: new[] { "room_type_id", "check_in_date", "check_out_date" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserStatus",
                table: "Bookings",
                columns: new[] { "user_id", "status", "payment_status" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_voucher_id",
                table: "Bookings",
                column: "voucher_id");

            migrationBuilder.CreateIndex(
                name: "UQ_Bookings_Code",
                table: "Bookings",
                column: "booking_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_booking_id",
                table: "Invoices",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "UQ_Invoices_Code",
                table: "Invoices",
                column: "invoice_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Loss_And_Damages_booking_detail_id",
                table: "Loss_And_Damages",
                column: "booking_detail_id");

            migrationBuilder.CreateIndex(
                name: "IX_Loss_And_Damages_room_id",
                table: "Loss_And_Damages",
                column: "room_id");

            migrationBuilder.CreateIndex(
                name: "IX_Loss_And_Damages_room_inventory_id",
                table: "Loss_And_Damages",
                column: "room_inventory_id");

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPointHistories_UserId",
                table: "Loyalty_Point_Histories",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ_LoyaltyPointHistories_BookingAction",
                table: "Loyalty_Point_Histories",
                columns: new[] { "booking_id", "action_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_Memberships_TierName",
                table: "Memberships",
                column: "tier_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Order_Service_Details_order_service_id",
                table: "Order_Service_Details",
                column: "order_service_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_Service_Details_service_id",
                table: "Order_Service_Details",
                column: "service_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_Services_booking_detail_id",
                table: "Order_Services",
                column: "booking_detail_id");

            migrationBuilder.CreateIndex(
                name: "UQ_OrderServices_OrderCode",
                table: "Order_Services",
                column: "order_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_invoice_id",
                table: "Payments",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "UQ_Permissions_Name",
                table: "Permissions",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Refresh_Tokens_user_id",
                table: "Refresh_Tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_Moderation",
                table: "Reviews",
                columns: new[] { "room_type_id", "is_approved", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_user_id",
                table: "Reviews",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Role_Permissions_permission_id",
                table: "Role_Permissions",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "UQ_Roles_Name",
                table: "Roles",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Room_Images_room_type_id",
                table: "Room_Images",
                column: "room_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_Room_Inventory_room_id",
                table: "Room_Inventory",
                column: "room_id");

            migrationBuilder.CreateIndex(
                name: "UQ_RoomTypes_Name",
                table: "Room_Types",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_SearchStatus",
                table: "Rooms",
                columns: new[] { "room_type_id", "status", "cleaning_status" });

            migrationBuilder.CreateIndex(
                name: "UQ_Rooms_Number",
                table: "Rooms",
                column: "room_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoomType_Amenities_amenity_id",
                table: "RoomType_Amenities",
                column: "amenity_id");

            migrationBuilder.CreateIndex(
                name: "UQ_ServiceCategories_Name",
                table: "Service_Categories",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Services_category_id",
                table: "Services",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_membership_id",
                table: "Users",
                column: "membership_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_role_id",
                table: "Users",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "UQ_Users_Email",
                table: "Users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_StatusDates",
                table: "Vouchers",
                columns: new[] { "status", "valid_from", "valid_to" });

            migrationBuilder.CreateIndex(
                name: "UQ_Vouchers_Code",
                table: "Vouchers",
                column: "code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Articles");

            migrationBuilder.DropTable(
                name: "Attractions");

            migrationBuilder.DropTable(
                name: "Audit_Logs");

            migrationBuilder.DropTable(
                name: "Loss_And_Damages");

            migrationBuilder.DropTable(
                name: "Loyalty_Point_Histories");

            migrationBuilder.DropTable(
                name: "Order_Service_Details");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Refresh_Tokens");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Role_Permissions");

            migrationBuilder.DropTable(
                name: "Room_Images");

            migrationBuilder.DropTable(
                name: "RoomType_Amenities");

            migrationBuilder.DropTable(
                name: "Article_Categories");

            migrationBuilder.DropTable(
                name: "Room_Inventory");

            migrationBuilder.DropTable(
                name: "Order_Services");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Amenities");

            migrationBuilder.DropTable(
                name: "Booking_Details");

            migrationBuilder.DropTable(
                name: "Service_Categories");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Vouchers");

            migrationBuilder.DropTable(
                name: "Room_Types");

            migrationBuilder.DropTable(
                name: "Memberships");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
