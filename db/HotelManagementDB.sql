
/*
    Docker-ready SQL init script for HotelManagementDB
    - Removed machine-specific DROP/CREATE LOGIN statements
    - Preserved original core tables
    - Extended schema to match Trello project requirements:
      soft delete / status fields, audit log reason, voucher status, loyalty points,
      GPS coordinates for attractions, room cleaning status, room inventory item_type,
      payment refund support, review moderation, Cloudinary public_id fields, etc.
    - This script recreates all application tables and reseeds demo data.
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

/* Drop child tables first for re-runnable local/docker init */
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
GO

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
    CONSTRAINT [UQ_Memberships_TierName] UNIQUE ([tier_name]),
    CONSTRAINT [CK_Memberships_MinPoints] CHECK ([min_points] >= 0),
    CONSTRAINT [CK_Memberships_DiscountPercent] CHECK ([discount_percent] >= 0 AND [discount_percent] <= 100)
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
    CONSTRAINT [FK_Users_Memberships] FOREIGN KEY ([membership_id]) REFERENCES [dbo].[Memberships]([id]),
    CONSTRAINT [CK_Users_LoyaltyPoints] CHECK ([loyalty_points] >= 0)
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
    CONSTRAINT [UQ_Articles_Slug] UNIQUE ([slug]),
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
    CONSTRAINT [UQ_RoomTypes_Name] UNIQUE ([name]),
    CONSTRAINT [CK_RoomTypes_BasePrice] CHECK ([base_price] >= 0),
    CONSTRAINT [CK_RoomTypes_CapacityAdults] CHECK ([capacity_adults] >= 0),
    CONSTRAINT [CK_RoomTypes_CapacityChildren] CHECK ([capacity_children] >= 0)
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
    CONSTRAINT [FK_RoomInventory_Rooms] FOREIGN KEY ([room_id]) REFERENCES [dbo].[Rooms]([id]),
    CONSTRAINT [CK_RoomInventory_ItemType] CHECK ([item_type] IN (N'ASSET', N'MINIBAR')),
    CONSTRAINT [CK_RoomInventory_Quantity] CHECK ([quantity] >= 0),
    CONSTRAINT [CK_RoomInventory_PriceIfLost] CHECK ([price_if_lost] >= 0)
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
    CONSTRAINT [FK_Services_ServiceCategories] FOREIGN KEY ([category_id]) REFERENCES [dbo].[Service_Categories]([id]),
    CONSTRAINT [CK_Services_Price] CHECK ([price] >= 0)
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
    CONSTRAINT [UQ_Vouchers_Code] UNIQUE ([code]),
    CONSTRAINT [CK_Vouchers_DiscountType] CHECK ([discount_type] IN (N'PERCENT', N'FIXED_AMOUNT')),
    CONSTRAINT [CK_Vouchers_DiscountValue] CHECK ([discount_value] >= 0),
    CONSTRAINT [CK_Vouchers_MinBookingValue] CHECK ([min_booking_value] >= 0),
    CONSTRAINT [CK_Vouchers_MinBookingAmount] CHECK ([min_booking_amount] >= 0),
    CONSTRAINT [CK_Vouchers_UsedCount] CHECK ([used_count] >= 0)
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
    CONSTRAINT [UQ_Bookings_Code] UNIQUE ([booking_code]),
    CONSTRAINT [FK_Bookings_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]),
    CONSTRAINT [FK_Bookings_Vouchers] FOREIGN KEY ([voucher_id]) REFERENCES [dbo].[Vouchers]([id]),
    CONSTRAINT [CK_Bookings_BookingSubtotal] CHECK ([booking_subtotal] >= 0),
    CONSTRAINT [CK_Bookings_DiscountAmount] CHECK ([discount_amount] >= 0),
    CONSTRAINT [CK_Bookings_FinalAmount] CHECK ([final_amount] >= 0)
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
    CONSTRAINT [FK_BookingDetails_RoomTypes] FOREIGN KEY ([room_type_id]) REFERENCES [dbo].[Room_Types]([id]),
    CONSTRAINT [CK_BookingDetails_PricePerNight] CHECK ([price_per_night] >= 0),
    CONSTRAINT [CK_BookingDetails_AdultsCount] CHECK ([adults_count] >= 0),
    CONSTRAINT [CK_BookingDetails_ChildrenCount] CHECK ([children_count] >= 0),
    CONSTRAINT [CK_BookingDetails_Nights] CHECK ([nights] >= 1),
    CONSTRAINT [CK_BookingDetails_DateRange] CHECK ([check_out_date] > [check_in_date]),
    CONSTRAINT [CK_BookingDetails_LineTotal] CHECK ([line_total] >= 0)
);
GO

CREATE TABLE [dbo].[Order_Services](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [booking_detail_id] INT NULL,
    [order_code] NVARCHAR(50) NOT NULL,
    [order_date] DATETIME NOT NULL CONSTRAINT [DF_OrderServices_OrderDate] DEFAULT (GETDATE()),
    [total_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_OrderServices_TotalAmount] DEFAULT ((0)),
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_OrderServices_Status] DEFAULT (N'Pending'),
    [notes] NVARCHAR(1000) NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF_OrderServices_CreatedAt] DEFAULT (GETDATE()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [UQ_OrderServices_OrderCode] UNIQUE ([order_code]),
    CONSTRAINT [FK_OrderServices_BookingDetails] FOREIGN KEY ([booking_detail_id]) REFERENCES [dbo].[Booking_Details]([id]),
    CONSTRAINT [CK_OrderServices_TotalAmount] CHECK ([total_amount] >= 0)
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
    CONSTRAINT [FK_OrderServiceDetails_Services] FOREIGN KEY ([service_id]) REFERENCES [dbo].[Services]([id]),
    CONSTRAINT [CK_OrderServiceDetails_Quantity] CHECK ([quantity] > 0),
    CONSTRAINT [CK_OrderServiceDetails_UnitPrice] CHECK ([unit_price] >= 0),
    CONSTRAINT [CK_OrderServiceDetails_LineTotal] CHECK ([line_total] >= 0)
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
    CONSTRAINT [FK_LossAndDamages_RoomInventory] FOREIGN KEY ([room_inventory_id]) REFERENCES [dbo].[Room_Inventory]([id]),
    CONSTRAINT [CK_LossAndDamages_Quantity] CHECK ([quantity] > 0),
    CONSTRAINT [CK_LossAndDamages_PenaltyAmount] CHECK ([penalty_amount] >= 0)
);
GO

