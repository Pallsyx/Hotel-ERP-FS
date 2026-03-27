/*
    BẢN GỘP HOÀN CHỈNH: CẤU TRÚC GỐC + DỮ LIỆU ĐÃ EDIT
*/

SET NOCOUNT ON;
GO

IF DB_ID(N'HotelManagementDB') IS NULL
BEGIN
    CREATE DATABASE [HotelManagementDB];
END
GO

USE [HotelManagementDB];
GO

-- =========================================================================
-- PHẦN 1: DỌN DẸP BẢNG CŨ (Tránh kẹt khóa ngoại)
-- =========================================================================
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
GO

IF OBJECT_ID(N'[dbo].[Loyalty_Point_Histories]', N'U') IS NOT NULL DROP TABLE [dbo].[Loyalty_Point_Histories];
IF OBJECT_ID(N'[dbo].[Payments]', N'U') IS NOT NULL DROP TABLE [dbo].[Payments];
IF OBJECT_ID(N'[dbo].[Invoices]', N'U') IS NOT NULL DROP TABLE [dbo].[Invoices];
IF OBJECT_ID(N'[dbo].[Order_Service_Details]', N'U') IS NOT NULL DROP TABLE [dbo].[Order_Service_Details];
IF OBJECT_ID(N'[dbo].[Order_Services]', N'U') IS NOT NULL DROP TABLE [dbo].[Order_Services];
IF OBJECT_ID(N'[dbo].[Loss_And_Damages]', N'U') IS NOT NULL DROP TABLE [dbo].[Loss_And_Damages];
IF OBJECT_ID(N'[dbo].[Booking_Details]', N'U') IS NOT NULL DROP TABLE [dbo].[Booking_Details];
IF OBJECT_ID(N'[dbo].[Bookings]', N'U') IS NOT NULL DROP TABLE [dbo].[Bookings];
IF OBJECT_ID(N'[dbo].[Room_Inventory]', N'U') IS NOT NULL DROP TABLE [dbo].[Room_Inventory];
IF OBJECT_ID(N'[dbo].[Room_Images]', N'U') IS NOT NULL DROP TABLE [dbo].[Room_Images];
IF OBJECT_ID(N'[dbo].[RoomType_Amenities]', N'U') IS NOT NULL DROP TABLE [dbo].[RoomType_Amenities];
IF OBJECT_ID(N'[dbo].[Reviews]', N'U') IS NOT NULL DROP TABLE [dbo].[Reviews];
IF OBJECT_ID(N'[dbo].[Articles]', N'U') IS NOT NULL DROP TABLE [dbo].[Articles];
IF OBJECT_ID(N'[dbo].[Audit_Logs]', N'U') IS NOT NULL DROP TABLE [dbo].[Audit_Logs];
IF OBJECT_ID(N'[dbo].[Services]', N'U') IS NOT NULL DROP TABLE [dbo].[Services];
IF OBJECT_ID(N'[dbo].[Service_Categories]', N'U') IS NOT NULL DROP TABLE [dbo].[Service_Categories];
IF OBJECT_ID(N'[dbo].[Rooms]', N'U') IS NOT NULL DROP TABLE [dbo].[Rooms];
IF OBJECT_ID(N'[dbo].[Room_Types]', N'U') IS NOT NULL DROP TABLE [dbo].[Room_Types];
IF OBJECT_ID(N'[dbo].[Amenities]', N'U') IS NOT NULL DROP TABLE [dbo].[Amenities];
IF OBJECT_ID(N'[dbo].[Attractions]', N'U') IS NOT NULL DROP TABLE [dbo].[Attractions];
IF OBJECT_ID(N'[dbo].[Article_Categories]', N'U') IS NOT NULL DROP TABLE [dbo].[Article_Categories];
IF OBJECT_ID(N'[dbo].[Users]', N'U') IS NOT NULL DROP TABLE [dbo].[Users];
IF OBJECT_ID(N'[dbo].[Memberships]', N'U') IS NOT NULL DROP TABLE [dbo].[Memberships];
IF OBJECT_ID(N'[dbo].[Role_Permissions]', N'U') IS NOT NULL DROP TABLE [dbo].[Role_Permissions];
IF OBJECT_ID(N'[dbo].[Permissions]', N'U') IS NOT NULL DROP TABLE [dbo].[Permissions];
IF OBJECT_ID(N'[dbo].[Roles]', N'U') IS NOT NULL DROP TABLE [dbo].[Roles];
IF OBJECT_ID(N'[dbo].[Vouchers]', N'U') IS NOT NULL DROP TABLE [dbo].[Vouchers];
IF OBJECT_ID(N'[dbo].[Article_Categories]', N'U') IS NOT NULL DROP TABLE [dbo].[Article_Categories];
IF OBJECT_ID(N'[dbo].[Refresh_Tokens]', N'U') IS NOT NULL DROP TABLE [dbo].[Refresh_Tokens]; -- Thêm dòng này vào đây
IF OBJECT_ID(N'[dbo].[Users]', N'U') IS NOT NULL DROP TABLE [dbo].[Users];
GO

-- =========================================================================
-- PHẦN 2: TẠO CẤU TRÚC BẢNG CHUẨN (Từ File Gốc, tương thích Backend)
-- =========================================================================

CREATE TABLE [dbo].[Roles](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(500) NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Roles_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Roles_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [UQ_Roles_Name] UNIQUE ([name])
);
GO

CREATE TABLE [dbo].[Permissions](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(150) NOT NULL,
    [description] NVARCHAR(500) NULL,
    [group_name] NVARCHAR(100) NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Permissions_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [UQ_Permissions_Name] UNIQUE ([name])
);
GO

CREATE TABLE [dbo].[Role_Permissions](
    [role_id] INT NOT NULL,
    [permission_id] INT NOT NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_RolePermissions_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [PK_Role_Permissions] PRIMARY KEY ([role_id], [permission_id]),
    CONSTRAINT [FK_RolePermissions_Roles] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Roles]([id]),
    CONSTRAINT [FK_RolePermissions_Permissions] FOREIGN KEY ([permission_id]) REFERENCES [dbo].[Permissions]([id])
);
GO

