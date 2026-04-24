BEGIN TRANSACTION;
ALTER TABLE [Vouchers] DROP CONSTRAINT [DF_Vouchers_CreatedAt];
ALTER TABLE [Vouchers] DROP COLUMN [created_at];

DECLARE @var nvarchar(max);
SELECT @var = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Vouchers]') AND [c].[name] = N'min_booking_amount');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [Vouchers] DROP CONSTRAINT ' + @var + ';');
ALTER TABLE [Vouchers] DROP COLUMN [min_booking_amount];

ALTER TABLE [Vouchers] DROP CONSTRAINT [DF_Vouchers_Status];
ALTER TABLE [Vouchers] DROP COLUMN [status];

DECLARE @var1 nvarchar(max);
SELECT @var1 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Vouchers]') AND [c].[name] = N'updated_at');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Vouchers] DROP CONSTRAINT ' + @var1 + ';');
ALTER TABLE [Vouchers] DROP COLUMN [updated_at];

DECLARE @var2 nvarchar(max);
SELECT @var2 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Vouchers]') AND [c].[name] = N'used_count');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Vouchers] DROP CONSTRAINT ' + @var2 + ';');
ALTER TABLE [Vouchers] DROP COLUMN [used_count];

ALTER TABLE [RoomType_Amenities] DROP CONSTRAINT [DF_RoomTypeAmenities_CreatedAt];
ALTER TABLE [RoomType_Amenities] DROP COLUMN [created_at];

ALTER TABLE [Room_Inventory] DROP CONSTRAINT [DF_RoomInventory_CreatedAt];
ALTER TABLE [Room_Inventory] DROP COLUMN [created_at];

DECLARE @var3 nvarchar(max);
SELECT @var3 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Room_Inventory]') AND [c].[name] = N'item_name');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Room_Inventory] DROP CONSTRAINT ' + @var3 + ';');
ALTER TABLE [Room_Inventory] DROP COLUMN [item_name];

ALTER TABLE [Room_Inventory] DROP CONSTRAINT [DF_RoomInventory_Status];
ALTER TABLE [Room_Inventory] DROP COLUMN [status];

DECLARE @var4 nvarchar(max);
SELECT @var4 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Room_Inventory]') AND [c].[name] = N'unit');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [Room_Inventory] DROP CONSTRAINT ' + @var4 + ';');
ALTER TABLE [Room_Inventory] DROP COLUMN [unit];

DECLARE @var5 nvarchar(max);
SELECT @var5 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Room_Inventory]') AND [c].[name] = N'updated_at');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Room_Inventory] DROP CONSTRAINT ' + @var5 + ';');
ALTER TABLE [Room_Inventory] DROP COLUMN [updated_at];

EXEC sp_rename N'[Notifications].[Type]', N'type', 'COLUMN';

EXEC sp_rename N'[Notifications].[Title]', N'title', 'COLUMN';

EXEC sp_rename N'[Notifications].[Content]', N'content', 'COLUMN';

EXEC sp_rename N'[Notifications].[Id]', N'id', 'COLUMN';

EXEC sp_rename N'[Notifications].[UserId]', N'user_id', 'COLUMN';

EXEC sp_rename N'[Notifications].[ReferenceLink]', N'reference_link', 'COLUMN';

EXEC sp_rename N'[Notifications].[IsRead]', N'is_read', 'COLUMN';

EXEC sp_rename N'[Notifications].[CreatedAt]', N'created_at', 'COLUMN';

EXEC sp_rename N'[Notifications].[IX_Notifications_UserId]', N'IX_Notifications_user_id', 'INDEX';

DECLARE @var6 nvarchar(max);
SELECT @var6 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Vouchers]') AND [c].[name] = N'min_booking_value');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [Vouchers] DROP CONSTRAINT ' + @var6 + ';');
ALTER TABLE [Vouchers] ALTER COLUMN [min_booking_value] decimal(18,2) NULL;

ALTER TABLE [Room_Inventory] DROP CONSTRAINT [DF_RoomInventory_Quantity];
ALTER TABLE [Room_Inventory] ALTER COLUMN [quantity] int NOT NULL;
ALTER TABLE [Room_Inventory] ADD DEFAULT 1 FOR [quantity];

ALTER TABLE [Room_Inventory] DROP CONSTRAINT [DF_RoomInventory_ItemType];
ALTER TABLE [Room_Inventory] ALTER COLUMN [item_type] nvarchar(50) NOT NULL;
ALTER TABLE [Room_Inventory] ADD DEFAULT N'Asset' FOR [item_type];