CREATE TABLE [dbo].[Invoices](
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [booking_id] INT NULL,
    [invoice_code] NVARCHAR(50) NOT NULL,
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
    CONSTRAINT [UQ_Invoices_Code] UNIQUE ([invoice_code]),
    CONSTRAINT [FK_Invoices_Bookings] FOREIGN KEY ([booking_id]) REFERENCES [dbo].[Bookings]([id]),
    CONSTRAINT [CK_Invoices_TotalRoomAmount] CHECK ([total_room_amount] >= 0),
    CONSTRAINT [CK_Invoices_TotalServiceAmount] CHECK ([total_service_amount] >= 0),
    CONSTRAINT [CK_Invoices_TotalDamageAmount] CHECK ([total_damage_amount] >= 0),
    CONSTRAINT [CK_Invoices_DiscountAmount] CHECK ([discount_amount] >= 0),
    CONSTRAINT [CK_Invoices_TaxAmount] CHECK ([tax_amount] >= 0),
    CONSTRAINT [CK_Invoices_FinalTotal] CHECK ([final_total] >= 0),
    CONSTRAINT [CK_Invoices_RefundAmount] CHECK ([refund_amount] >= 0)
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
    CONSTRAINT [FK_Payments_Invoices] FOREIGN KEY ([invoice_id]) REFERENCES [dbo].[Invoices]([id]),
    CONSTRAINT [CK_Payments_PaymentDirection] CHECK ([payment_direction] IN (N'IN', N'OUT'))
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
    CONSTRAINT [FK_Reviews_RoomTypes] FOREIGN KEY ([room_type_id]) REFERENCES [dbo].[Room_Types]([id]),
    CONSTRAINT [CK_Reviews_Rating] CHECK ([rating] BETWEEN 1 AND 5)
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

IF OBJECT_ID(N'[dbo].[Loyalty_Point_Histories]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Loyalty_Point_Histories]
    (
        [id] INT IDENTITY(1,1) NOT NULL,
        [booking_id] INT NOT NULL,
        [user_id] INT NOT NULL,
        [action_type] NVARCHAR(50) NOT NULL,
        [source_amount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_LoyaltyPointHistories_SourceAmount] DEFAULT ((0)),
        [points_added] INT NOT NULL CONSTRAINT [DF_LoyaltyPointHistories_PointsAdded] DEFAULT ((0)),
        [balance_before] INT NOT NULL CONSTRAINT [DF_LoyaltyPointHistories_BalanceBefore] DEFAULT ((0)),
        [balance_after] INT NOT NULL CONSTRAINT [DF_LoyaltyPointHistories_BalanceAfter] DEFAULT ((0)),
        [reason] NVARCHAR(500) NOT NULL,
        [created_at] DATETIME NOT NULL CONSTRAINT [DF_LoyaltyPointHistories_CreatedAt] DEFAULT (GETDATE()),

        CONSTRAINT [PK_LoyaltyPointHistories] PRIMARY KEY ([id]),
        CONSTRAINT [FK_LoyaltyPointHistories_Bookings] FOREIGN KEY ([booking_id]) REFERENCES [dbo].[Bookings]([id]),
        CONSTRAINT [FK_LoyaltyPointHistories_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]),
        CONSTRAINT [CK_LoyaltyPointHistories_SourceAmount] CHECK ([source_amount] >= 0),
        CONSTRAINT [CK_LoyaltyPointHistories_PointsAdded] CHECK ([points_added] >= 0),
        CONSTRAINT [CK_LoyaltyPointHistories_BalanceBefore] CHECK ([balance_before] >= 0),
        CONSTRAINT [CK_LoyaltyPointHistories_BalanceAfter] CHECK ([balance_after] >= 0)
    );

    CREATE UNIQUE INDEX [UQ_LoyaltyPointHistories_BookingAction]
        ON [dbo].[Loyalty_Point_Histories]([booking_id], [action_type]);

    CREATE INDEX [IX_LoyaltyPointHistories_UserId]
        ON [dbo].[Loyalty_Point_Histories]([user_id]);
END
GO

CREATE INDEX [IX_Rooms_SearchStatus] ON [dbo].[Rooms] ([room_type_id], [status], [cleaning_status]);
CREATE INDEX [IX_BookingDetails_RoomDateRange] ON [dbo].[Booking_Details] ([room_id], [check_in_date], [check_out_date]);
CREATE INDEX [IX_BookingDetails_RoomTypeDateRange] ON [dbo].[Booking_Details] ([room_type_id], [check_in_date], [check_out_date]);
CREATE INDEX [IX_Bookings_UserStatus] ON [dbo].[Bookings] ([user_id], [status], [payment_status]);
CREATE INDEX [IX_Vouchers_StatusDates] ON [dbo].[Vouchers] ([status], [valid_from], [valid_to]);
CREATE INDEX [IX_Reviews_Moderation] ON [dbo].[Reviews] ([room_type_id], [is_approved], [status]);
CREATE INDEX [IX_AuditLogs_Trace] ON [dbo].[Audit_Logs] ([table_name], [record_id], [created_at]);
GO

SET IDENTITY_INSERT [dbo].[Roles] ON
INSERT [dbo].[Roles] ([id], [name], [description], [status], [created_at], [updated_at]) VALUES
(1, N'SUPER_ADMIN', N'Quản trị cao nhất của hệ thống', N'ACTIVE', N'2026-03-01 08:00:00', NULL),
(2, N'CONTENT_ADMIN', N'Quản trị nội dung, blog, voucher, điểm đến', N'ACTIVE', N'2026-03-01 08:05:00', NULL),
(3, N'RECEPTIONIST', N'Lễ tân xử lý booking, check-in, check-out', N'ACTIVE', N'2026-03-01 08:10:00', NULL),
(4, N'HOUSEKEEPING', N'Buồng phòng, kiểm kê vật tư, minibar', N'ACTIVE', N'2026-03-01 08:15:00', NULL),
(5, N'ACCOUNTANT', N'Kế toán, hóa đơn, thanh toán, refund', N'ACTIVE', N'2026-03-01 08:20:00', NULL),
(6, N'CUSTOMER', N'Khách hàng đặt phòng', N'ACTIVE', N'2026-03-01 08:25:00', NULL)
SET IDENTITY_INSERT [dbo].[Roles] OFF
GO

SET IDENTITY_INSERT [dbo].[Permissions] ON
INSERT [dbo].[Permissions] ([id], [name], [description], [group_name], [created_at]) VALUES
(1, N'users.manage', N'Quản lý người dùng', N'RBAC', N'2026-03-01 09:00:00'),
(2, N'roles.manage', N'Quản lý vai trò', N'RBAC', N'2026-03-01 09:00:00'),
(3, N'permissions.manage', N'Quản lý quyền', N'RBAC', N'2026-03-01 09:00:00'),
(4, N'articles.manage', N'CRUD bài viết', N'CMS', N'2026-03-01 09:00:00'),
(5, N'attractions.manage', N'CRUD điểm đến', N'CMS', N'2026-03-01 09:00:00'),
(6, N'reviews.moderate', N'Duyệt/ẩn đánh giá', N'CMS', N'2026-03-01 09:00:00'),
(7, N'rooms.manage', N'CRUD hạng phòng/phòng/tiện nghi', N'ROOM', N'2026-03-01 09:00:00'),
(8, N'inventory.manage', N'Quản lý vật tư & minibar', N'ROOM', N'2026-03-01 09:00:00'),
(9, N'vouchers.manage', N'Quản lý voucher', N'CRM', N'2026-03-01 09:00:00'),
(10, N'bookings.manage', N'Quản lý booking', N'BOOKING', N'2026-03-01 09:00:00'),
(11, N'checkin.manage', N'Check-in & đổi phòng', N'RECEPTION', N'2026-03-01 09:00:00'),
(12, N'checkout.manage', N'Check-out & xuất hóa đơn', N'RECEPTION', N'2026-03-01 09:00:00'),
(13, N'services.pos', N'POS & dịch vụ phát sinh', N'POS', N'2026-03-01 09:00:00'),
(14, N'payments.manage', N'Thanh toán & hoàn tiền', N'PAYMENT', N'2026-03-01 09:00:00'),
(15, N'auditlogs.view', N'Xem audit logs', N'SYSTEM', N'2026-03-01 09:00:00'),
(16, N'memberships.manage', N'Quản lý hạng thành viên', N'CRM', N'2026-03-01 09:00:00'),
(17, N'reports.view', N'Xem báo cáo', N'SYSTEM', N'2026-03-01 09:00:00'),
(18, N'profile.self', N'Tác vụ cá nhân', N'SELF', N'2026-03-01 09:00:00')
SET IDENTITY_INSERT [dbo].[Permissions] OFF
GO

INSERT [dbo].[Role_Permissions] ([role_id], [permission_id], [created_at]) VALUES
(1, 1, N'2026-03-01 09:30:00'),
(1, 2, N'2026-03-01 09:30:00'),
(1, 3, N'2026-03-01 09:30:00'),
(1, 4, N'2026-03-01 09:30:00'),
(1, 5, N'2026-03-01 09:30:00'),
(1, 6, N'2026-03-01 09:30:00'),
(1, 7, N'2026-03-01 09:30:00'),
(1, 8, N'2026-03-01 09:30:00'),
(1, 9, N'2026-03-01 09:30:00'),
(1, 10, N'2026-03-01 09:30:00'),
(1, 11, N'2026-03-01 09:30:00'),
(1, 12, N'2026-03-01 09:30:00'),
(1, 13, N'2026-03-01 09:30:00'),
(1, 14, N'2026-03-01 09:30:00'),
(1, 15, N'2026-03-01 09:30:00'),
(1, 16, N'2026-03-01 09:30:00'),
(1, 17, N'2026-03-01 09:30:00'),
(1, 18, N'2026-03-01 09:30:00'),
(2, 4, N'2026-03-01 09:30:00'),
(2, 5, N'2026-03-01 09:30:00'),
(2, 6, N'2026-03-01 09:30:00'),
(2, 7, N'2026-03-01 09:30:00'),
(2, 8, N'2026-03-01 09:30:00'),
(2, 9, N'2026-03-01 09:30:00'),
(2, 10, N'2026-03-01 09:30:00'),
(2, 15, N'2026-03-01 09:30:00'),
(2, 16, N'2026-03-01 09:30:00'),
(2, 18, N'2026-03-01 09:30:00'),
(3, 10, N'2026-03-01 09:30:00'),
(3, 11, N'2026-03-01 09:30:00'),
(3, 12, N'2026-03-01 09:30:00'),
(3, 13, N'2026-03-01 09:30:00'),
(3, 18, N'2026-03-01 09:30:00'),
(4, 7, N'2026-03-01 09:30:00'),
(4, 8, N'2026-03-01 09:30:00'),
(4, 18, N'2026-03-01 09:30:00'),
(5, 12, N'2026-03-01 09:30:00'),
(5, 14, N'2026-03-01 09:30:00'),
(5, 15, N'2026-03-01 09:30:00'),
(5, 17, N'2026-03-01 09:30:00'),
(5, 18, N'2026-03-01 09:30:00'),
(6, 18, N'2026-03-01 09:30:00')
GO

SET IDENTITY_INSERT [dbo].[Memberships] ON
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent], [benefits], [status], [created_at], [updated_at]) VALUES
(1, N'Bronze', 0, 0.00, N'Tích điểm cơ bản', N'ACTIVE', N'2026-03-01 09:45:00', NULL),
(2, N'Silver', 1000, 5.00, N'Giảm 5%, ưu tiên check-in sớm nếu còn phòng', N'ACTIVE', N'2026-03-01 09:45:00', NULL),
(3, N'Gold', 3000, 10.00, N'Giảm 10%, tặng welcome drink', N'ACTIVE', N'2026-03-01 09:45:00', NULL),
(4, N'Platinum', 6000, 15.00, N'Giảm 15%, ưu tiên upgrade phòng nếu còn trống', N'ACTIVE', N'2026-03-01 09:45:00', NULL)
SET IDENTITY_INSERT [dbo].[Memberships] OFF
GO