CREATE TABLE [dbo].[Memberships](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [tier_name] NVARCHAR(100) NOT NULL,
    [min_points] INT NOT NULL CONSTRAINT [DF_Memberships_MinPoints] DEFAULT (0),
    [discount_percent] DECIMAL(5,2) NOT NULL CONSTRAINT [DF_Memberships_DiscountPercent] DEFAULT (0),
    [benefits] NVARCHAR(1000) NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Memberships_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Memberships_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [UQ_Memberships_TierName] UNIQUE ([tier_name])
);
GO

CREATE TABLE [dbo].[Users](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [role_id] INT NULL,
    [membership_id] INT NULL,
    [full_name] NVARCHAR(255) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [phone] NVARCHAR(50) NULL,
    [password_hash] NVARCHAR(255) NOT NULL,
    [avatar_url] NVARCHAR(MAX) NULL,
    [avatar_public_id] NVARCHAR(255) NULL,
    [loyalty_points] INT NOT NULL CONSTRAINT [DF_Users_LoyaltyPoints] DEFAULT (0),
    [status] BIT NOT NULL CONSTRAINT [DF_Users_Status] DEFAULT ((1)),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Users_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    [last_login_at] DATETIME NULL,
    CONSTRAINT [UQ_Users_Email] UNIQUE ([email]),
    CONSTRAINT [FK_Users_Roles] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Roles]([id]),
    CONSTRAINT [FK_Users_Memberships] FOREIGN KEY ([membership_id]) REFERENCES [dbo].[Memberships]([id])
);
GO

CREATE TABLE [dbo].[Article_Categories](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_ArticleCategories_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_ArticleCategories_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [UQ_ArticleCategories_Name] UNIQUE ([name])
);
GO

CREATE TABLE [dbo].[Articles](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [category_id] INT NULL,
    [author_id] INT NULL,
    [title] NVARCHAR(500) NOT NULL,
    [slug] NVARCHAR(255) NOT NULL,
    [summary] NVARCHAR(1000) NULL,
    [content] NVARCHAR(MAX) NULL,
    [thumbnail_url] NVARCHAR(MAX) NULL,
    [thumbnail_public_id] NVARCHAR(255) NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Articles_Status] DEFAULT (N'ACTIVE'),
    [published_at] DATETIME NOT NULL CONSTRAINT [DF_Articles_PublishedAt] DEFAULT (GETDATE()),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Articles_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [FK_Articles_ArticleCategories] FOREIGN KEY ([category_id]) REFERENCES [dbo].[Article_Categories]([id]),
    CONSTRAINT [FK_Articles_Users] FOREIGN KEY ([author_id]) REFERENCES [dbo].[Users]([id])
);
GO

CREATE TABLE [dbo].[Attractions](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [distance_km] DECIMAL(5,2) NULL,
    [description] NVARCHAR(MAX) NULL,
    [map_embed_link] NVARCHAR(MAX) NULL,
    [latitude] DECIMAL(10,7) NULL,
    [longitude] DECIMAL(10,7) NULL,
    [image_url] NVARCHAR(MAX) NULL,
    [image_public_id] NVARCHAR(255) NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Attractions_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Attractions_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL
);
GO

CREATE TABLE [dbo].[Amenities](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [icon_url] NVARCHAR(MAX) NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Amenities_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Amenities_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [UQ_Amenities_Name] UNIQUE ([name])
);
GO

CREATE TABLE [dbo].[Room_Types](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [base_price] DECIMAL(18,2) NOT NULL,
    [capacity_adults] INT NOT NULL,
    [capacity_children] INT NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [bed_type] NVARCHAR(100) NULL,
    [size_sqm] DECIMAL(10,2) NULL,
    [early_checkin_fee_percent] DECIMAL(5,2) NOT NULL CONSTRAINT [DF_RoomTypes_EarlyCheckinFeePercent] DEFAULT (0),
    [late_checkout_fee_percent] DECIMAL(5,2) NOT NULL CONSTRAINT [DF_RoomTypes_LateCheckoutFeePercent] DEFAULT (0),
    [extra_hour_price] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_RoomTypes_ExtraHourPrice] DEFAULT (0),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_RoomTypes_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_RoomTypes_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [UQ_RoomTypes_Name] UNIQUE ([name])
);
GO

CREATE TABLE [dbo].[Rooms](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [room_type_id] INT NULL,
    [room_number] NVARCHAR(50) NOT NULL,
    [floor] INT NULL,
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_Rooms_Status] DEFAULT (N'Available'),
    [cleaning_status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_Rooms_CleaningStatus] DEFAULT (N'Clean'),
    [notes] NVARCHAR(500) NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Rooms_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [UQ_Rooms_Number] UNIQUE ([room_number]),
    CONSTRAINT [FK_Rooms_RoomTypes] FOREIGN KEY ([room_type_id]) REFERENCES [dbo].[Room_Types]([id])
);
GO

CREATE TABLE [dbo].[Room_Images](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [room_type_id] INT NULL,
    [image_url] NVARCHAR(MAX) NOT NULL,
    [cloud_public_id] NVARCHAR(255) NULL,
    [is_primary] BIT NOT NULL CONSTRAINT [DF_RoomImages_IsPrimary] DEFAULT ((0)),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_RoomImages_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_RoomImages_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [FK_RoomImages_RoomTypes] FOREIGN KEY ([room_type_id]) REFERENCES [dbo].[Room_Types]([id])
);
GO

CREATE TABLE [dbo].[RoomType_Amenities](
    [room_type_id] INT NOT NULL,
    [amenity_id] INT NOT NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_RoomTypeAmenities_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [PK_RoomType_Amenities] PRIMARY KEY ([room_type_id], [amenity_id]),
    CONSTRAINT [FK_RoomTypeAmenities_RoomTypes] FOREIGN KEY ([room_type_id]) REFERENCES [dbo].[Room_Types]([id]),
    CONSTRAINT [FK_RoomTypeAmenities_Amenities] FOREIGN KEY ([amenity_id]) REFERENCES [dbo].[Amenities]([id])
);
GO

CREATE TABLE [dbo].[Room_Inventory](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [room_id] INT NULL,
    [item_name] NVARCHAR(255) NOT NULL,
    [item_type] NVARCHAR(20) NOT NULL CONSTRAINT [DF_RoomInventory_ItemType] DEFAULT (N'ASSET'),
    [unit] NVARCHAR(50) NULL,
    [quantity] INT NOT NULL CONSTRAINT [DF_RoomInventory_Quantity] DEFAULT ((1)),
    [price_if_lost] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_RoomInventory_PriceIfLost] DEFAULT ((0)),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_RoomInventory_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_RoomInventory_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [FK_RoomInventory_Rooms] FOREIGN KEY ([room_id]) REFERENCES [dbo].[Rooms]([id])
);
GO