ALTER TABLE [Room_Inventory] ADD [EquipmentId] int NOT NULL DEFAULT 0;

ALTER TABLE [Room_Inventory] ADD [is_active] bit NULL DEFAULT CAST(1 AS bit);

ALTER TABLE [Room_Inventory] ADD [note] nvarchar(255) NULL;

DECLARE @var7 nvarchar(max);
SELECT @var7 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Invoices]') AND [c].[name] = N'total_service_amount');
IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [Invoices] DROP CONSTRAINT ' + @var7 + ';');
ALTER TABLE [Invoices] ALTER COLUMN [total_service_amount] decimal(18,2) NULL;

DECLARE @var8 nvarchar(max);
SELECT @var8 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Invoices]') AND [c].[name] = N'total_room_amount');
IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [Invoices] DROP CONSTRAINT ' + @var8 + ';');
ALTER TABLE [Invoices] ALTER COLUMN [total_room_amount] decimal(18,2) NULL;

DECLARE @var9 nvarchar(max);
SELECT @var9 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Invoices]') AND [c].[name] = N'total_damage_amount');
IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [Invoices] DROP CONSTRAINT ' + @var9 + ';');
ALTER TABLE [Invoices] ALTER COLUMN [total_damage_amount] decimal(18,2) NULL;

DECLARE @var10 nvarchar(max);
SELECT @var10 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Invoices]') AND [c].[name] = N'tax_amount');
IF @var10 IS NOT NULL EXEC(N'ALTER TABLE [Invoices] DROP CONSTRAINT ' + @var10 + ';');
ALTER TABLE [Invoices] ALTER COLUMN [tax_amount] decimal(18,2) NULL;

ALTER TABLE [Invoices] DROP CONSTRAINT [DF_Invoices_Status];
ALTER TABLE [Invoices] ALTER COLUMN [status] nvarchar(50) NULL;
ALTER TABLE [Invoices] ADD CONSTRAINT [DF_Invoices_Status] DEFAULT N'Draft' FOR [status];

DECLARE @var11 nvarchar(max);
SELECT @var11 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Invoices]') AND [c].[name] = N'refund_amount');
IF @var11 IS NOT NULL EXEC(N'ALTER TABLE [Invoices] DROP CONSTRAINT ' + @var11 + ';');
ALTER TABLE [Invoices] ALTER COLUMN [refund_amount] decimal(18,2) NULL;

DECLARE @var12 nvarchar(max);
SELECT @var12 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Invoices]') AND [c].[name] = N'manual_adjustment_amount');
IF @var12 IS NOT NULL EXEC(N'ALTER TABLE [Invoices] DROP CONSTRAINT ' + @var12 + ';');
ALTER TABLE [Invoices] ALTER COLUMN [manual_adjustment_amount] decimal(18,2) NULL;

DECLARE @var13 nvarchar(max);
SELECT @var13 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Invoices]') AND [c].[name] = N'invoice_code');
IF @var13 IS NOT NULL EXEC(N'ALTER TABLE [Invoices] DROP CONSTRAINT ' + @var13 + ';');
ALTER TABLE [Invoices] ALTER COLUMN [invoice_code] nvarchar(50) NULL;

DECLARE @var14 nvarchar(max);
SELECT @var14 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Invoices]') AND [c].[name] = N'final_total');
IF @var14 IS NOT NULL EXEC(N'ALTER TABLE [Invoices] DROP CONSTRAINT ' + @var14 + ';');
ALTER TABLE [Invoices] ALTER COLUMN [final_total] decimal(18,2) NULL;

DECLARE @var15 nvarchar(max);
SELECT @var15 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Invoices]') AND [c].[name] = N'discount_amount');
IF @var15 IS NOT NULL EXEC(N'ALTER TABLE [Invoices] DROP CONSTRAINT ' + @var15 + ';');
ALTER TABLE [Invoices] ALTER COLUMN [discount_amount] decimal(18,2) NULL;

ALTER TABLE [Invoices] DROP CONSTRAINT [DF_Invoices_CreatedAt];
ALTER TABLE [Invoices] ALTER COLUMN [created_at] datetime NULL;
ALTER TABLE [Invoices] ADD CONSTRAINT [DF_Invoices_CreatedAt] DEFAULT ((getdate())) FOR [created_at];