SET IDENTITY_INSERT [dbo].[Users] ON
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [avatar_url], [avatar_public_id], [loyalty_points], [status], [created_at], [updated_at], [last_login_at]) VALUES
(1, 1, NULL, N'Nguyễn Nhật Long', N'superadmin@hotel.local', N'0901000001', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 0, 1, N'2026-03-01 10:00:00', NULL, N'2026-03-18 22:30:00'),
(2, 2, NULL, N'Trần Minh An', N'contentadmin@hotel.local', N'0901000002', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 0, 1, N'2026-03-01 10:00:00', NULL, N'2026-03-18 21:10:00'),
(3, 3, NULL, N'Lê Thu Hà', N'reception@hotel.local', N'0901000003', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 0, 1, N'2026-03-01 10:00:00', NULL, N'2026-03-18 20:55:00'),
(4, 4, NULL, N'Phạm Gia Bảo', N'housekeeping@hotel.local', N'0901000004', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 0, 1, N'2026-03-01 10:00:00', NULL, N'2026-03-18 18:00:00'),
(5, 5, NULL, N'Đỗ Thanh Mai', N'accountant@hotel.local', N'0901000005', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 0, 1, N'2026-03-01 10:00:00', NULL, N'2026-03-18 19:40:00'),
(6, 6, 2, N'Khách Hàng A', N'customer.a@hotel.local', N'0902000006', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 1200, 1, N'2026-03-01 10:30:00', NULL, N'2026-03-17 09:30:00'),
(7, 6, 3, N'Khách Hàng B', N'customer.b@hotel.local', N'0902000007', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 3550, 1, N'2026-03-01 10:35:00', NULL, N'2026-03-18 07:45:00'),
(8, 6, 1, N'Khách Hàng C', N'customer.c@hotel.local', N'0902000008', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 250, 1, N'2026-03-01 10:40:00', NULL, N'2026-03-16 12:00:00'),
(9, 6, 4, N'Khách Hàng D', N'customer.d@hotel.local', N'0902000009', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 6420, 1, N'2026-03-01 10:45:00', NULL, N'2026-03-15 17:20:00'),
(10, 6, 1, N'Khách Hàng E', N'customer.e@hotel.local', N'0902000010', N'$2a$12$sm12wDYQVujraRN0C1p0LeI/zhrP//pK1m1A/JfzOueJFEylkPpSW', NULL, NULL, 80, 1, N'2026-03-01 10:50:00', NULL, N'2026-03-10 14:10:00')
SET IDENTITY_INSERT [dbo].[Users] OFF
GO