CREATE TABLE [dbo].[Service_Categories](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_ServiceCategories_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_ServiceCategories_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [UQ_ServiceCategories_Name] UNIQUE ([name])
);
GO

CREATE TABLE [dbo].[Services](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [category_id] INT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(500) NULL,
    [price] DECIMAL(18,2) NOT NULL,
    [unit] NVARCHAR(50) NULL,
    [image_url] NVARCHAR(MAX) NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Services_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Services_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [FK_Services_ServiceCategories] FOREIGN KEY ([category_id]) REFERENCES [dbo].[Service_Categories]([id])
);
GO

CREATE TABLE [dbo].[Vouchers](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [code] NVARCHAR(50) NOT NULL,
    [discount_type] NVARCHAR(50) NOT NULL,
    [discount_value] DECIMAL(18,2) NOT NULL,
    [min_booking_value] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Vouchers_MinBookingValue] DEFAULT ((0)),
    [min_booking_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Vouchers_MinBookingAmount] DEFAULT ((0)),
    [valid_from] DATETIME NULL,
    [valid_to] DATETIME NULL,
    [usage_limit] INT NULL,
    [used_count] INT NOT NULL CONSTRAINT [DF_Vouchers_UsedCount] DEFAULT ((0)),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Vouchers_Status] DEFAULT (N'ACTIVE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Vouchers_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [UQ_Vouchers_Code] UNIQUE ([code])
);
GO

CREATE TABLE [dbo].[Bookings](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [user_id] INT NULL,
    [guest_name] NVARCHAR(255) NULL,
    [guest_phone] NVARCHAR(50) NULL,
    [guest_email] NVARCHAR(255) NULL,
    [booking_code] NVARCHAR(50) NOT NULL,
    [voucher_id] INT NULL,
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_Bookings_Status] DEFAULT (N'Pending'),
    [booked_at] DATETIME NOT NULL CONSTRAINT [DF_Bookings_BookedAt] DEFAULT (GETDATE()),
    [hold_expires_at] DATETIME NULL,
    [booking_subtotal] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Bookings_BookingSubtotal] DEFAULT ((0)),
    [discount_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Bookings_DiscountAmount] DEFAULT ((0)),
    [final_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Bookings_FinalAmount] DEFAULT ((0)),
    [payment_status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_Bookings_PaymentStatus] DEFAULT (N'UNPAID'),
    [notes] NVARCHAR(1000) NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Bookings_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    [is_points_awarded] BIT DEFAULT 0,
    CONSTRAINT [UQ_Bookings_Code] UNIQUE ([booking_code]),
    CONSTRAINT [FK_Bookings_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]),
    CONSTRAINT [FK_Bookings_Vouchers] FOREIGN KEY ([voucher_id]) REFERENCES [dbo].[Vouchers]([id])
);
GO

CREATE TABLE [dbo].[Booking_Details](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [booking_id] INT NULL,
    [room_id] INT NULL,
    [room_type_id] INT NULL,
    [check_in_date] DATETIME NOT NULL,
    [check_out_date] DATETIME NOT NULL,
    [price_per_night] DECIMAL(18,2) NOT NULL,
    [adults_count] INT NOT NULL CONSTRAINT [DF_BookingDetails_AdultsCount] DEFAULT ((1)),
    [children_count] INT NOT NULL CONSTRAINT [DF_BookingDetails_ChildrenCount] DEFAULT ((0)),
    [nights] INT NOT NULL CONSTRAINT [DF_BookingDetails_Nights] DEFAULT ((1)),
    [early_check_in_fee] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_BookingDetails_EarlyCheckInFee] DEFAULT ((0)),
    [late_check_out_fee] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_BookingDetails_LateCheckOutFee] DEFAULT ((0)),
    [line_total] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_BookingDetails_LineTotal] DEFAULT ((0)),
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_BookingDetails_Status] DEFAULT (N'Booked'),
    [identity_document_url] NVARCHAR(MAX) NULL,
    [identity_document_public_id] NVARCHAR(255) NULL,
    [actual_check_in_at] DATETIME NULL,
    [actual_check_out_at] DATETIME NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_BookingDetails_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [FK_BookingDetails_Bookings] FOREIGN KEY ([booking_id]) REFERENCES [dbo].[Bookings]([id]),
    CONSTRAINT [FK_BookingDetails_Rooms] FOREIGN KEY ([room_id]) REFERENCES [dbo].[Rooms]([id]),
    CONSTRAINT [FK_BookingDetails_RoomTypes] FOREIGN KEY ([room_type_id]) REFERENCES [dbo].[Room_Types]([id])
);
GO

CREATE TABLE [dbo].[Order_Services](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [booking_detail_id] INT NULL,
    [order_code] NVARCHAR(50) NOT NULL DEFAULT (NEWID()),
    [order_date] DATETIME NOT NULL CONSTRAINT [DF_OrderServices_OrderDate] DEFAULT (GETDATE()),
    [total_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_OrderServices_TotalAmount] DEFAULT ((0)),
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_OrderServices_Status] DEFAULT (N'Pending'),
    [notes] NVARCHAR(1000) NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_OrderServices_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [FK_OrderServices_BookingDetails] FOREIGN KEY ([booking_detail_id]) REFERENCES [dbo].[Booking_Details]([id])
);
GO

CREATE TABLE [dbo].[Order_Service_Details](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [order_service_id] INT NULL,
    [service_id] INT NULL,
    [quantity] INT NOT NULL,
    [unit_price] DECIMAL(18,2) NOT NULL,
    [line_total] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_OrderServiceDetails_LineTotal] DEFAULT ((0)),
    [notes] NVARCHAR(500) NULL,
    CONSTRAINT [FK_OrderServiceDetails_OrderServices] FOREIGN KEY ([order_service_id]) REFERENCES [dbo].[Order_Services]([id]),
    CONSTRAINT [FK_OrderServiceDetails_Services] FOREIGN KEY ([service_id]) REFERENCES [dbo].[Services]([id])
);
GO