ALTER TABLE [Bookings] ADD [DepositAmount] decimal(18,2) NOT NULL DEFAULT 0.0;

ALTER TABLE [Booking_Details] ADD [settled_at] datetime NULL;

ALTER TABLE [Booking_Details] ADD [settlement_status] nvarchar(50) NOT NULL CONSTRAINT [DF_BookingDetails_SettlementStatus] DEFAULT N'UNPAID';

ALTER TABLE [Room_Inventory] ADD CONSTRAINT [PKRoom_Inv3213E83F11FADD17] PRIMARY KEY ([id]);

CREATE TABLE [Equipments] (
    [Id] int NOT NULL IDENTITY,
    [ItemCode] nvarchar(50) NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    [Category] nvarchar(100) NOT NULL,
    [Unit] nvarchar(50) NOT NULL,
    [TotalQuantity] int NOT NULL,
    [InUseQuantity] int NOT NULL,
    [DamagedQuantity] int NOT NULL,
    [LiquidatedQuantity] int NOT NULL,
    [BasePrice] decimal(18,2) NOT NULL,
    [DefaultPriceIfLost] decimal(18,2) NOT NULL,
    [Supplier] nvarchar(255) NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime NULL,
    [UpdatedAt] datetime NULL,
    [ImageUrl] nvarchar(max) NULL,
    CONSTRAINT [PK_Equipments] PRIMARY KEY ([Id])
);

CREATE TABLE [Invoice_Booking_Details] (
    [id] int NOT NULL IDENTITY,
    [invoice_id] int NOT NULL,
    [booking_detail_id] int NOT NULL,
    [room_charge] decimal(18,2) NOT NULL,
    [service_charge] decimal(18,2) NOT NULL,
    [damage_charge] decimal(18,2) NOT NULL,
    [discount_amount] decimal(18,2) NOT NULL,
    [extra_fee_amount] decimal(18,2) NOT NULL,
    [tax_amount] decimal(18,2) NOT NULL,
    [line_total] decimal(18,2) NOT NULL,
    [created_at] datetime NOT NULL CONSTRAINT [DF_InvoiceBookingDetails_CreatedAt] DEFAULT ((getdate())),
    CONSTRAINT [PK__InvoiceBookingDetails__3213E83F] PRIMARY KEY ([id]),
    CONSTRAINT [FK_InvoiceBookingDetails_BookingDetails] FOREIGN KEY ([booking_detail_id]) REFERENCES [Booking_Details] ([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_InvoiceBookingDetails_Invoices] FOREIGN KEY ([invoice_id]) REFERENCES [Invoices] ([id]) ON DELETE CASCADE
);

CREATE TABLE [User_Permissions] (
    [user_id] int NOT NULL,
    [permission_id] int NOT NULL,
    [is_granted] bit NOT NULL,
    CONSTRAINT [PK_User_Permissions] PRIMARY KEY ([user_id], [permission_id]),
    CONSTRAINT [FK_User_Permissions_Permissions_permission_id] FOREIGN KEY ([permission_id]) REFERENCES [Permissions] ([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_User_Permissions_Users_user_id] FOREIGN KEY ([user_id]) REFERENCES [Users] ([id]) ON DELETE CASCADE
);

CREATE INDEX [IX_Room_Inventory_EquipmentId] ON [Room_Inventory] ([EquipmentId]);

CREATE UNIQUE INDEX [UQ_Invoices_Code] ON [Invoices] ([invoice_code]) WHERE [invoice_code] IS NOT NULL;

CREATE INDEX [IX_InvoiceBookingDetails_BookingDetail] ON [Invoice_Booking_Details] ([booking_detail_id]);

CREATE UNIQUE INDEX [UQ_InvoiceBookingDetails_InvoiceDetail] ON [Invoice_Booking_Details] ([invoice_id], [booking_detail_id]);

CREATE INDEX [IX_User_Permissions_permission_id] ON [User_Permissions] ([permission_id]);

ALTER TABLE [Notifications] ADD CONSTRAINT [FK_Notifications_Users_user_id] FOREIGN KEY ([user_id]) REFERENCES [Users] ([id]);

ALTER TABLE [Room_Inventory] ADD CONSTRAINT [FK_Room_Inventory_Equipments_EquipmentId] FOREIGN KEY ([EquipmentId]) REFERENCES [Equipments] ([Id]) ON DELETE CASCADE;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260424140949_AddDepositAmount', N'10.0.5');

COMMIT;
GO