SET IDENTITY_INSERT [dbo].[Article_Categories] ON
INSERT [dbo].[Article_Categories] ([id], [name], [status], [created_at], [updated_at]) VALUES
(1, N'Tin tức khách sạn', N'ACTIVE', N'2026-03-02 08:00:00', NULL),
(2, N'Cẩm nang du lịch', N'ACTIVE', N'2026-03-02 08:00:00', NULL),
(3, N'Khuyến mãi', N'ACTIVE', N'2026-03-02 08:00:00', NULL),
(4, N'Ẩm thực & dịch vụ', N'ACTIVE', N'2026-03-02 08:00:00', NULL),
(5, N'FAQ', N'ACTIVE', N'2026-03-02 08:00:00', NULL)
SET IDENTITY_INSERT [dbo].[Article_Categories] OFF
GO

SET IDENTITY_INSERT [dbo].[Articles] ON
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [summary], [content], [thumbnail_url], [thumbnail_public_id], [status], [published_at], [created_at], [updated_at]) VALUES
(1, 1, 2, N'Khai trương khu hồ bơi vô cực', N'khai-truong-khu-ho-boi-vo-cuc', N'Thông tin nâng cấp tiện ích mùa hè 2026', N'Nội dung demo về khu hồ bơi vô cực, thời gian mở cửa và các ưu đãi đi kèm.', N'https://res.cloudinary.com/demo/image/upload/v1/articles/pool-opening.jpg', N'articles/pool-opening', N'ACTIVE', N'2026-03-05 09:00:00', N'2026-03-05 08:30:00', NULL),
(2, 2, 2, N'5 điểm đến nên ghé khi lưu trú 2 ngày 1 đêm', N'5-diem-den-nen-ghe-khi-luu-tru-2-ngay-1-dem', N'Gợi ý lịch trình ngắn quanh khách sạn', N'Danh sách các điểm đến nổi bật, khoảng cách và gợi ý thời gian di chuyển.', N'https://res.cloudinary.com/demo/image/upload/v1/articles/attractions-guide.jpg', N'articles/attractions-guide', N'ACTIVE', N'2026-03-06 09:00:00', N'2026-03-06 08:30:00', NULL),
(3, 3, 2, N'Ưu đãi cuối tuần cho thành viên Gold & Platinum', N'uu-dai-cuoi-tuan-cho-thanh-vien-gold-platinum', N'Mã giảm giá và quyền lợi nâng hạng', N'Bài viết mô tả voucher, điều kiện áp dụng và quyền lợi loyalty.', N'https://res.cloudinary.com/demo/image/upload/v1/articles/weekend-loyalty.jpg', N'articles/weekend-loyalty', N'ACTIVE', N'2026-03-07 11:00:00', N'2026-03-07 10:30:00', NULL),
(4, 4, 2, N'Menu minibar và dịch vụ phòng mới tháng 3', N'menu-minibar-va-dich-vu-phong-moi-thang-3', N'Các món mới trong hệ thống POS', N'Thông tin về đồ ăn nhẹ, thức uống và dịch vụ giao tận phòng.', N'https://res.cloudinary.com/demo/image/upload/v1/articles/minibar-menu.jpg', N'articles/minibar-menu', N'ACTIVE', N'2026-03-08 14:00:00', N'2026-03-08 13:30:00', NULL),
(5, 5, 2, N'Quy định check-in sớm và check-out muộn', N'quy-dinh-check-in-som-va-check-out-muon', N'Giải đáp phụ phí giờ và các điều kiện áp dụng', N'FAQ về phụ phí early check-in, late check-out, đổi phòng và hoàn tiền.', N'https://res.cloudinary.com/demo/image/upload/v1/articles/faq-checkin-checkout.jpg', N'articles/faq-checkin-checkout', N'ACTIVE', N'2026-03-09 16:00:00', N'2026-03-09 15:30:00', NULL)
SET IDENTITY_INSERT [dbo].[Articles] OFF
GO

SET IDENTITY_INSERT [dbo].[Attractions] ON
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [image_url], [image_public_id], [status], [created_at], [updated_at]) VALUES
(1, N'Bãi biển Mỹ Khê', 1.20, N'Bãi biển nổi tiếng với bờ cát đẹp và nhiều hoạt động ngoài trời.', N'https://maps.example.com/my-khe', 16.0603123, 108.2457555, N'https://res.cloudinary.com/demo/image/upload/v1/attractions/my-khe.jpg', N'attractions/my-khe', N'ACTIVE', N'2026-03-02 09:00:00', NULL),
(2, N'Cầu Rồng', 3.50, N'Biểu tượng của thành phố, phù hợp tham quan buổi tối.', N'https://maps.example.com/cau-rong', 16.0616952, 108.2276673, N'https://res.cloudinary.com/demo/image/upload/v1/attractions/dragon-bridge.jpg', N'attractions/dragon-bridge', N'ACTIVE', N'2026-03-02 09:00:00', NULL),
(3, N'Ngũ Hành Sơn', 8.40, N'Quần thể danh thắng nổi bật với hang động và chùa cổ.', N'https://maps.example.com/ngu-hanh-son', 16.0039512, 108.2645215, N'https://res.cloudinary.com/demo/image/upload/v1/attractions/marble-mountains.jpg', N'attractions/marble-mountains', N'ACTIVE', N'2026-03-02 09:00:00', NULL),
(4, N'Chợ Hàn', 4.10, N'Khu chợ trung tâm thuận tiện mua đặc sản và quà lưu niệm.', N'https://maps.example.com/cho-han', 16.0677301, 108.2241002, N'https://res.cloudinary.com/demo/image/upload/v1/attractions/han-market.jpg', N'attractions/han-market', N'ACTIVE', N'2026-03-02 09:00:00', NULL),
(5, N'Bán đảo Sơn Trà', 12.00, N'Điểm ngắm cảnh thiên nhiên và săn mây nổi tiếng.', N'https://maps.example.com/son-tra', 16.1214255, 108.2823679, N'https://res.cloudinary.com/demo/image/upload/v1/attractions/son-tra.jpg', N'attractions/son-tra', N'ACTIVE', N'2026-03-02 09:00:00', NULL)
SET IDENTITY_INSERT [dbo].[Attractions] OFF
GO

SET IDENTITY_INSERT [dbo].[Amenities] ON
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [status], [created_at]) VALUES
(1, N'Wifi miễn phí', N'wifi.png', N'ACTIVE', N'2026-03-02 09:30:00'),
(2, N'Smart TV', N'tv.png', N'ACTIVE', N'2026-03-02 09:30:00'),
(3, N'Điều hòa', N'ac.png', N'ACTIVE', N'2026-03-02 09:30:00'),
(4, N'Ban công', N'balcony.png', N'ACTIVE', N'2026-03-02 09:30:00'),
(5, N'Minibar', N'minibar.png', N'ACTIVE', N'2026-03-02 09:30:00'),
(6, N'Két sắt', N'safe.png', N'ACTIVE', N'2026-03-02 09:30:00'),
(7, N'Bồn tắm', N'bathtub.png', N'ACTIVE', N'2026-03-02 09:30:00'),
(8, N'Máy sấy tóc', N'hairdryer.png', N'ACTIVE', N'2026-03-02 09:30:00'),
(9, N'Bàn làm việc', N'desk.png', N'ACTIVE', N'2026-03-02 09:30:00'),
(10, N'Máy pha cà phê', N'coffee.png', N'ACTIVE', N'2026-03-02 09:30:00')
SET IDENTITY_INSERT [dbo].[Amenities] OFF
GO