CREATE TABLE [dbo].[Loss_And_Damages](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [booking_detail_id] INT NULL,
    [room_inventory_id] INT NULL,
    [quantity] INT NOT NULL,
    [penalty_amount] DECIMAL(18,2) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [evidence_image_url] NVARCHAR(MAX) NULL,
    [evidence_public_id] NVARCHAR(255) NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_LossAndDamages_Status] DEFAULT (N'OPEN'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_LossAndDamages_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [FK_LossAndDamages_BookingDetails] FOREIGN KEY ([booking_detail_id]) REFERENCES [dbo].[Booking_Details]([id]),
    CONSTRAINT [FK_LossAndDamages_RoomInventory] FOREIGN KEY ([room_inventory_id]) REFERENCES [dbo].[Room_Inventory]([id])
);
GO

CREATE TABLE [dbo].[Invoices](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [booking_id] INT NULL,
    [invoice_code] NVARCHAR(50) NOT NULL DEFAULT (NEWID()),
    [total_room_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Invoices_TotalRoomAmount] DEFAULT ((0)),
    [total_service_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Invoices_TotalServiceAmount] DEFAULT ((0)),
    [total_damage_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Invoices_TotalDamageAmount] DEFAULT ((0)),
    [discount_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Invoices_DiscountAmount] DEFAULT ((0)),
    [manual_adjustment_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Invoices_ManualAdjustmentAmount] DEFAULT ((0)),
    [tax_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Invoices_TaxAmount] DEFAULT ((0)),
    [final_total] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Invoices_FinalTotal] DEFAULT ((0)),
    [refund_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Invoices_RefundAmount] DEFAULT ((0)),
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_Invoices_Status] DEFAULT (N'Draft'),
    [notes] NVARCHAR(1000) NULL,
    [issued_at] DATETIME NULL,
    [paid_at] DATETIME NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Invoices_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [FK_Invoices_Bookings] FOREIGN KEY ([booking_id]) REFERENCES [dbo].[Bookings]([id])
);
GO

CREATE TABLE [dbo].[Payments](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [invoice_id] INT NULL,
    [payment_method] NVARCHAR(50) NULL,
    [amount_paid] DECIMAL(18,2) NOT NULL,
    [transaction_code] NVARCHAR(100) NULL,
    [payment_date] DATETIME NOT NULL CONSTRAINT [DF_Payments_PaymentDate] DEFAULT (GETDATE()),
    [payment_direction] NVARCHAR(10) NOT NULL CONSTRAINT [DF_Payments_PaymentDirection] DEFAULT (N'IN'),
    [gateway_name] NVARCHAR(100) NULL,
    [provider_response] NVARCHAR(MAX) NULL,
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_Payments_Status] DEFAULT (N'SUCCESS'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Payments_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [FK_Payments_Invoices] FOREIGN KEY ([invoice_id]) REFERENCES [dbo].[Invoices]([id])
);
GO

CREATE TABLE [dbo].[Reviews](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [user_id] INT NULL,
    [room_type_id] INT NULL,
    [rating] INT NOT NULL,
    [comment] NVARCHAR(MAX) NULL,
    [image_url] NVARCHAR(MAX) NULL,
    [image_public_id] NVARCHAR(255) NULL,
    [is_approved] BIT NOT NULL CONSTRAINT [DF_Reviews_IsApproved] DEFAULT ((1)),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Reviews_Status] DEFAULT (N'VISIBLE'),
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_Reviews_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [FK_Reviews_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]),
    CONSTRAINT [FK_Reviews_RoomTypes] FOREIGN KEY ([room_type_id]) REFERENCES [dbo].[Room_Types]([id])
);
GO

CREATE TABLE [dbo].[Audit_Logs](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [user_id] INT NULL,
    [action] NVARCHAR(100) NOT NULL,
    [table_name] NVARCHAR(100) NOT NULL,
    [record_id] INT NOT NULL,
    [old_value] NVARCHAR(MAX) NULL,
    [new_value] NVARCHAR(MAX) NULL,
    [reason] NVARCHAR(1000) NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_AuditLogs_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [FK_AuditLogs_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id])
);
GO