SET IDENTITY_INSERT [dbo].[Room_Types] ON
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [bed_type], [size_sqm], [early_checkin_fee_percent], [late_checkout_fee_percent], [extra_hour_price], [status], [created_at], [updated_at]) VALUES
(1, N'Deluxe Queen', 850000.00, 2, 1, N'Phòng tiêu chuẩn cao cấp cho cặp đôi hoặc gia đình nhỏ.', N'1 Queen Bed', 28.00, 20.00, 20.00, 120000.00, N'ACTIVE', N'2026-03-02 10:00:00', NULL),
(2, N'Deluxe Twin', 900000.00, 2, 1, N'Phòng 2 giường đơn phù hợp khách công tác hoặc bạn bè.', N'2 Twin Beds', 30.00, 20.00, 20.00, 130000.00, N'ACTIVE', N'2026-03-02 10:00:00', NULL),
(3, N'Family Suite', 1450000.00, 4, 2, N'Phòng gia đình rộng, có khu vực sinh hoạt riêng.', N'2 Queen Beds', 48.00, 25.00, 25.00, 180000.00, N'ACTIVE', N'2026-03-02 10:00:00', NULL),
(4, N'Executive Sea View', 1900000.00, 2, 2, N'Phòng hạng cao với view biển và ban công lớn.', N'1 King Bed', 42.00, 30.00, 30.00, 220000.00, N'ACTIVE', N'2026-03-02 10:00:00', NULL),
(5, N'Presidential Suite', 4500000.00, 4, 2, N'Phòng tổng thống dành cho khách VIP.', N'2 King Beds', 110.00, 35.00, 35.00, 500000.00, N'ACTIVE', N'2026-03-02 10:00:00', NULL)
SET IDENTITY_INSERT [dbo].[Room_Types] OFF
GO

INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id], [created_at]) VALUES
(1, 1, N'2026-03-02 10:15:00'),
(1, 2, N'2026-03-02 10:15:00'),
(1, 3, N'2026-03-02 10:15:00'),
(1, 8, N'2026-03-02 10:15:00'),
(2, 1, N'2026-03-02 10:15:00'),
(2, 2, N'2026-03-02 10:15:00'),
(2, 3, N'2026-03-02 10:15:00'),
(2, 9, N'2026-03-02 10:15:00'),
(3, 1, N'2026-03-02 10:15:00'),
(3, 2, N'2026-03-02 10:15:00'),
(3, 3, N'2026-03-02 10:15:00'),
(3, 4, N'2026-03-02 10:15:00'),
(3, 5, N'2026-03-02 10:15:00'),
(4, 1, N'2026-03-02 10:15:00'),
(4, 2, N'2026-03-02 10:15:00'),
(4, 3, N'2026-03-02 10:15:00'),
(4, 4, N'2026-03-02 10:15:00'),
(4, 5, N'2026-03-02 10:15:00'),
(4, 6, N'2026-03-02 10:15:00'),
(4, 10, N'2026-03-02 10:15:00'),
(5, 1, N'2026-03-02 10:15:00'),
(5, 2, N'2026-03-02 10:15:00'),
(5, 3, N'2026-03-02 10:15:00'),
(5, 4, N'2026-03-02 10:15:00'),
(5, 5, N'2026-03-02 10:15:00'),
(5, 6, N'2026-03-02 10:15:00'),
(5, 7, N'2026-03-02 10:15:00'),
(5, 10, N'2026-03-02 10:15:00')
GO

SET IDENTITY_INSERT [dbo].[Rooms] ON
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [notes], [created_at], [updated_at]) VALUES
(1, 1, N'101', 1, N'Available', N'Clean', NULL, N'2026-03-02 11:00:00', NULL),
(2, 1, N'102', 1, N'Occupied', N'Clean', N'Đang có khách lưu trú', N'2026-03-02 11:00:00', N'2026-03-18 14:00:00'),
(3, 2, N'103', 1, N'Available', N'Dirty', N'Chờ dọn phòng sau checkout', N'2026-03-02 11:00:00', N'2026-03-18 12:00:00'),
(4, 2, N'201', 2, N'Available', N'Clean', NULL, N'2026-03-02 11:00:00', NULL),
(5, 3, N'202', 2, N'Occupied', N'Clean', N'Gia đình đang lưu trú', N'2026-03-02 11:00:00', N'2026-03-18 09:00:00'),
(6, 3, N'203', 2, N'Maintenance', N'Dirty', N'Khóa phòng để sửa điều hòa', N'2026-03-02 11:00:00', N'2026-03-17 16:00:00'),
(7, 4, N'301', 3, N'Available', N'Clean', NULL, N'2026-03-02 11:00:00', NULL),
(8, 4, N'302', 3, N'Reserved', N'Clean', N'Đã giữ phòng 15 phút cho giỏ hàng', N'2026-03-02 11:00:00', N'2026-03-19 11:30:00'),
(9, 5, N'401', 4, N'Available', N'Clean', N'Phòng VIP', N'2026-03-02 11:00:00', NULL),
(10, 1, N'104', 1, N'Available', N'Clean', NULL, N'2026-03-02 11:00:00', NULL),
(11, 2, N'204', 2, N'OutOfService', N'Dirty', N'Chờ thay khóa cửa', N'2026-03-02 11:00:00', N'2026-03-18 06:00:00'),
(12, 4, N'303', 3, N'Available', N'Clean', NULL, N'2026-03-02 11:00:00', NULL)
SET IDENTITY_INSERT [dbo].[Rooms] OFF
GO

SET IDENTITY_INSERT [dbo].[Room_Images] ON
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [cloud_public_id], [is_primary], [status], [created_at]) VALUES
(1, 1, N'https://res.cloudinary.com/demo/image/upload/v1/rooms/deluxe-queen-1.jpg', N'rooms/deluxe-queen-1', 1, N'ACTIVE', N'2026-03-02 11:15:00'),
(2, 1, N'https://res.cloudinary.com/demo/image/upload/v1/rooms/deluxe-queen-2.jpg', N'rooms/deluxe-queen-2', 0, N'ACTIVE', N'2026-03-02 11:15:00'),
(3, 2, N'https://res.cloudinary.com/demo/image/upload/v1/rooms/deluxe-twin-1.jpg', N'rooms/deluxe-twin-1', 1, N'ACTIVE', N'2026-03-02 11:15:00'),
(4, 3, N'https://res.cloudinary.com/demo/image/upload/v1/rooms/family-suite-1.jpg', N'rooms/family-suite-1', 1, N'ACTIVE', N'2026-03-02 11:15:00'),
(5, 3, N'https://res.cloudinary.com/demo/image/upload/v1/rooms/family-suite-2.jpg', N'rooms/family-suite-2', 0, N'ACTIVE', N'2026-03-02 11:15:00'),
(6, 4, N'https://res.cloudinary.com/demo/image/upload/v1/rooms/executive-sea-1.jpg', N'rooms/executive-sea-1', 1, N'ACTIVE', N'2026-03-02 11:15:00'),
(7, 5, N'https://res.cloudinary.com/demo/image/upload/v1/rooms/presidential-1.jpg', N'rooms/presidential-1', 1, N'ACTIVE', N'2026-03-02 11:15:00'),
(8, 5, N'https://res.cloudinary.com/demo/image/upload/v1/rooms/presidential-2.jpg', N'rooms/presidential-2', 0, N'ACTIVE', N'2026-03-02 11:15:00')
SET IDENTITY_INSERT [dbo].[Room_Images] OFF
GO

SET IDENTITY_INSERT [dbo].[Room_Inventory] ON
INSERT [dbo].[Room_Inventory] ([id], [room_id], [item_name], [item_type], [unit], [quantity], [price_if_lost], [status], [created_at], [updated_at]) VALUES
(1, 1, N'Khăn tắm lớn', N'ASSET', N'cái', 2, 120000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL),
(2, 1, N'Nước suối 500ml', N'MINIBAR', N'chai', 4, 25000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL),
(3, 2, N'Áo choàng tắm', N'ASSET', N'cái', 2, 250000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL),
(4, 2, N'Coca Cola lon', N'MINIBAR', N'lon', 4, 35000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL),
(5, 5, N'Snack khoai tây', N'MINIBAR', N'gói', 3, 30000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL),
(6, 5, N'Máy sấy tóc', N'ASSET', N'cái', 1, 450000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL),
(7, 7, N'Rượu vang mini', N'MINIBAR', N'chai', 2, 180000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL),
(8, 7, N'Bình đun siêu tốc', N'ASSET', N'cái', 1, 300000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL),
(9, 9, N'Ly pha lê', N'ASSET', N'bộ', 1, 650000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL),
(10, 9, N'Champagne mini', N'MINIBAR', N'chai', 1, 850000.00, N'ACTIVE', N'2026-03-02 11:30:00', NULL)
SET IDENTITY_INSERT [dbo].[Room_Inventory] OFF
GO

SET IDENTITY_INSERT [dbo].[Service_Categories] ON
INSERT [dbo].[Service_Categories] ([id], [name], [status], [created_at]) VALUES
(1, N'F&B', N'ACTIVE', N'2026-03-02 12:00:00'),
(2, N'Laundry', N'ACTIVE', N'2026-03-02 12:00:00'),
(3, N'Transport', N'ACTIVE', N'2026-03-02 12:00:00'),
(4, N'Wellness', N'ACTIVE', N'2026-03-02 12:00:00')
SET IDENTITY_INSERT [dbo].[Service_Categories] OFF
GO

SET IDENTITY_INSERT [dbo].[Services] ON
INSERT [dbo].[Services] ([id], [category_id], [name], [description], [price], [unit], [image_url], [status], [created_at], [updated_at]) VALUES
(1, 1, N'Buffet sáng', N'Buffet sáng tại nhà hàng tầng 1', 180000.00, N'suất', NULL, N'ACTIVE', N'2026-03-02 12:10:00', NULL),
(2, 1, N'Club sandwich', N'Đồ ăn nhẹ phục vụ tận phòng', 120000.00, N'phần', NULL, N'ACTIVE', N'2026-03-02 12:10:00', NULL),
(3, 2, N'Giặt ủi thường', N'Giặt và ủi quần áo theo kg', 50000.00, N'kg', NULL, N'ACTIVE', N'2026-03-02 12:10:00', NULL),
(4, 3, N'Đưa đón sân bay', N'Xe 4 chỗ', 250000.00, N'chuyến', NULL, N'ACTIVE', N'2026-03-02 12:10:00', NULL),
(5, 4, N'Massage 60 phút', N'Gói thư giãn cơ bản', 650000.00, N'lượt', NULL, N'ACTIVE', N'2026-03-02 12:10:00', NULL),
(6, 1, N'Nước cam tươi', N'Phục vụ tại phòng', 60000.00, N'ly', NULL, N'ACTIVE', N'2026-03-02 12:10:00', NULL)
SET IDENTITY_INSERT [dbo].[Services] OFF
GO

SET IDENTITY_INSERT [dbo].[Vouchers] ON
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [min_booking_amount], [valid_from], [valid_to], [usage_limit], [used_count], [status], [created_at], [updated_at]) VALUES
(1, N'WELCOME10', N'PERCENT', 10.00, 500000.00, 500000.00, N'2026-01-01 00:00:00', N'2026-12-31 23:59:59', 500, 42, N'ACTIVE', N'2026-03-02 13:00:00', NULL),
(2, N'SPRING200K', N'FIXED_AMOUNT', 200000.00, 1500000.00, 1500000.00, N'2026-03-01 00:00:00', N'2026-05-31 23:59:59', 100, 11, N'ACTIVE', N'2026-03-02 13:00:00', NULL),
(3, N'LOYALTY15', N'PERCENT', 15.00, 2500000.00, 2500000.00, N'2026-01-01 00:00:00', N'2026-12-31 23:59:59', 50, 7, N'ACTIVE', N'2026-03-02 13:00:00', NULL),
(4, N'FLASHSALE', N'PERCENT', 20.00, 1000000.00, 1000000.00, N'2026-03-15 00:00:00', N'2026-03-20 23:59:59', 30, 29, N'INACTIVE', N'2026-03-02 13:00:00', N'2026-03-18 17:00:00'),
(5, N'MEGA1M', N'FIXED_AMOUNT', 1000000.00, 6000000.00, 6000000.00, N'2026-01-01 00:00:00', N'2026-12-31 23:59:59', 10, 2, N'ACTIVE', N'2026-03-02 13:00:00', NULL)
SET IDENTITY_INSERT [dbo].[Vouchers] OFF
GO