CREATE TABLE [dbo].[Refresh_Tokens] (
    [id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [token] nvarchar(500) NOT NULL,
    [jwt_id] nvarchar(255) NOT NULL,
    [is_used] bit NOT NULL,
    [is_revoked] bit NOT NULL,
    [created_at] datetime NOT NULL DEFAULT (getdate()),
    [expire_at] datetime NOT NULL,
    CONSTRAINT [PK_Refresh_Tokens] PRIMARY KEY ([id]),
    CONSTRAINT [FK_RefreshTokens_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users] ([id])
);
GO

CREATE INDEX [IX_Refresh_Tokens_user_id] ON [dbo].[Refresh_Tokens] ([user_id]);
GO

-- =========================================================================
-- PHẦN 3: NẠP DỮ LIỆU MỚI (TỪ FILE EDITED CỦA BẠN)
-- =========================================================================

-- BẢNG QUYỀN HẠN & VAI TRÒ
SET IDENTITY_INSERT [dbo].[Permissions] ON 
INSERT [dbo].[Permissions] ([id], [name]) VALUES 
(1, N'VIEW_DASHBOARD'), (2, N'MANAGE_USERS'), (3, N'MANAGE_ROLES'), (4, N'MANAGE_ROOMS'), (5, N'MANAGE_BOOKINGS'), 
(6, N'MANAGE_INVOICES'), (7, N'MANAGE_SERVICES'), (8, N'VIEW_REPORTS'), (9, N'MANAGE_CONTENT'), (10, N'MANAGE_INVENTORY')
SET IDENTITY_INSERT [dbo].[Permissions] OFF
GO

SET IDENTITY_INSERT [dbo].[Roles] ON 
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES 
(1, N'Admin', N'Quản trị viên'), (2, N'Manager', N'Quản lý khách sạn'), (3, N'Receptionist', N'Lễ tân'), 
(4, N'Accountant', N'Kế toán'), (5, N'Housekeeping', N'Buồng phòng'), (6, N'Security', N'Bảo vệ'), 
(7, N'Chef', N'Đầu bếp'), (8, N'Waiter', N'Nhân viên phục vụ'), (9, N'IT Support', N'Kỹ thuật viên'), (10, N'Guest', N'Khách hàng')
SET IDENTITY_INSERT [dbo].[Roles] OFF
GO

-- PHÂN QUYỀN CHO CÁC VAI TRÒ (RBAC)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES 
(1,1), (1,2), (1,3), (1,4), (1,5), (1,6), (1,7), (1,8), (1,9), (1,10), -- Admin (Full)
(2,1), (2,4), (2,5), (2,6), (2,7), (2,8), (2,10), -- Manager
(3,1), (3,4), (3,5), (3,6), (3,7), -- Receptionist
(4,1), (4,6), (4,8), -- Accountant
(5,4), (5,10) -- Housekeeping
GO

-- BẢNG HẠNG THÀNH VIÊN (MEMBERSHIPS)
SET IDENTITY_INSERT [dbo].[Memberships] ON 
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES 
(1, N'Khách Mới', 0, 0.00), (2, N'Đồng', 500, 2.00), (3, N'Bạc', 1000, 5.00), (4, N'Vàng', 3000, 8.00), 
(5, N'Bạch Kim', 5000, 10.00), (6, N'Kim Cương', 10000, 15.00), (7, N'Elite', 20000, 20.00), 
(8, N'VIP', 50000, 25.00), (9, N'VVIP', 100000, 30.00), (10, N'Signature', 200000, 35.00)
SET IDENTITY_INSERT [dbo].[Memberships] OFF
GO

-- BẢNG NGƯỜI DÙNG (Đã tích hợp BCrypt Hash)
SET IDENTITY_INSERT [dbo].[Users] ON 
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [loyalty_points], [created_at]) VALUES 
(1, 1, NULL, N'Nguyễn Admin', N'admin@hotel.com', N'0900000001', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE()),
(2, 2, NULL, N'Trần Manager', N'manager@hotel.com', N'0900000002', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE()),
(3, 3, NULL, N'Lê Lễ Tân', N'reception1@hotel.com', N'0900000003', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE()),
(4, 3, NULL, N'Phạm Lễ Tân', N'reception2@hotel.com', N'0900000004', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE()),
(5, 4, NULL, N'Hoàng Kế Toán', N'accountant@hotel.com', N'0900000005', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE()),
(6, 10, 1, N'Khách Hàng A', N'guestA@gmail.com', N'0900000006', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE()),
(7, 10, 2, N'Khách Hàng B', N'guestB@gmail.com', N'0900000007', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE()),
(8, 10, 3, N'Khách Hàng C', N'guestC@gmail.com', N'0900000008', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE()),
(9, 10, 4, N'Khách Hàng D', N'guestD@gmail.com', N'0900000009', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE()),
(10, 10, 5, N'Khách Hàng E', N'guestE@gmail.com', N'0900000010', N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa', 1, 0, GETDATE())
SET IDENTITY_INSERT [dbo].[Users] OFF
GO

-- BẢNG PHÒNG & TIỆN ÍCH
SET IDENTITY_INSERT [dbo].[Amenities] ON 
INSERT [dbo].[Amenities] ([id], [name], [icon_url]) VALUES 
(1, N'Wifi Miễn Phí', N'wifi.png'), (2, N'Smart TV', N'tv.png'), (3, N'Điều Hòa', N'ac.png'), (4, N'Bồn Tắm Sứ', N'bathtub.png'),
(5, N'Ban Công', N'balcony.png'), (6, N'Minibar', N'minibar.png'), (7, N'Két Sắt', N'safe.png'), (8, N'Máy Sấy Tóc', N'hairdryer.png'),
(9, N'Máy Pha Cà Phê', N'coffee.png'), (10, N'Bàn Làm Việc', N'desk.png')
SET IDENTITY_INSERT [dbo].[Amenities] OFF
GO

SET IDENTITY_INSERT [dbo].[Room_Types] ON 
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description]) VALUES 
(1, N'Standard Single', 400000.00, 1, 0, N'Phòng tiêu chuẩn 1 giường đơn'),
(2, N'Standard Double', 500000.00, 2, 1, N'Phòng tiêu chuẩn 1 giường đôi'),
(3, N'Superior City View', 700000.00, 2, 1, N'Phòng cao cấp hướng phố'),
(4, N'Deluxe Ocean View', 900000.00, 2, 2, N'Phòng Deluxe hướng biển'),
(5, N'Premium Deluxe', 1200000.00, 2, 2, N'Phòng Premium tiện nghi cao cấp'),
(6, N'Family Suite', 1500000.00, 4, 2, N'Phòng Suite cho gia đình'),
(7, N'Junior Suite', 1800000.00, 2, 2, N'Phòng Suite nhỏ nhắn sang trọng'),
(8, N'Executive Suite', 2500000.00, 2, 2, N'Phòng Suite cho doanh nhân'),
(9, N'Presidential Suite', 5000000.00, 4, 2, N'Phòng Tổng thống'),
(10, N'Royal Villa', 8000000.00, 6, 4, N'Biệt thự hoàng gia nguyên căn')
SET IDENTITY_INSERT [dbo].[Room_Types] OFF
GO

SET IDENTITY_INSERT [dbo].[Room_Images] ON 
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary]) VALUES 
(1, 1, N'type1_img.jpg', 1), (2, 2, N'type2_img.jpg', 1), (3, 3, N'type3_img.jpg', 1), (4, 4, N'type4_img.jpg', 1),
(5, 5, N'type5_img.jpg', 1), (6, 6, N'type6_img.jpg', 1), (7, 7, N'type7_img.jpg', 1), (8, 8, N'type8_img.jpg', 1),
(9, 9, N'type9_img.jpg', 1), (10, 10, N'type10_img.jpg', 1)
SET IDENTITY_INSERT [dbo].[Room_Images] OFF
GO

SET IDENTITY_INSERT [dbo].[Rooms] ON 
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status]) VALUES 
(1, 1, N'101', 1, N'Available'), (2, 2, N'102', 1, N'Occupied'), (3, 3, N'201', 2, N'Cleaning'), 
(4, 4, N'202', 2, N'Maintenance'), (5, 5, N'301', 3, N'Available'), (6, 6, N'302', 3, N'Occupied'), 
(7, 7, N'401', 4, N'Available'), (8, 8, N'402', 4, N'Available'), (9, 9, N'501', 5, N'Available'), 
(10, 10, N'VILLA-1', 1, N'Available')
SET IDENTITY_INSERT [dbo].[Rooms] OFF
GO

INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES 
(1, 1), (1, 2), (1, 3), (2, 1), (2, 2), (3, 4), (3, 5), (4, 6), (4, 7), (5, 8)
GO