SET IDENTITY_INSERT [dbo].[Bookings] ON
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status], [booked_at], [hold_expires_at], [booking_subtotal], [discount_amount], [final_amount], [payment_status], [notes], [created_at], [updated_at]) VALUES
(1, 6, N'Khách Hàng A', N'0902000006', N'customer.a@hotel.local', N'BK-202603-0001', 1, N'Completed', N'2026-03-03 09:00:00', NULL, 1700000.00, 170000.00, 1530000.00, N'PAID', N'Đặt trực tiếp qua website', N'2026-03-03 09:00:00', N'2026-03-05 11:00:00'),
(2, 7, N'Khách Hàng B', N'0902000007', N'customer.b@hotel.local', N'BK-202603-0002', 2, N'Checked_in', N'2026-03-10 10:15:00', NULL, 7050000.00, 200000.00, 6850000.00, N'PARTIAL', N'Booking nhiều phòng cho gia đình', N'2026-03-10 10:15:00', N'2026-03-18 13:45:00'),
(3, 8, N'Khách Hàng C', N'0902000008', N'customer.c@hotel.local', N'BK-202603-0003', NULL, N'Confirmed', N'2026-03-17 08:30:00', NULL, 3800000.00, 0.00, 3800000.00, N'UNPAID', N'Chờ check-in ngày 20/03', N'2026-03-17 08:30:00', NULL),
(4, 9, N'Khách Hàng D', N'0902000009', N'customer.d@hotel.local', N'BK-202603-0004', 3, N'Pending', N'2026-03-19 11:20:00', N'2026-03-19 11:35:00', 1900000.00, 285000.00, 1615000.00, N'HOLDING', N'Giữ phòng 15 phút trong giỏ hàng', N'2026-03-19 11:20:00', N'2026-03-19 11:20:00'),
(5, 10, N'Khách Hàng E', N'0902000010', N'customer.e@hotel.local', N'BK-202603-0005', NULL, N'Cancelled', N'2026-03-12 14:00:00', NULL, 900000.00, 0.00, 900000.00, N'FAILED', N'Hủy do quá hạn thanh toán', N'2026-03-12 14:00:00', N'2026-03-12 14:20:00'),
(6, 6, N'Khách Hàng A', N'0902000006', N'customer.a@hotel.local', N'BK-202602-0006', NULL, N'Completed', N'2026-02-20 10:00:00', NULL, 5000000.00, 0.00, 5000000.00, N'REFUNDED', N'Đã hoàn tiền một phần sau khiếu nại', N'2026-02-20 10:00:00', N'2026-02-25 18:00:00')
SET IDENTITY_INSERT [dbo].[Bookings] OFF
GO

SET IDENTITY_INSERT [dbo].[Booking_Details] ON
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night], [adults_count], [children_count], [nights], [early_check_in_fee], [late_check_out_fee], [line_total], [status], [identity_document_url], [identity_document_public_id], [actual_check_in_at], [actual_check_out_at], [created_at], [updated_at]) VALUES
(1, 1, 1, 1, N'2026-03-04 14:00:00', N'2026-03-06 12:00:00', 850000.00, 2, 0, 2, 0.00, 0.00, 1700000.00, N'Checked_out', N'https://res.cloudinary.com/demo/image/upload/v1/identity/booking1.jpg', N'identity/booking1', N'2026-03-04 14:15:00', N'2026-03-06 11:45:00', N'2026-03-03 09:00:00', N'2026-03-06 11:45:00'),
(2, 2, 5, 3, N'2026-03-18 14:00:00', N'2026-03-21 12:00:00', 1450000.00, 2, 2, 3, 0.00, 0.00, 4350000.00, N'Checked_in', N'https://res.cloudinary.com/demo/image/upload/v1/identity/booking2-room1.jpg', N'identity/booking2-room1', N'2026-03-18 14:05:00', NULL, N'2026-03-10 10:15:00', N'2026-03-18 14:05:00'),
(3, 2, 2, 1, N'2026-03-18 14:00:00', N'2026-03-21 12:00:00', 850000.00, 2, 0, 3, 150000.00, 0.00, 2700000.00, N'Checked_in', N'https://res.cloudinary.com/demo/image/upload/v1/identity/booking2-room2.jpg', N'identity/booking2-room2', N'2026-03-18 13:00:00', NULL, N'2026-03-10 10:15:00', N'2026-03-18 13:00:00'),
(4, 3, 7, 4, N'2026-03-20 14:00:00', N'2026-03-22 12:00:00', 1900000.00, 2, 1, 2, 0.00, 0.00, 3800000.00, N'Booked', NULL, NULL, NULL, NULL, N'2026-03-17 08:30:00', NULL),
(5, 4, 8, 4, N'2026-03-21 14:00:00', N'2026-03-22 12:00:00', 1900000.00, 2, 0, 1, 0.00, 0.00, 1900000.00, N'Holding', NULL, NULL, NULL, NULL, N'2026-03-19 11:20:00', N'2026-03-19 11:20:00'),
(6, 5, 4, 2, N'2026-03-15 14:00:00', N'2026-03-16 12:00:00', 900000.00, 2, 0, 1, 0.00, 0.00, 900000.00, N'Cancelled', NULL, NULL, NULL, NULL, N'2026-03-12 14:00:00', N'2026-03-12 14:20:00'),
(7, 6, 9, 5, N'2026-02-22 14:00:00', N'2026-02-23 16:00:00', 4500000.00, 2, 0, 1, 0.00, 500000.00, 5000000.00, N'Checked_out', N'https://res.cloudinary.com/demo/image/upload/v1/identity/booking6.jpg', N'identity/booking6', N'2026-02-22 14:05:00', N'2026-02-23 16:05:00', N'2026-02-20 10:00:00', N'2026-02-23 16:05:00')
SET IDENTITY_INSERT [dbo].[Booking_Details] OFF
GO

SET IDENTITY_INSERT [dbo].[Order_Services] ON
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_code], [order_date], [total_amount], [status], [notes], [created_at], [updated_at]) VALUES
(1, 2, N'OS-202603-0001', N'2026-03-18 19:00:00', 300000.00, N'Completed', N'Gọi buffet sáng cho 2 người', N'2026-03-18 19:00:00', N'2026-03-19 07:00:00'),
(2, 3, N'OS-202603-0002', N'2026-03-18 21:30:00', 170000.00, N'Pending', N'Nước cam và sandwich', N'2026-03-18 21:30:00', NULL),
(3, 7, N'OS-202602-0003', N'2026-02-22 20:00:00', 650000.00, N'Cancelled', N'Khách hủy dịch vụ massage', N'2026-02-22 20:00:00', N'2026-02-22 20:15:00')
SET IDENTITY_INSERT [dbo].[Order_Services] OFF
GO

SET IDENTITY_INSERT [dbo].[Order_Service_Details] ON
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price], [line_total], [notes]) VALUES
(1, 1, 1, 2, 150000.00, 300000.00, N'Ưu đãi nội bộ'),
(2, 2, 2, 1, 120000.00, 120000.00, NULL),
(3, 2, 6, 1, 50000.00, 50000.00, N'Giảm giá giờ vàng'),
(4, 3, 5, 1, 650000.00, 650000.00, N'Đơn đã hủy')
SET IDENTITY_INSERT [dbo].[Order_Service_Details] OFF
GO

SET IDENTITY_INSERT [dbo].[Loss_And_Damages] ON
INSERT [dbo].[Loss_And_Damages] ([id], [booking_detail_id], [room_inventory_id], [quantity], [penalty_amount], [description], [evidence_image_url], [evidence_public_id], [status], [created_at], [updated_at]) VALUES
(1, 3, 3, 1, 250000.00, N'Mất 1 áo choàng tắm sau check-in.', N'https://res.cloudinary.com/demo/image/upload/v1/damages/bathrobe-missing.jpg', N'damages/bathrobe-missing', N'OPEN', N'2026-03-19 08:00:00', NULL),
(2, 7, 9, 1, 650000.00, N'Vỡ bộ ly pha lê trong phòng VIP.', N'https://res.cloudinary.com/demo/image/upload/v1/damages/glass-broken.jpg', N'damages/glass-broken', N'RESOLVED', N'2026-02-23 15:30:00', N'2026-02-25 10:00:00')
SET IDENTITY_INSERT [dbo].[Loss_And_Damages] OFF
GO