SET IDENTITY_INSERT [dbo].[Room_Inventory] ON 
INSERT [dbo].[Room_Inventory] ([id], [room_id], [item_name], [quantity], [price_if_lost]) VALUES 
(1, 1, N'Tivi Samsung 40 inch', 1, 5000000.00), (2, 1, N'Điều Khiển Tivi', 1, 300000.00),
(3, 2, N'Khăn Tắm Lớn', 2, 200000.00), (4, 2, N'Cốc Thủy Tinh', 2, 50000.00),
(5, 3, N'Bình Đun Siêu Tốc', 1, 400000.00), (6, 3, N'Máy Sấy Tóc', 1, 350000.00),
(7, 4, N'Gối Nằm', 4, 250000.00), (8, 4, N'Móc Treo Quần Áo', 10, 20000.00),
(9, 5, N'Áo Choàng Tắm', 2, 450000.00), (10, 5, N'Thảm Lau Chân', 1, 100000.00)
SET IDENTITY_INSERT [dbo].[Room_Inventory] OFF
GO

-- DỊCH VỤ & KHUYẾN MÃI
SET IDENTITY_INSERT [dbo].[Service_Categories] ON 
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES 
(1, N'Nhà Hàng & Ẩm Thực'), (2, N'Spa & Massage'), (3, N'Di Chuyển & Đưa Đón'), 
(4, N'Giặt Ủi'), (5, N'Tour Du Lịch'), (6, N'Phòng Gym & Yoga'), (7, N'Hồ Bơi'), 
(8, N'Tổ Chức Sự Kiện'), (9, N'Khu Vui Chơi Trẻ Em'), (10, N'Cửa Hàng Lưu Niệm')
SET IDENTITY_INSERT [dbo].[Service_Categories] OFF
GO

SET IDENTITY_INSERT [dbo].[Services] ON 
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES 
(1, 1, N'Set Ăn Sáng Buffet', 200000.00, N'Người'), (2, 1, N'Mì Ý Hải Sản', 150000.00, N'Phần'),
(3, 2, N'Massage Toàn Thân 60p', 500000.00, N'Lượt'), (4, 2, N'Xông Hơi Thảo Dược', 300000.00, N'Lượt'),
(5, 3, N'Đưa Đón Sân Bay 4 Chỗ', 350000.00, N'Chuyến'), (6, 3, N'Thuê Xe Máy Nửa Ngày', 100000.00, N'Chiếc'),
(7, 4, N'Giặt Khô Áo Vest', 120000.00, N'Cái'), (8, 4, N'Giặt Sấy Tiêu Chuẩn', 40000.00, N'Kg'),
(9, 5, N'Tour Đảo Nửa Ngày', 800000.00, N'Người'), (10, 10, N'Móc Khóa Kỷ Niệm', 50000.00, N'Cái')
SET IDENTITY_INSERT [dbo].[Services] OFF
GO

SET IDENTITY_INSERT [dbo].[Vouchers] ON 
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES 
(1, N'KM1', N'PERCENT', 10.00, 500000.00, '2025-01-01', '2026-12-31', 100),
(2, N'KM2', N'FIXED_AMOUNT', 100000.00, 1000000.00, '2025-01-01', '2026-12-31', 50),
(3, N'KM3', N'PERCENT', 15.00, 2000000.00, '2025-01-01', '2026-12-31', 30),
(4, N'KM4', N'FIXED_AMOUNT', 200000.00, 1500000.00, '2025-01-01', '2026-12-31', 50),
(5, N'KM5', N'PERCENT', 20.00, 3000000.00, '2025-01-01', '2026-12-31', 20),
(6, N'KM6', N'FIXED_AMOUNT', 50000.00, 0.00, '2025-01-01', '2026-12-31', 200),
(7, N'KM7', N'PERCENT', 5.00, 0.00, '2025-01-01', '2026-12-31', 500),
(8, N'KM8', N'FIXED_AMOUNT', 500000.00, 5000000.00, '2025-01-01', '2026-12-31', 10),
(9, N'KM9', N'PERCENT', 25.00, 10000000.00, '2025-01-01', '2026-12-31', 5),
(10, N'KM10', N'FIXED_AMOUNT', 1000000.00, 20000000.00, '2025-01-01', '2026-12-31', 2)
SET IDENTITY_INSERT [dbo].[Vouchers] OFF
GO

-- ĐẶT PHÒNG, HÓA ĐƠN & THANH TOÁN
SET IDENTITY_INSERT [dbo].[Bookings] ON 
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES 
(1, 6, N'Khách Hàng A', N'0900000006', NULL, N'BK-0001', NULL, N'Completed'),
(2, 7, N'Khách Hàng B', N'0900000007', NULL, N'BK-0002', 1, N'Checked_in'),
(3, 8, N'Khách Hàng C', N'0900000008', NULL, N'BK-0003', NULL, N'Confirmed'),
(4, 9, N'Khách Hàng D', N'0900000009', NULL, N'BK-0004', 2, N'Pending'),
(5, 10, N'Khách Hàng E', N'0900000010', NULL, N'BK-0005', NULL, N'Cancelled'),
(6, NULL, N'Khách Vãng Lai 1', N'0911111111', NULL, N'BK-0006', NULL, N'Completed'),
(7, NULL, N'Khách Vãng Lai 2', N'0922222222', NULL, N'BK-0007', 3, N'Checked_in'),
(8, 6, N'Khách Hàng A', N'0900000006', NULL, N'BK-0008', NULL, N'Confirmed'),
(9, 7, N'Khách Hàng B', N'0900000007', NULL, N'BK-0009', NULL, N'Completed'),
(10, 8, N'Khách Hàng C', N'0900000008', NULL, N'BK-0010', 4, N'Checked_in')
SET IDENTITY_INSERT [dbo].[Bookings] OFF
GO

SET IDENTITY_INSERT [dbo].[Booking_Details] ON 
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES 
(1, 1, 1, 1, '2026-03-01', '2026-03-03', 400000.00), (2, 2, 2, 2, '2026-03-05', '2026-03-10', 500000.00),
(3, 3, NULL, 3, '2026-04-10', '2026-04-12', 700000.00), (4, 4, NULL, 4, '2026-05-01', '2026-05-05', 900000.00),
(5, 5, NULL, 5, '2026-03-15', '2026-03-16', 1200000.00), (6, 6, 6, 6, '2026-02-10', '2026-02-12', 1500000.00),
(7, 7, 7, 7, '2026-03-07', '2026-03-09', 1800000.00), (8, 8, NULL, 8, '2026-06-01', '2026-06-05', 2500000.00),
(9, 9, 9, 9, '2026-01-20', '2026-01-25', 5000000.00), (10, 10, 10, 10, '2026-03-06', '2026-03-08', 8000000.00)
SET IDENTITY_INSERT [dbo].[Booking_Details] OFF
GO

SET IDENTITY_INSERT [dbo].[Order_Services] ON 
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES 
(1, 1, '2026-03-06', 0.00, N'Cancelled'), (2, 2, '2026-03-06', 200000.00, N'Delivered'),
(3, 3, '2026-03-06', 0.00, N'Pending'), (4, 4, '2026-03-06', 500000.00, N'Delivered'),
(5, 5, '2026-03-06', 0.00, N'Pending'), (6, 6, '2026-03-06', 350000.00, N'Delivered'),
(7, 7, '2026-03-06', 800000.00, N'Delivered'), (8, 8, '2026-03-06', 0.00, N'Pending'),
(9, 9, '2026-03-06', 1000000.00, N'Delivered'), (10, 10, '2026-03-06', 150000.00, N'Delivered')
SET IDENTITY_INSERT [dbo].[Order_Services] OFF
GO

SET IDENTITY_INSERT [dbo].[Order_Service_Details] ON 
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES 
(1, 2, 2, 1, 150000.00), (2, 2, 10, 1, 50000.00), (3, 4, 3, 1, 500000.00), (4, 6, 5, 1, 350000.00), 
(5, 7, 9, 1, 800000.00), (6, 9, 1, 5, 200000.00), (7, 10, 2, 1, 150000.00), (8, 4, 8, 2, 40000.00), 
(9, 6, 10, 2, 50000.00), (10, 7, 6, 2, 100000.00)
SET IDENTITY_INSERT [dbo].[Order_Service_Details] OFF
GO

SET IDENTITY_INSERT [dbo].[Loss_And_Damages] ON 
INSERT [dbo].[Loss_And_Damages] ([id], [booking_detail_id], [room_inventory_id], [quantity], [penalty_amount], [description], [created_at]) VALUES 
(1, 1, 2, 1, 300000.00, N'Làm mất điều khiển tivi', GETDATE()), (2, 2, 4, 1, 50000.00, N'Làm vỡ cốc thủy tinh', GETDATE()),
(3, 6, 3, 1, 400000.00, N'Làm hỏng bình đun siêu tốc', GETDATE()), (4, 9, 6, 1, 350000.00, N'Mất máy sấy tóc', GETDATE()),
(5, 10, 8, 2, 40000.00, N'Gãy móc treo quần áo', GETDATE()), (6, 1, 10, 1, 100000.00, N'Làm bẩn thảm lau chân không giặt được', GETDATE()),
(7, 2, 7, 1, 250000.00, N'Làm cháy gối nằm', GETDATE()), (8, 6, 5, 1, 450000.00, N'Mất áo choàng tắm', GETDATE()),
(9, 9, 4, 2, 100000.00, N'Vỡ 2 cốc thủy tinh', GETDATE()), (10, 10, 2, 1, 300000.00, N'Làm rơi vỡ điều khiển tivi', GETDATE())
SET IDENTITY_INSERT [dbo].[Loss_And_Damages] OFF
GO

SET IDENTITY_INSERT [dbo].[Invoices] ON 
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES 
(1, 1, 800000.00, 0.00, 0.00, 80000.00, 880000.00, N'Paid'), (2, 2, 2500000.00, 200000.00, 250000.00, 245000.00, 2695000.00, N'Unpaid'),
(3, 3, 1400000.00, 0.00, 0.00, 140000.00, 1540000.00, N'Unpaid'), (4, 4, 3600000.00, 0.00, 100000.00, 350000.00, 3850000.00, N'Unpaid'),
(5, 5, 1200000.00, 0.00, 0.00, 120000.00, 1320000.00, N'Refunded'), (6, 6, 3000000.00, 500000.00, 0.00, 350000.00, 3850000.00, N'Paid'),
(7, 7, 3600000.00, 0.00, 540000.00, 306000.00, 3366000.00, N'Unpaid'), (8, 8, 10000000.00, 0.00, 0.00, 1000000.00, 11000000.00, N'Unpaid'),
(9, 9, 25000000.00, 1000000.00, 0.00, 2600000.00, 28600000.00, N'Paid'), (10, 10, 16000000.00, 0.00, 200000.00, 1580000.00, 17380000.00, N'Unpaid')
SET IDENTITY_INSERT [dbo].[Invoices] OFF
GO

SET IDENTITY_INSERT [dbo].[Payments] ON 
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES 
(1, 1, N'Cash', 880000.00, N'CASH001', GETDATE()), (2, 2, N'VNPay', 1000000.00, N'VNPAY123', GETDATE()),
(3, 3, N'Credit Card', 500000.00, N'CC456', GETDATE()), (4, 4, N'Momo', 3850000.00, N'MOMO789', GETDATE()),
(5, 5, N'Bank Transfer', 1320000.00, N'BANK001', GETDATE()), (6, 6, N'Cash', 3850000.00, N'CASH002', GETDATE()),
(7, 7, N'VNPay', 3366000.00, N'VNPAY999', GETDATE()), (8, 8, N'Credit Card', 11000000.00, N'CC888', GETDATE()),
(9, 9, N'Bank Transfer', 28600000.00, N'BANK002', GETDATE()), (10, 10, N'Momo', 5000000.00, N'MOMO111', GETDATE())
SET IDENTITY_INSERT [dbo].[Payments] OFF
GO

-- TIN TỨC & BÀI VIẾT, ĐỊA ĐIỂM
SET IDENTITY_INSERT [dbo].[Article_Categories] ON 
INSERT [dbo].[Article_Categories] ([id], [name]) VALUES 
(1, N'Tin Tức Khách Sạn'), (2, N'Cẩm Nang Du Lịch'), (3, N'Khám Phá Ẩm Thực'), (4, N'Sự Kiện & Lễ Hội'), (5, N'Chương Trình Khuyến Mãi'),
(6, N'Văn Hóa Địa Phương'), (7, N'Hướng Dẫn Di Chuyển'), (8, N'Góc Thư Giãn'), (9, N'Hỏi Đáp (FAQ)'), (10, N'Thư Viện Ảnh')
SET IDENTITY_INSERT [dbo].[Article_Categories] OFF
GO