SET IDENTITY_INSERT [dbo].[Invoices] ON
INSERT [dbo].[Invoices] ([id], [booking_id], [invoice_code], [total_room_amount], [total_service_amount], [total_damage_amount], [discount_amount], [manual_adjustment_amount], [tax_amount], [final_total], [refund_amount], [status], [notes], [issued_at], [paid_at], [created_at], [updated_at]) VALUES
(1, 1, N'INV-202603-0001', 1700000.00, 0.00, 0.00, 170000.00, 0.00, 153000.00, 1683000.00, 0.00, N'Paid', N'Hóa đơn hoàn tất cho booking 1', N'2026-03-06 11:30:00', N'2026-03-06 11:40:00', N'2026-03-06 11:30:00', N'2026-03-06 11:40:00'),
(2, 2, N'INV-202603-0002', 7050000.00, 470000.00, 250000.00, 200000.00, 0.00, 757000.00, 8327000.00, 0.00, N'Draft', N'Hóa đơn nháp đang lưu trú', N'2026-03-19 08:30:00', NULL, N'2026-03-19 08:30:00', NULL),
(3, 6, N'INV-202602-0003', 5000000.00, 0.00, 650000.00, 0.00, -200000.00, 545000.00, 5995000.00, 1000000.00, N'Refunded', N'Hoàn tiền 1.000.000 do khách phản ánh dịch vụ', N'2026-02-23 16:30:00', N'2026-02-23 16:35:00', N'2026-02-23 16:30:00', N'2026-02-25 18:00:00')
SET IDENTITY_INSERT [dbo].[Invoices] OFF
GO

SET IDENTITY_INSERT [dbo].[Payments] ON
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date], [payment_direction], [gateway_name], [provider_response], [status], [created_at]) VALUES
(1, 1, N'VNPAY', 1683000.00, N'TXN-VNPAY-0001', N'2026-03-06 11:40:00', N'IN', N'VNPAY', N'{"status":"00","message":"Success"}', N'SUCCESS', N'2026-03-06 11:40:00'),
(2, 2, N'CASH', 3000000.00, N'TXN-CASH-0002', N'2026-03-18 14:10:00', N'IN', N'FRONT_DESK', N'{"note":"Deposit at check-in"}', N'SUCCESS', N'2026-03-18 14:10:00'),
(3, 3, N'MOMO', 5995000.00, N'TXN-MOMO-0003', N'2026-02-23 16:35:00', N'IN', N'MOMO', N'{"status":"0","message":"Captured"}', N'SUCCESS', N'2026-02-23 16:35:00'),
(4, 3, N'MOMO', -1000000.00, N'RF-MOMO-0004', N'2026-02-25 18:00:00', N'OUT', N'MOMO', N'{"status":"0","message":"Refunded"}', N'REFUNDED', N'2026-02-25 18:00:00'),
(5, 2, N'VNPAY', 0.00, N'TXN-VNPAY-FAILED-0005', N'2026-03-19 09:00:00', N'IN', N'VNPAY', N'{"status":"99","message":"Pending webhook"}', N'PENDING', N'2026-03-19 09:00:00')
SET IDENTITY_INSERT [dbo].[Payments] OFF
GO

SET IDENTITY_INSERT [dbo].[Reviews] ON
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [image_url], [image_public_id], [is_approved], [status], [created_at], [updated_at]) VALUES
(1, 6, 1, 5, N'Phòng sạch, check-in nhanh, nhân viên thân thiện.', N'https://res.cloudinary.com/demo/image/upload/v1/reviews/review1.jpg', N'reviews/review1', 1, N'VISIBLE', N'2026-03-06 12:00:00', NULL),
(2, 7, 3, 4, N'Phòng rộng, phù hợp gia đình nhưng minibar hơi ít lựa chọn.', N'https://res.cloudinary.com/demo/image/upload/v1/reviews/review2.jpg', N'reviews/review2', 1, N'VISIBLE', N'2026-03-19 09:30:00', NULL),
(3, 8, 4, 2, N'View đẹp nhưng khách phản ánh tiếng ồn ngoài hành lang.', NULL, NULL, 0, N'HIDDEN', N'2026-03-15 18:00:00', N'2026-03-16 08:00:00'),
(4, 9, 5, 5, N'Trải nghiệm VIP rất tốt, hoàn toàn xứng đáng.', N'https://res.cloudinary.com/demo/image/upload/v1/reviews/review4.jpg', N'reviews/review4', 1, N'VISIBLE', N'2026-02-24 17:00:00', NULL)
SET IDENTITY_INSERT [dbo].[Reviews] OFF
GO

SET IDENTITY_INSERT [dbo].[Audit_Logs] ON
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [reason], [created_at]) VALUES
(1, 2, N'CREATE_VOUCHER', N'Vouchers', 2, N'{}', N'{"code":"SPRING200K","status":"ACTIVE"}', N'Tạo mã khuyến mãi chiến dịch mùa xuân', N'2026-03-02 13:05:00'),
(2, 2, N'DISABLE_VOUCHER', N'Vouchers', 4, N'{"status":"ACTIVE"}', N'{"status":"INACTIVE"}', N'Đã dùng gần hết quota, tạm dừng để tránh overbooking', N'2026-03-18 17:00:00'),
(3, 3, N'CHANGE_ROOM', N'Booking_Details', 3, N'{"room_id":1}', N'{"room_id":2}', N'Khách yêu cầu đổi sang phòng gần thang máy', N'2026-03-18 13:00:00'),
(4, 2, N'HIDE_REVIEW', N'Reviews', 3, N'{"is_approved":true,"status":"VISIBLE"}', N'{"is_approved":false,"status":"HIDDEN"}', N'Ẩn đánh giá trong lúc xác minh nội dung phản ánh', N'2026-03-16 08:00:00'),
(5, 5, N'REFUND_PAYMENT', N'Payments', 4, N'{"refund_amount":0}', N'{"refund_amount":1000000}', N'Hoàn tiền một phần do khiếu nại hợp lệ của khách', N'2026-02-25 18:00:00'),
(6, 4, N'UPDATE_DAMAGE_REPORT', N'Loss_And_Damages', 2, N'{"status":"OPEN"}', N'{"status":"RESOLVED"}', N'Khách đã thanh toán phí bồi thường tại quầy', N'2026-02-25 10:00:00')
SET IDENTITY_INSERT [dbo].[Audit_Logs] OFF
GO


PRINT N'HotelManagementDB has been recreated and seeded successfully.';
PRINT N'Sample login password for seeded users: Password@123';
GO