SET IDENTITY_INSERT [dbo].[Articles] ON 
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at]) VALUES 
(1, 1, 1, N'Khai trương nhà hàng mới', N'khai-truong-nha-hang', N'Nội dung...', NULL, GETDATE()),
(2, 2, 2, N'5 điểm đến không thể bỏ lỡ', N'5-diem-den', N'Nội dung...', NULL, GETDATE()),
(3, 3, 3, N'Món ngon hải sản địa phương', N'mon-ngon-hai-san', N'Nội dung...', NULL, GETDATE()),
(4, 4, 1, N'Sự kiện đếm ngược năm mới', N'su-kien-nam-moi', N'Nội dung...', NULL, GETDATE()),
(5, 5, 2, N'Khuyến mãi mùa hè 2026', N'khuyen-mai-mua-he', N'Nội dung...', NULL, GETDATE()),
(6, 6, 3, N'Lịch sử văn hóa vùng miền', N'lich-su-van-hoa', N'Nội dung...', NULL, GETDATE()),
(7, 7, 1, N'Từ sân bay về khách sạn', N'tu-san-bay-ve-ks', N'Nội dung...', NULL, GETDATE()),
(8, 8, 2, N'Cách thư giãn cuối tuần', N'cach-thu-gian', N'Nội dung...', NULL, GETDATE()),
(9, 9, 3, N'Quy định nhận trả phòng', N'quy-dinh-nhan-tra', N'Nội dung...', NULL, GETDATE()),
(10, 10, 1, N'Bộ ảnh resort flycam', N'bo-anh-resort', N'Nội dung...', NULL, GETDATE())
SET IDENTITY_INSERT [dbo].[Articles] OFF
GO

SET IDENTITY_INSERT [dbo].[Attractions] ON 
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link]) VALUES 
(1, N'Chợ Trung Tâm', 1.50, N'Khu chợ truyền thống sầm uất', N'link_map_1'),
(2, N'Bãi Biển Chính', 0.50, N'Bãi tắm công cộng tuyệt đẹp', N'link_map_2'),
(3, N'Bảo Tàng Thành Phố', 3.00, N'Lưu giữ giá trị lịch sử', N'link_map_3'),
(4, N'Phố Đi Bộ', 1.00, N'Khu vực vui chơi giải trí về đêm', N'link_map_4'),
(5, N'Chùa Cổ Lịch Sử', 5.50, N'Ngôi chùa linh thiêng', N'link_map_5'),
(6, N'Khu Vui Chơi Giải Trí', 8.00, N'Công viên trò chơi quy mô lớn', N'link_map_6'),
(7, N'Suối Nước Nóng', 15.00, N'Điểm nghỉ dưỡng thiên nhiên', N'link_map_7'),
(8, N'Làng Nghề Truyền Thống', 12.00, N'Trải nghiệm văn hóa bản địa', N'link_map_8'),
(9, N'Trung Tâm Thương Mại', 2.00, N'Khu mua sắm cao cấp', N'link_map_9'),
(10, N'Điểm Ngắm Hoàng Hôn', 4.00, N'Nơi có view biển đẹp nhất', N'link_map_10')
SET IDENTITY_INSERT [dbo].[Attractions] OFF
GO

-- REVIEWS VÀ LOGS
SET IDENTITY_INSERT [dbo].[Reviews] ON 
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES 
(1, 6, 1, 5, N'Phòng tuyệt vời!', GETDATE()), (2, 7, 2, 4, N'Khá tốt, nhân viên thân thiện.', GETDATE()),
(3, 8, 3, 3, N'Bình thường, điều hòa hơi ồn.', GETDATE()), (4, 9, 4, 5, N'View biển rất đẹp.', GETDATE()),
(5, 10, 5, 4, N'Bữa sáng ngon miệng.', GETDATE()), (6, 6, 6, 5, N'Rất thích hợp cho gia đình.', GETDATE()),
(7, 7, 7, 5, N'Sang trọng, đẳng cấp.', GETDATE()), (8, 8, 8, 2, N'Chưa hài lòng với dịch vụ dọn phòng.', GETDATE()),
(9, 9, 9, 5, N'Hoàn hảo mọi mặt.', GETDATE()), (10, 10, 10, 5, N'Trải nghiệm tuyệt vời nhất.', GETDATE())
SET IDENTITY_INSERT [dbo].[Reviews] OFF
GO

SET IDENTITY_INSERT [dbo].[Audit_Logs] ON 
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES 
(1, 1, N'UPDATE', N'Rooms', 1, N'{"status":"Cleaning"}', N'{"status":"Available"}', GETDATE()),
(2, 2, N'DELETE', N'Bookings', 5, N'{"id":5}', N'{}', GETDATE()),
(3, 3, N'CREATE', N'Invoices', 1, N'{}', N'{"id":1}', GETDATE()),
(4, 1, N'UPDATE', N'Users', 6, N'{"status":0}', N'{"status":1}', GETDATE()),
(5, 2, N'CREATE', N'Services', 1, N'{}', N'{"price":200000}', GETDATE()),
(6, 3, N'UPDATE', N'Bookings', 2, N'{"status":"Pending"}', N'{"status":"Checked_in"}', GETDATE()),
(7, 1, N'UPDATE', N'Room_Types', 1, N'{"price":350000}', N'{"price":400000}', GETDATE()),
(8, 2, N'DELETE', N'Reviews', 8, N'{"id":8}', N'{}', GETDATE()),
(9, 3, N'CREATE', N'Order_Services', 1, N'{}', N'{"amount":300000}', GETDATE()),
(10, 1, N'UPDATE', N'Vouchers', 1, N'{"limit":50}', N'{"limit":100}', GETDATE())
SET IDENTITY_INSERT [dbo].[Audit_Logs] OFF
GO

-- =========================================================================
-- PHẦN 4: BẬT LẠI KIỂM TRA KHÓA NGOẠI
-- =========================================================================
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"
GO

PRINT N'Database đã được thiết lập thành công với đầy đủ Cấu trúc chuẩn + Dữ liệu mới!';