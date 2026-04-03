-- Chèn đoạn này lên TRÊN CÙNG của file
IF DB_ID(N'HotelManagementDB') IS NULL
BEGIN
    CREATE DATABASE [HotelManagementDB];
END
GO

USE [HotelManagementDB]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Amenities](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[icon_url] [nvarchar](max) NULL,
	[is_active] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Article_Categories]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Article_Categories](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[is_active] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Articles]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Articles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[category_id] [int] NULL,
	[author_id] [int] NULL,
	[title] [nvarchar](max) NOT NULL,
	[slug] [nvarchar](255) NULL,
	[content] [nvarchar](max) NULL,
	[thumbnail_url] [nvarchar](max) NULL,
	[published_at] [datetime] NULL,
	[is_active] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Attractions]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Attractions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[distance_km] [decimal](5, 2) NULL,
	[description] [nvarchar](max) NULL,
	[map_embed_link] [nvarchar](max) NULL,
	[latitude] [decimal](10, 8) NULL,
	[longitude] [decimal](11, 8) NULL,
	[address] [nvarchar](500) NULL,
	[is_active] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Audit_Logs]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Audit_Logs](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[action] [nvarchar](50) NOT NULL,
	[table_name] [nvarchar](100) NOT NULL,
	[record_id] [int] NOT NULL,
	[old_value] [nvarchar](max) NULL,
	[new_value] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Booking_Details]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Booking_Details](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[booking_id] [int] NULL,
	[room_id] [int] NULL,
	[room_type_id] [int] NULL,
	[check_in_date] [datetime] NOT NULL,
	[check_out_date] [datetime] NOT NULL,
	[price_per_night] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Bookings]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Bookings](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[guest_name] [nvarchar](255) NULL,
	[guest_phone] [nvarchar](50) NULL,
	[guest_email] [nvarchar](255) NULL,
	[booking_code] [nvarchar](50) NOT NULL,
	[voucher_id] [int] NULL,
	[status] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Equipments]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Equipments](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ItemCode] [varchar](50) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Category] [nvarchar](100) NOT NULL,
	[Unit] [nvarchar](50) NOT NULL,
	[TotalQuantity] [int] NOT NULL,
	[InUseQuantity] [int] NOT NULL,
	[DamagedQuantity] [int] NOT NULL,
	[LiquidatedQuantity] [int] NOT NULL,
	[InStockQuantity]  AS ((([TotalQuantity]-[InUseQuantity])-[DamagedQuantity])-[LiquidatedQuantity]),
	[BasePrice] [decimal](18, 2) NOT NULL,
	[DefaultPriceIfLost] [decimal](18, 2) NOT NULL,
	[Supplier] [nvarchar](255) NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
	[ImageUrl] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Invoices]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Invoices](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[booking_id] [int] NULL,
	[total_room_amount] [decimal](18, 2) NULL,
	[total_service_amount] [decimal](18, 2) NULL,
	[discount_amount] [decimal](18, 2) NULL,
	[tax_amount] [decimal](18, 2) NULL,
	[final_total] [decimal](18, 2) NULL,
	[status] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Loss_And_Damages]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Loss_And_Damages](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[booking_detail_id] [int] NULL,
	[room_inventory_id] [int] NULL,
	[quantity] [int] NOT NULL,
	[penalty_amount] [decimal](18, 2) NOT NULL,
	[description] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[ImageUrl] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Memberships]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Memberships](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[tier_name] [nvarchar](100) NOT NULL,
	[min_points] [int] NULL,
	[discount_percent] [decimal](5, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Notifications]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Notifications](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[title] [nvarchar](255) NOT NULL,
	[content] [nvarchar](max) NOT NULL,
	[type] [varchar](50) NULL,
	[reference_link] [varchar](255) NULL,
	[is_read] [bit] NOT NULL,
	[created_at] [datetime] NULL,
 CONSTRAINT [PK_Notifications] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Order_Service_Details]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Order_Service_Details](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_service_id] [int] NULL,
	[service_id] [int] NULL,
	[quantity] [int] NOT NULL,
	[unit_price] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Order_Services]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Order_Services](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[booking_detail_id] [int] NULL,
	[order_date] [datetime] NULL,
	[total_amount] [decimal](18, 2) NULL,
	[status] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Payments]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Payments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[invoice_id] [int] NULL,
	[payment_method] [nvarchar](50) NULL,
	[amount_paid] [decimal](18, 2) NOT NULL,
	[transaction_code] [nvarchar](100) NULL,
	[payment_date] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Permissions]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Permissions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Reviews]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Reviews](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[room_type_id] [int] NULL,
	[rating] [int] NULL,
	[comment] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Role_Permissions]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Role_Permissions](
	[role_id] [int] NOT NULL,
	[permission_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[role_id] ASC,
	[permission_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Roles]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Room_Images]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Room_Images](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[room_type_id] [int] NULL,
	[image_url] [nvarchar](max) NOT NULL,
	[is_primary] [bit] NULL,
	[is_active] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Room_Inventory]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
/****** Object:  Table [dbo].[Room_Types]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Room_Types](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[base_price] [decimal](18, 2) NOT NULL,
	[capacity_adults] [int] NOT NULL,
	[capacity_children] [int] NOT NULL,
	[description] [nvarchar](max) NULL,
	[size_sqm] [int] NULL,
	[bed_type] [nvarchar](100) NULL,
	[view_type] [nvarchar](100) NULL,
	[is_active] [bit] NULL,
	[slug] [varchar](255) NULL,
	[content] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Rooms]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Rooms](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[room_type_id] [int] NULL,
	[room_number] [nvarchar](50) NOT NULL,
	[floor] [int] NULL,
	[status] [nvarchar](50) NULL,
	[cleaning_status] [varchar](50) NULL,
	[extension_number] [varchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoomType_Amenities]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoomType_Amenities](
	[room_type_id] [int] NOT NULL,
	[amenity_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[room_type_id] ASC,
	[amenity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Service_Categories]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Service_Categories](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Services]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Services](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[category_id] [int] NULL,
	[name] [nvarchar](255) NOT NULL,
	[price] [decimal](18, 2) NOT NULL,
	[unit] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[role_id] [int] NULL,
	[membership_id] [int] NULL,
	[full_name] [nvarchar](255) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[phone] [nvarchar](50) NULL,
	[password_hash] [nvarchar](max) NOT NULL,
	[status] [bit] NULL,
	[avatar_url] [nvarchar](255) NULL,
	[created_at] [datetime] NULL,
	[date_of_birth] [date] NULL,
	[address] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Vouchers]    Script Date: 3/28/2026 9:25:30 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Vouchers](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[code] [nvarchar](50) NOT NULL,
	[discount_type] [nvarchar](50) NOT NULL,
	[discount_value] [decimal](18, 2) NOT NULL,
	[min_booking_value] [decimal](18, 2) NULL,
	[valid_from] [datetime] NULL,
	[valid_to] [datetime] NULL,
	[usage_limit] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Amenities] ON 

INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (1, N'Wifi Miễn Phí', N'wifi.png', 1)
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (2, N'Smart TV', N'tv.png', 1)
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (3, N'Điều Hòa', N'ac.png', 1)
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (4, N'Bồn Tắm Sứ', N'bathtub.png', 1)
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (5, N'Ban Công', N'balcony.png', 1)
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (6, N'Minibar', N'minibar.png', 1)
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (7, N'Két Sắt', N'safe.png', 1)
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (8, N'Máy Sấy Tóc', N'hairdryer.png', 1)
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (9, N'Máy Pha Cà Phê', N'coffee.png', 1)
INSERT [dbo].[Amenities] ([id], [name], [icon_url], [is_active]) VALUES (10, N'Bàn Làm Việc', N'desk.png', 1)
SET IDENTITY_INSERT [dbo].[Amenities] OFF
GO
SET IDENTITY_INSERT [dbo].[Article_Categories] ON 

INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (1, N'Tin Tức Khách Sạn', NULL)
INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (2, N'Cẩm Nang Du Lịch', NULL)
INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (3, N'Khám Phá Ẩm Thực', NULL)
INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (4, N'Sự Kiện & Lễ Hội', NULL)
INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (5, N'Chương Trình Khuyến Mãi', NULL)
INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (6, N'Văn Hóa Địa Phương', NULL)
INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (7, N'Hướng Dẫn Di Chuyển', NULL)
INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (8, N'Góc Thư Giãn', NULL)
INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (9, N'Hỏi Đáp (FAQ)', NULL)
INSERT [dbo].[Article_Categories] ([id], [name], [is_active]) VALUES (10, N'Thư Viện Ảnh', NULL)
SET IDENTITY_INSERT [dbo].[Article_Categories] OFF
GO
SET IDENTITY_INSERT [dbo].[Articles] ON 

INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (1, 1, 1, N'Khai trương nhà hàng mới', N'khai-truong-nha-hang', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (2, 2, 2, N'5 điểm đến không thể bỏ lỡ', N'5-diem-den', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (3, 3, 3, N'Món ngon hải sản địa phương', N'mon-ngon-hai-san', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (4, 4, 1, N'Sự kiện đếm ngược năm mới', N'su-kien-nam-moi', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (5, 5, 2, N'Khuyến mãi mùa hè 2026', N'khuyen-mai-mua-he', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (6, 6, 3, N'Lịch sử văn hóa vùng miền', N'lich-su-van-hoa', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (7, 7, 1, N'Từ sân bay về khách sạn', N'tu-san-bay-ve-ks', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (8, 8, 2, N'Cách thư giãn cuối tuần', N'cach-thu-gian', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (9, 9, 3, N'Quy định nhận trả phòng', N'quy-dinh-nhan-tra', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
INSERT [dbo].[Articles] ([id], [category_id], [author_id], [title], [slug], [content], [thumbnail_url], [published_at], [is_active]) VALUES (10, 10, 1, N'Bộ ảnh resort flycam', N'bo-anh-resort', N'Nội dung...', NULL, CAST(N'2026-03-06T22:07:35.023' AS DateTime), NULL)
SET IDENTITY_INSERT [dbo].[Articles] OFF
GO
SET IDENTITY_INSERT [dbo].[Attractions] ON 

INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (1, N'Chợ Trung Tâm', CAST(1.50 AS Decimal(5, 2)), N'Khu chợ truyền thống sầm uất', N'link_map_1', NULL, NULL, NULL, NULL)
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (2, N'Bãi Biển Chính', CAST(0.50 AS Decimal(5, 2)), N'Bãi tắm công cộng tuyệt đẹp', N'link_map_2', NULL, NULL, NULL, NULL)
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (3, N'Bảo Tàng Thành Phố', CAST(3.00 AS Decimal(5, 2)), N'Lưu giữ giá trị lịch sử', N'link_map_3', NULL, NULL, NULL, NULL)
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (4, N'Phố Đi Bộ', CAST(1.00 AS Decimal(5, 2)), N'Khu vực vui chơi giải trí về đêm', N'link_map_4', NULL, NULL, NULL, NULL)
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (5, N'Chùa Cổ Lịch Sử', CAST(5.50 AS Decimal(5, 2)), N'Ngôi chùa linh thiêng', N'link_map_5', NULL, NULL, NULL, NULL)
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (6, N'Khu Vui Chơi Giải Trí', CAST(8.00 AS Decimal(5, 2)), N'Công viên trò chơi quy mô lớn', N'link_map_6', NULL, NULL, NULL, NULL)
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (7, N'Suối Nước Nóng', CAST(15.00 AS Decimal(5, 2)), N'Điểm nghỉ dưỡng thiên nhiên', N'link_map_7', NULL, NULL, NULL, NULL)
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (8, N'Làng Nghề Truyền Thống', CAST(12.00 AS Decimal(5, 2)), N'Trải nghiệm văn hóa bản địa', N'link_map_8', NULL, NULL, NULL, NULL)
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (9, N'Trung Tâm Thương Mại', CAST(2.00 AS Decimal(5, 2)), N'Khu mua sắm cao cấp', N'link_map_9', NULL, NULL, NULL, NULL)
INSERT [dbo].[Attractions] ([id], [name], [distance_km], [description], [map_embed_link], [latitude], [longitude], [address], [is_active]) VALUES (10, N'Điểm Ngắm Hoàng Hôn', CAST(4.00 AS Decimal(5, 2)), N'Nơi có view biển đẹp nhất', N'link_map_10', NULL, NULL, NULL, NULL)
SET IDENTITY_INSERT [dbo].[Attractions] OFF
GO
SET IDENTITY_INSERT [dbo].[Audit_Logs] ON 

INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (1, 1, N'UPDATE', N'Rooms', 1, N'{"status":"Cleaning"}', N'{"status":"Available"}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (2, 2, N'DELETE', N'Bookings', 5, N'{"id":5}', N'{}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (3, 3, N'CREATE', N'Invoices', 1, N'{}', N'{"id":1}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (4, 1, N'UPDATE', N'Users', 6, N'{"status":0}', N'{"status":1}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (5, 2, N'CREATE', N'Services', 1, N'{}', N'{"price":200000}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (6, 3, N'UPDATE', N'Bookings', 2, N'{"status":"Pending"}', N'{"status":"Checked_in"}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (7, 1, N'UPDATE', N'Room_Types', 1, N'{"price":350000}', N'{"price":400000}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (8, 2, N'DELETE', N'Reviews', 8, N'{"id":8}', N'{}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (9, 3, N'CREATE', N'Order_Services', 1, N'{}', N'{"amount":300000}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Audit_Logs] ([id], [user_id], [action], [table_name], [record_id], [old_value], [new_value], [created_at]) VALUES (10, 1, N'UPDATE', N'Vouchers', 1, N'{"limit":50}', N'{"limit":100}', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
SET IDENTITY_INSERT [dbo].[Audit_Logs] OFF
GO
SET IDENTITY_INSERT [dbo].[Booking_Details] ON 

INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (1, 1, 1, 1, CAST(N'2026-03-01T00:00:00.000' AS DateTime), CAST(N'2026-03-03T00:00:00.000' AS DateTime), CAST(400000.00 AS Decimal(18, 2)))
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (2, 2, 2, 2, CAST(N'2026-03-05T00:00:00.000' AS DateTime), CAST(N'2026-03-10T00:00:00.000' AS DateTime), CAST(500000.00 AS Decimal(18, 2)))
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (3, 3, NULL, 3, CAST(N'2026-04-10T00:00:00.000' AS DateTime), CAST(N'2026-04-12T00:00:00.000' AS DateTime), CAST(700000.00 AS Decimal(18, 2)))
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (4, 4, NULL, 4, CAST(N'2026-05-01T00:00:00.000' AS DateTime), CAST(N'2026-05-05T00:00:00.000' AS DateTime), CAST(900000.00 AS Decimal(18, 2)))
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (5, 5, NULL, 5, CAST(N'2026-03-15T00:00:00.000' AS DateTime), CAST(N'2026-03-16T00:00:00.000' AS DateTime), CAST(1200000.00 AS Decimal(18, 2)))
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (6, 6, 6, 6, CAST(N'2026-02-10T00:00:00.000' AS DateTime), CAST(N'2026-02-12T00:00:00.000' AS DateTime), CAST(1500000.00 AS Decimal(18, 2)))
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (7, 7, 7, 7, CAST(N'2026-03-07T00:00:00.000' AS DateTime), CAST(N'2026-03-09T00:00:00.000' AS DateTime), CAST(1800000.00 AS Decimal(18, 2)))
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (8, 8, 13, 8, CAST(N'2026-06-01T00:00:00.000' AS DateTime), CAST(N'2026-06-05T00:00:00.000' AS DateTime), CAST(2500000.00 AS Decimal(18, 2)))
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (9, 9, 9, 9, CAST(N'2026-01-20T00:00:00.000' AS DateTime), CAST(N'2026-01-25T00:00:00.000' AS DateTime), CAST(5000000.00 AS Decimal(18, 2)))
INSERT [dbo].[Booking_Details] ([id], [booking_id], [room_id], [room_type_id], [check_in_date], [check_out_date], [price_per_night]) VALUES (10, 10, 13, 1, CAST(N'2026-03-06T00:00:00.000' AS DateTime), CAST(N'2026-03-08T00:00:00.000' AS DateTime), CAST(8000000.00 AS Decimal(18, 2)))
SET IDENTITY_INSERT [dbo].[Booking_Details] OFF
GO
SET IDENTITY_INSERT [dbo].[Bookings] ON 

INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (1, 6, N'Khách Hàng A', N'0900000006', NULL, N'BK-0001', NULL, N'Completed')
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (2, 7, N'Khách Hàng B', N'0900000007', NULL, N'BK-0002', 1, N'Checked_in')
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (3, 8, N'Khách Hàng C', N'0900000008', NULL, N'BK-0003', NULL, N'Confirmed')
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (4, 9, N'Khách Hàng D', N'0900000009', NULL, N'BK-0004', 2, N'Pending')
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (5, 10, N'Khách Hàng E', N'0900000010', NULL, N'BK-0005', NULL, N'Cancelled')
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (6, NULL, N'Khách Vãng Lai 1', N'0911111111', NULL, N'BK-0006', NULL, N'Completed')
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (7, NULL, N'Khách Vãng Lai 2', N'0922222222', NULL, N'BK-0007', 3, N'Checked_in')
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (8, 6, N'Khách Hàng A', N'0900000006', NULL, N'BK-0008', NULL, N'Confirmed')
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (9, 7, N'Khách Hàng B', N'0900000007', NULL, N'BK-0009', NULL, N'Completed')
INSERT [dbo].[Bookings] ([id], [user_id], [guest_name], [guest_phone], [guest_email], [booking_code], [voucher_id], [status]) VALUES (10, 8, N'Khách Hàng C', N'0900000008', NULL, N'BK-0010', 4, N'Checked_in')
SET IDENTITY_INSERT [dbo].[Bookings] OFF
GO
SET IDENTITY_INSERT [dbo].[Equipments] ON 

INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (1, N'TV-SS-43', N'Smart TV Samsung 43 inch', N'Điện tử', N'Cái', 50, 50, 1, 0, CAST(7500000.00 AS Decimal(18, 2)), CAST(8000000.00 AS Decimal(18, 2)), N'Samsung Vietnam', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T17:31:18.543' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774546277/QuanTriKhachSan/Equipments/cuqwgr36qaagcjkxqz6w.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (2, N'AC-DK-9000', N'Điều hòa Daikin 9000 BTU', N'Điện tử', N'Cái', 50, 55, 0, 0, CAST(8200000.00 AS Decimal(18, 2)), CAST(9000000.00 AS Decimal(18, 2)), N'Daikin Vietnam', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T17:30:04.510' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774546203/QuanTriKhachSan/Equipments/gzxphd2ogyjcqaqwfgdl.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (3, N'MB-AF-50', N'Tủ lạnh Minibar Aqua 50L', N'Điện tử', N'Cái', 55, 58, 2, 0, CAST(2500000.00 AS Decimal(18, 2)), CAST(3000000.00 AS Decimal(18, 2)), N'Aqua', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), NULL, NULL)
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (4, N'HD-PN-1000', N'Máy sấy tóc Panasonic', N'Điện tử', N'Cái', 60, 58, 5, 1, CAST(450000.00 AS Decimal(18, 2)), CAST(600000.00 AS Decimal(18, 2)), N'Điện Máy Xanh', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), NULL, NULL)
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (5, N'KL-SH-17', N'Ấm đun nước siêu tốc Sunhouse', N'Điện tử', N'Cái', 60, 58, 2, 2, CAST(250000.00 AS Decimal(18, 2)), CAST(350000.00 AS Decimal(18, 2)), N'Sunhouse', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), NULL, NULL)
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (6, N'BD-KG-20', N'Giường King Size 2m x 2m2', N'Nội thất', N'Chiếc', 20, 24, 0, 0, CAST(12000000.00 AS Decimal(18, 2)), CAST(15000000.00 AS Decimal(18, 2)), N'Nội thất Hòa Phát', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), NULL, NULL)
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (7, N'BD-SG-12', N'Giường Single 1m2 x 2m', N'Nội thất', N'Chiếc', 40, 41, 0, 0, CAST(5500000.00 AS Decimal(18, 2)), CAST(7000000.00 AS Decimal(18, 2)), N'Nội thất Hòa Phát', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), NULL, NULL)
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (8, N'WD-WD-01', N'Tủ quần áo gỗ công nghiệp', N'Nội thất', N'Cái', 50, 58, 0, 0, CAST(3500000.00 AS Decimal(18, 2)), CAST(5000000.00 AS Decimal(18, 2)), N'Xưởng Gỗ An Cường', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), NULL, NULL)
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (9, N'TB-WK-01', N'Bàn làm việc + Ghế đệm', N'Nội thất', N'Bộ', 50, 54, 1, 0, CAST(2200000.00 AS Decimal(18, 2)), CAST(3000000.00 AS Decimal(18, 2)), N'Nội thất Hòa Phát', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), NULL, NULL)
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (10, N'HG-WD-01', N'Móc treo quần áo bằng gỗ', N'Nội thất', N'Chiếc', 500, 408, 10, 5, CAST(15000.00 AS Decimal(18, 2)), CAST(30000.00 AS Decimal(18, 2)), N'Nhựa Duy Tân', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), NULL, NULL)
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (11, N'TW-BT-01', N'Khăn tắm cotton 70x140cm', N'Đồ vải', N'Chiếc', 200, 110, 5, 10, CAST(85000.00 AS Decimal(18, 2)), CAST(150000.00 AS Decimal(18, 2)), N'Dệt may Thành Công', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T16:28:01.897' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774542481/QuanTriKhachSan/Equipments/t51at52hvtqpdhxb9ikz.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (12, N'TW-FC-01', N'Khăn mặt cotton 30x30cm', N'Đồ vải', N'Chiếc', 200, 108, 2, 5, CAST(25000.00 AS Decimal(18, 2)), CAST(50000.00 AS Decimal(18, 2)), N'Dệt may Thành Công', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T15:50:21.173' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774540220/QuanTriKhachSan/Equipments/gj8owns6gawqmjz91k2m.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (13, N'MT-FT-01', N'Thảm chùi chân', N'Đồ vải', N'Chiếc', 100, 58, 0, 2, CAST(45000.00 AS Decimal(18, 2)), CAST(80000.00 AS Decimal(18, 2)), N'Dệt may Thành Công', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T15:49:47.400' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774540186/QuanTriKhachSan/Equipments/zxzvuqsgdbxly6ifwlv2.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (14, N'BL-DC-01', N'Chăn lông vũ', N'Đồ vải', N'Chiếc', 80, 58, 1, 0, CAST(850000.00 AS Decimal(18, 2)), CAST(1200000.00 AS Decimal(18, 2)), N'Everon', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T15:49:09.747' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774540149/QuanTriKhachSan/Equipments/huzcgbezdzmqlpjqla2n.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (15, N'PL-CT-01', N'Gối tựa lưng / Gối ngủ', N'Đồ vải', N'Chiếc', 150, 108, 0, 0, CAST(150000.00 AS Decimal(18, 2)), CAST(250000.00 AS Decimal(18, 2)), N'Everon', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T15:41:36.917' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774539696/QuanTriKhachSan/Equipments/bjpgyfibnh5y71upb8fo.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (16, N'DR-LV-500', N'Nước suối Lavie 500ml', N'Minibar', N'Chai', 493, 108, -4, 0, CAST(4000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), N'Lavie', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T16:48:30.790' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774538785/QuanTriKhachSan/Equipments/kznyl7dkrsknfv0d2pt2.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (17, N'DR-CC-320', N'Nước ngọt Coca Cola 320ml', N'Minibar', N'Lon', 296, 60, 0, 0, CAST(7000.00 AS Decimal(18, 2)), CAST(20000.00 AS Decimal(18, 2)), N'Coca Cola', 0, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-27T09:17:54.757' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774538766/QuanTriKhachSan/Equipments/qaqy3mnzmvsgfoyvah2a.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (18, N'DR-HB-330', N'Bia Heineken 330ml', N'Minibar', N'Lon', 200, 46, 0, 0, CAST(16000.00 AS Decimal(18, 2)), CAST(35000.00 AS Decimal(18, 2)), N'Heineken', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T15:28:55.683' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774538733/QuanTriKhachSan/Equipments/frbshpj0tetjn3tk8brk.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (19, N'SN-OM-01', N'Mì ly Omachi', N'Minibar', N'Ly', 100, 28, 0, 0, CAST(12000.00 AS Decimal(18, 2)), CAST(25000.00 AS Decimal(18, 2)), N'Masan', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T15:28:50.370' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774538702/QuanTriKhachSan/Equipments/rvl2xfua67yrfqqpq71t.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (20, N'SN-OR-01', N'Bánh Oreo 133g', N'Minibar', N'Hộp', 97, 26, -1, 0, CAST(15000.00 AS Decimal(18, 2)), CAST(30000.00 AS Decimal(18, 2)), N'Mondelez', 1, CAST(N'2026-03-25T14:10:11.023' AS DateTime), CAST(N'2026-03-26T15:24:19.507' AS DateTime), N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774538658/QuanTriKhachSan/Equipments/trawiqiv9m0u4ncvutsr.jpg')
INSERT [dbo].[Equipments] ([Id], [ItemCode], [Name], [Category], [Unit], [TotalQuantity], [InUseQuantity], [DamagedQuantity], [LiquidatedQuantity], [BasePrice], [DefaultPriceIfLost], [Supplier], [IsActive], [CreatedAt], [UpdatedAt], [ImageUrl]) VALUES (21, N'TV-SS-55', N'Tivi SamSung 55 inch', N'Điện tử', N'cái', 5, 2, 0, 0, CAST(15000000.00 AS Decimal(18, 2)), CAST(17000000.00 AS Decimal(18, 2)), N'Điện Máy Xanh', 1, CAST(N'2026-03-26T17:29:39.020' AS DateTime), NULL, N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1774546178/QuanTriKhachSan/Equipments/xmxreisazllzyx0iiuwe.jpg')
SET IDENTITY_INSERT [dbo].[Equipments] OFF
GO
SET IDENTITY_INSERT [dbo].[Invoices] ON 

INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (1, 1, CAST(800000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(80000.00 AS Decimal(18, 2)), CAST(880000.00 AS Decimal(18, 2)), N'Paid')
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (2, 2, CAST(2500000.00 AS Decimal(18, 2)), CAST(200000.00 AS Decimal(18, 2)), CAST(250000.00 AS Decimal(18, 2)), CAST(245000.00 AS Decimal(18, 2)), CAST(2695000.00 AS Decimal(18, 2)), N'Unpaid')
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (3, 3, CAST(1400000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(140000.00 AS Decimal(18, 2)), CAST(1540000.00 AS Decimal(18, 2)), N'Unpaid')
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (4, 4, CAST(3600000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(100000.00 AS Decimal(18, 2)), CAST(350000.00 AS Decimal(18, 2)), CAST(3850000.00 AS Decimal(18, 2)), N'Unpaid')
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (5, 5, CAST(1200000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(120000.00 AS Decimal(18, 2)), CAST(1320000.00 AS Decimal(18, 2)), N'Refunded')
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (6, 6, CAST(3000000.00 AS Decimal(18, 2)), CAST(500000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(350000.00 AS Decimal(18, 2)), CAST(3850000.00 AS Decimal(18, 2)), N'Paid')
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (7, 7, CAST(3600000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(540000.00 AS Decimal(18, 2)), CAST(306000.00 AS Decimal(18, 2)), CAST(3366000.00 AS Decimal(18, 2)), N'Unpaid')
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (8, 8, CAST(10000000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(1000000.00 AS Decimal(18, 2)), CAST(11000000.00 AS Decimal(18, 2)), N'Unpaid')
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (9, 9, CAST(25000000.00 AS Decimal(18, 2)), CAST(1000000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(2600000.00 AS Decimal(18, 2)), CAST(28600000.00 AS Decimal(18, 2)), N'Paid')
INSERT [dbo].[Invoices] ([id], [booking_id], [total_room_amount], [total_service_amount], [discount_amount], [tax_amount], [final_total], [status]) VALUES (10, 10, CAST(16000000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(200000.00 AS Decimal(18, 2)), CAST(1580000.00 AS Decimal(18, 2)), CAST(17380000.00 AS Decimal(18, 2)), N'Unpaid')
SET IDENTITY_INSERT [dbo].[Invoices] OFF
GO
SET IDENTITY_INSERT [dbo].[Loss_And_Damages] ON 

INSERT [dbo].[Loss_And_Damages] ([id], [booking_detail_id], [room_inventory_id], [quantity], [penalty_amount], [description], [created_at], [ImageUrl]) VALUES (24, 10, 135, 1, CAST(15000.00 AS Decimal(18, 2)), NULL, CAST(N'2026-03-27T15:08:59.037' AS DateTime), NULL)
INSERT [dbo].[Loss_And_Damages] ([id], [booking_detail_id], [room_inventory_id], [quantity], [penalty_amount], [description], [created_at], [ImageUrl]) VALUES (25, 10, 136, 2, CAST(20000.00 AS Decimal(18, 2)), NULL, CAST(N'2026-03-27T15:16:06.550' AS DateTime), NULL)
INSERT [dbo].[Loss_And_Damages] ([id], [booking_detail_id], [room_inventory_id], [quantity], [penalty_amount], [description], [created_at], [ImageUrl]) VALUES (26, 10, 137, 1, CAST(30000.00 AS Decimal(18, 2)), NULL, CAST(N'2026-03-27T15:16:37.547' AS DateTime), NULL)
INSERT [dbo].[Loss_And_Damages] ([id], [booking_detail_id], [room_inventory_id], [quantity], [penalty_amount], [description], [created_at], [ImageUrl]) VALUES (31, 2, 118, 2, CAST(20000.00 AS Decimal(18, 2)), NULL, CAST(N'2026-03-27T15:42:13.707' AS DateTime), NULL)
INSERT [dbo].[Loss_And_Damages] ([id], [booking_detail_id], [room_inventory_id], [quantity], [penalty_amount], [description], [created_at], [ImageUrl]) VALUES (32, 2, 117, 2, CAST(0.00 AS Decimal(18, 2)), NULL, CAST(N'2026-03-27T15:43:18.230' AS DateTime), NULL)
INSERT [dbo].[Loss_And_Damages] ([id], [booking_detail_id], [room_inventory_id], [quantity], [penalty_amount], [description], [created_at], [ImageUrl]) VALUES (34, 2, 119, 1, CAST(30000.00 AS Decimal(18, 2)), N'khách dùng', CAST(N'2026-03-28T01:26:23.170' AS DateTime), NULL)
SET IDENTITY_INSERT [dbo].[Loss_And_Damages] OFF
GO
SET IDENTITY_INSERT [dbo].[Memberships] ON 

INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (1, N'Khách Mới', 0, CAST(0.00 AS Decimal(5, 2)))
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (2, N'Đồng', 500, CAST(2.00 AS Decimal(5, 2)))
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (3, N'Bạc', 1000, CAST(5.00 AS Decimal(5, 2)))
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (4, N'Vàng', 3000, CAST(8.00 AS Decimal(5, 2)))
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (5, N'Bạch Kim', 5000, CAST(10.00 AS Decimal(5, 2)))
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (6, N'Kim Cương', 10000, CAST(15.00 AS Decimal(5, 2)))
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (7, N'Elite', 20000, CAST(20.00 AS Decimal(5, 2)))
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (8, N'VIP', 50000, CAST(25.00 AS Decimal(5, 2)))
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (9, N'VVIP', 100000, CAST(30.00 AS Decimal(5, 2)))
INSERT [dbo].[Memberships] ([id], [tier_name], [min_points], [discount_percent]) VALUES (10, N'Signature', 200000, CAST(35.00 AS Decimal(5, 2)))
SET IDENTITY_INSERT [dbo].[Memberships] OFF
GO
SET IDENTITY_INSERT [dbo].[Notifications] ON 

INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (1, 1, N'Tạo tài khoản thành công', N'Tài khoản manhung08062@gmail.com đã được cấp quyền Receptionist.', N'success', NULL, 0, CAST(N'2026-03-20T07:07:59.983' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (2, 1, N'Thông báo hệ thống', N'Có cập nhật mới từ hệ thống.', N'info', NULL, 0, CAST(N'2026-03-20T12:22:56.750' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (3, 2, N'Thông báo hệ thống', N'Có cập nhật mới từ hệ thống.', N'info', NULL, 0, CAST(N'2026-03-20T12:22:56.750' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (4, 11, N'Thông báo hệ thống', N'Có cập nhật mới từ hệ thống.', N'info', NULL, 0, CAST(N'2026-03-20T12:22:56.750' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (5, 3, N'Thông báo hệ thống', N'Có cập nhật mới từ hệ thống.', N'info', NULL, 0, CAST(N'2026-03-20T12:22:56.750' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (6, 1, N'Thông báo hệ thống', N'Có cập nhật mới từ hệ thống.', N'info', NULL, 0, CAST(N'2026-03-20T12:29:48.573' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (7, 2, N'Thông báo hệ thống', N'Có cập nhật mới từ hệ thống.', N'info', NULL, 0, CAST(N'2026-03-20T12:29:48.573' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (8, 11, N'Thông báo hệ thống', N'Có cập nhật mới từ hệ thống.', N'info', NULL, 0, CAST(N'2026-03-20T12:29:48.573' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (9, 3, N'Thông báo hệ thống', N'Có cập nhật mới từ hệ thống.', N'info', NULL, 0, CAST(N'2026-03-20T12:29:48.573' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (10, 1, N'Khóa tài khoản', N'Tài khoản reception1@hotel.com đã bị vô hiệu hóa thành công.', N'info', NULL, 0, CAST(N'2026-03-20T12:32:24.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (11, 2, N'Khóa tài khoản', N'Tài khoản reception1@hotel.com đã bị vô hiệu hóa thành công.', N'info', NULL, 0, CAST(N'2026-03-20T12:32:24.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (12, 11, N'Khóa tài khoản', N'Tài khoản reception1@hotel.com đã bị vô hiệu hóa thành công.', N'info', NULL, 0, CAST(N'2026-03-20T12:32:24.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (13, 3, N'Khóa tài khoản', N'Tài khoản reception1@hotel.com đã bị vô hiệu hóa thành công.', N'info', NULL, 0, CAST(N'2026-03-20T12:32:24.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (14, 1, N'Mở khóa tài khoản', N'Tài khoản reception1@hotel.com đã được khôi phục hoạt động.', N'info', NULL, 0, CAST(N'2026-03-20T12:33:26.073' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (15, 2, N'Mở khóa tài khoản', N'Tài khoản reception1@hotel.com đã được khôi phục hoạt động.', N'info', NULL, 0, CAST(N'2026-03-20T12:33:26.073' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (16, 11, N'Mở khóa tài khoản', N'Tài khoản reception1@hotel.com đã được khôi phục hoạt động.', N'info', NULL, 0, CAST(N'2026-03-20T12:33:26.073' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (17, 3, N'Mở khóa tài khoản', N'Tài khoản reception1@hotel.com đã được khôi phục hoạt động.', N'info', NULL, 0, CAST(N'2026-03-20T12:33:26.073' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (18, 1, N'Khóa tài khoản', N'Tài khoản reception1@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-20T12:36:20.103' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (19, 2, N'Khóa tài khoản', N'Tài khoản reception1@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-20T12:36:20.103' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (20, 11, N'Khóa tài khoản', N'Tài khoản reception1@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-20T12:36:20.103' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (21, 3, N'Khóa tài khoản', N'Tài khoản reception1@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-20T12:36:20.103' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (22, 1, N'Mở khóa tài khoản', N'Tài khoản reception1@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-20T12:36:52.300' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (23, 2, N'Mở khóa tài khoản', N'Tài khoản reception1@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-20T12:36:52.300' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (24, 11, N'Mở khóa tài khoản', N'Tài khoản reception1@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-20T12:36:52.300' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (25, 3, N'Mở khóa tài khoản', N'Tài khoản reception1@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-20T12:36:52.300' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (26, 1, N'Khóa tài khoản', N'Tài khoản guestA@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-20T12:39:55.433' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (27, 2, N'Khóa tài khoản', N'Tài khoản guestA@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-20T12:39:55.433' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (28, 11, N'Khóa tài khoản', N'Tài khoản guestA@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-20T12:39:55.433' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (29, 6, N'Khóa tài khoản', N'Tài khoản guestA@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-20T12:39:55.433' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (30, 1, N'Mở khóa tài khoản', N'Tài khoản guestA@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-20T12:43:10.427' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (31, 2, N'Mở khóa tài khoản', N'Tài khoản guestA@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-20T12:43:10.427' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (32, 11, N'Mở khóa tài khoản', N'Tài khoản guestA@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-20T12:43:10.427' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (33, 6, N'Mở khóa tài khoản', N'Tài khoản guestA@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-20T12:43:10.427' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (34, 1, N'Khóa tài khoản', N'Tài khoản reception2@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T00:52:34.273' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (35, 2, N'Khóa tài khoản', N'Tài khoản reception2@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T00:52:34.273' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (36, 11, N'Khóa tài khoản', N'Tài khoản reception2@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T00:52:34.273' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (37, 4, N'Khóa tài khoản', N'Tài khoản reception2@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T00:52:34.273' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (38, 1, N'Khóa tài khoản', N'Tài khoản accountant@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T00:53:31.520' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (39, 2, N'Khóa tài khoản', N'Tài khoản accountant@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T00:53:31.520' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (40, 11, N'Khóa tài khoản', N'Tài khoản accountant@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T00:53:31.520' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (41, 5, N'Khóa tài khoản', N'Tài khoản accountant@hotel.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T00:53:31.520' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (42, 1, N'Cập nhật phân quyền', N'Tài khoản guestA@gmail.com vừa được đổi sang vai trò Accountant.', N'warning', NULL, 0, CAST(N'2026-03-21T00:55:02.247' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (43, 2, N'Cập nhật phân quyền', N'Tài khoản guestA@gmail.com vừa được đổi sang vai trò Accountant.', N'warning', NULL, 0, CAST(N'2026-03-21T00:55:02.247' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (44, 11, N'Cập nhật phân quyền', N'Tài khoản guestA@gmail.com vừa được đổi sang vai trò Accountant.', N'warning', NULL, 0, CAST(N'2026-03-21T00:55:02.247' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (45, 6, N'Cập nhật phân quyền', N'Tài khoản guestA@gmail.com vừa được đổi sang vai trò Accountant.', N'warning', NULL, 0, CAST(N'2026-03-21T00:55:02.247' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (46, 1, N'Tạo tài khoản thành công', N'Tài khoản dainguyen1254@gmail.com đã được khởi tạo với vai trò Housekeeping.', N'success', NULL, 0, CAST(N'2026-03-21T01:57:00.360' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (47, 2, N'Tạo tài khoản thành công', N'Tài khoản dainguyen1254@gmail.com đã được khởi tạo với vai trò Housekeeping.', N'success', NULL, 0, CAST(N'2026-03-21T01:57:00.360' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (48, 11, N'Tạo tài khoản thành công', N'Tài khoản dainguyen1254@gmail.com đã được khởi tạo với vai trò Housekeeping.', N'success', NULL, 0, CAST(N'2026-03-21T01:57:00.360' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (49, 14, N'Tạo tài khoản thành công', N'Tài khoản dainguyen1254@gmail.com đã được khởi tạo với vai trò Housekeeping.', N'success', NULL, 0, CAST(N'2026-03-21T01:57:00.360' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (50, 1, N'Cấp lại mật khẩu', N'Hệ thống đã gửi mật khẩu mới vào email của dainguyen1254@gmail.com.', N'warning', NULL, 0, CAST(N'2026-03-21T01:58:40.487' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (51, 2, N'Cấp lại mật khẩu', N'Hệ thống đã gửi mật khẩu mới vào email của dainguyen1254@gmail.com.', N'warning', NULL, 0, CAST(N'2026-03-21T01:58:40.487' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (52, 11, N'Cấp lại mật khẩu', N'Hệ thống đã gửi mật khẩu mới vào email của dainguyen1254@gmail.com.', N'warning', NULL, 0, CAST(N'2026-03-21T01:58:40.487' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (53, 14, N'Cấp lại mật khẩu', N'Hệ thống đã gửi mật khẩu mới vào email của dainguyen1254@gmail.com.', N'warning', NULL, 0, CAST(N'2026-03-21T01:58:40.487' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (54, 1, N'Mở khóa tài khoản', N'Tài khoản accountant@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T02:24:47.463' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (55, 2, N'Mở khóa tài khoản', N'Tài khoản accountant@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T02:24:47.463' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (56, 11, N'Mở khóa tài khoản', N'Tài khoản accountant@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T02:24:47.463' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (57, 5, N'Mở khóa tài khoản', N'Tài khoản accountant@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T02:24:47.463' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (58, 1, N'Mở khóa tài khoản', N'Tài khoản reception2@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T02:24:51.517' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (59, 2, N'Mở khóa tài khoản', N'Tài khoản reception2@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T02:24:51.517' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (60, 11, N'Mở khóa tài khoản', N'Tài khoản reception2@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T02:24:51.517' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (61, 4, N'Mở khóa tài khoản', N'Tài khoản reception2@hotel.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T02:24:51.517' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (62, 1, N'Lỗi tạo tài khoản', N'Không thể tạo tài khoản. Lỗi: nguyenbinhan2707@gmail.com', N'warning', NULL, 0, CAST(N'2026-03-21T06:33:09.297' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (63, 2, N'Lỗi tạo tài khoản', N'Không thể tạo tài khoản. Lỗi: nguyenbinhan2707@gmail.com', N'warning', NULL, 0, CAST(N'2026-03-21T06:33:09.297' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (64, 11, N'Lỗi tạo tài khoản', N'Không thể tạo tài khoản. Lỗi: nguyenbinhan2707@gmail.com', N'warning', NULL, 0, CAST(N'2026-03-21T06:33:09.297' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (65, 15, N'Lỗi tạo tài khoản', N'Không thể tạo tài khoản. Lỗi: nguyenbinhan2707@gmail.com', N'warning', NULL, 0, CAST(N'2026-03-21T06:33:09.297' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (66, 1, N'Khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T06:35:08.167' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (67, 2, N'Khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T06:35:08.167' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (68, 11, N'Khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T06:35:08.167' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (69, 14, N'Khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T06:35:08.167' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (70, 1, N'Mở khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T07:27:43.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (71, 2, N'Mở khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T07:27:43.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (72, 11, N'Mở khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T07:27:43.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (73, 14, N'Mở khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T07:27:43.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (74, 1, N'Khóa tài khoản', N'Tài khoản guestB@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T07:40:18.280' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (75, 2, N'Khóa tài khoản', N'Tài khoản guestB@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T07:40:18.280' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (76, 11, N'Khóa tài khoản', N'Tài khoản guestB@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T07:40:18.280' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (77, 7, N'Khóa tài khoản', N'Tài khoản guestB@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T07:40:18.280' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (78, 1, N'Mở khóa tài khoản', N'Tài khoản guestB@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T07:42:39.183' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (79, 2, N'Mở khóa tài khoản', N'Tài khoản guestB@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T07:42:39.183' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (80, 11, N'Mở khóa tài khoản', N'Tài khoản guestB@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T07:42:39.183' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (81, 7, N'Mở khóa tài khoản', N'Tài khoản guestB@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-21T07:42:39.183' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (82, 1, N'Khóa tài khoản', N'Tài khoản guestE@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T07:44:48.810' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (83, 2, N'Khóa tài khoản', N'Tài khoản guestE@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T07:44:48.810' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (84, 11, N'Khóa tài khoản', N'Tài khoản guestE@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T07:44:48.810' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (85, 10, N'Khóa tài khoản', N'Tài khoản guestE@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-21T07:44:48.810' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (86, 1, N'Mở khóa tài khoản', N'Tài khoản guestE@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-25T01:42:24.840' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (87, 2, N'Mở khóa tài khoản', N'Tài khoản guestE@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-25T01:42:24.840' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (88, 11, N'Mở khóa tài khoản', N'Tài khoản guestE@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-25T01:42:24.840' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (89, 10, N'Mở khóa tài khoản', N'Tài khoản guestE@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-25T01:42:24.840' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (90, 1, N'Khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-25T02:05:33.513' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (91, 2, N'Khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-25T02:05:33.513' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (92, 11, N'Khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-25T02:05:33.513' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (93, 14, N'Khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-25T02:05:33.513' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (94, 1, N'Mở khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-25T02:05:35.560' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (95, 2, N'Mở khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-25T02:05:35.560' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (96, 11, N'Mở khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-25T02:05:35.560' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (97, 14, N'Mở khóa tài khoản', N'Tài khoản dainguyen1254@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-25T02:05:35.560' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (98, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:41:17.063' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (99, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:41:17.063' AS DateTime))
GO
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (100, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:41:17.063' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (101, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:41:17.063' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (102, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:48:53.277' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (103, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:48:53.277' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (104, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:48:53.277' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (105, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:48:53.277' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (106, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-26T16:55:03.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (107, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-26T16:55:03.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (108, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-26T16:55:05.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (109, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-26T16:55:05.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (110, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:56:23.687' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (111, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:56:23.687' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (112, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:56:23.687' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (113, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:56:23.687' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (114, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:59:42.320' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (115, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:59:42.320' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (116, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:59:42.320' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (117, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-26T16:59:42.320' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (118, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 0đ do ''đã dùng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:09:57.023' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (119, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 0đ do ''đã dùng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:09:57.023' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (120, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 0đ do ''đã dùng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:09:57.023' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (121, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 0đ do ''đã dùng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:09:57.023' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (122, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 20,000đ do ''đã dùng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:10:04.970' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (123, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 20,000đ do ''đã dùng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:10:04.970' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (124, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 20,000đ do ''đã dùng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:10:04.970' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (125, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 20,000đ do ''đã dùng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:10:04.970' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (126, 3, N'Cập nhật khoản phạt', N'[CẬP NHẬT] Khoản phạt vật tư ''Nước suối Lavie 500ml'' tại phòng 102 đã được điều chỉnh thành 0đ.', N'info', NULL, 0, CAST(N'2026-03-26T17:10:41.540' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (127, 4, N'Cập nhật khoản phạt', N'[CẬP NHẬT] Khoản phạt vật tư ''Nước suối Lavie 500ml'' tại phòng 102 đã được điều chỉnh thành 0đ.', N'info', NULL, 0, CAST(N'2026-03-26T17:10:41.540' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (128, 5, N'Cập nhật khoản phạt', N'[CẬP NHẬT] Khoản phạt vật tư ''Nước suối Lavie 500ml'' tại phòng 102 đã được điều chỉnh thành 0đ.', N'info', NULL, 0, CAST(N'2026-03-26T17:10:41.540' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (129, 6, N'Cập nhật khoản phạt', N'[CẬP NHẬT] Khoản phạt vật tư ''Nước suối Lavie 500ml'' tại phòng 102 đã được điều chỉnh thành 0đ.', N'info', NULL, 0, CAST(N'2026-03-26T17:10:41.540' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (130, 13, N'Cập nhật khoản phạt', N'[CẬP NHẬT] Khoản phạt vật tư ''Nước suối Lavie 500ml'' tại phòng 102 đã được điều chỉnh thành 0đ.', N'info', NULL, 0, CAST(N'2026-03-26T17:10:41.540' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (131, 15, N'Cập nhật khoản phạt', N'[CẬP NHẬT] Khoản phạt vật tư ''Nước suối Lavie 500ml'' tại phòng 102 đã được điều chỉnh thành 0đ.', N'info', NULL, 0, CAST(N'2026-03-26T17:10:41.540' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (132, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''thủng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:11:16.253' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (133, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''thủng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:11:16.253' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (134, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''thủng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:11:16.253' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (135, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''thủng''.', N'warning', NULL, 0, CAST(N'2026-03-26T17:11:16.253' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (136, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 30,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:00:52.047' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (137, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 30,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:00:52.047' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (138, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 30,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:00:52.047' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (139, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 30,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:00:52.047' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (140, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:01:24.173' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (141, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:01:24.173' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (142, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:01:24.173' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (143, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:01:24.173' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (144, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:28:28.297' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (145, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:28:28.297' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (146, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:32:04.663' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (147, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:32:04.663' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (148, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:32:04.663' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (149, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:32:04.663' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (150, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:32:14.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (151, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:32:14.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (152, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Bánh Oreo 133g'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:33:34.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (153, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Bánh Oreo 133g'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:33:34.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (154, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Bánh Oreo 133g'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:33:34.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (155, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Bánh Oreo 133g'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:33:34.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (156, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Bánh Oreo 133g'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:33:34.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (157, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Bánh Oreo 133g'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:33:34.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (158, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Bánh Oreo 133g'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:33:34.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (159, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Bánh Oreo 133g'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:33:34.930' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (160, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:01.497' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (161, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:01.497' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (162, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:01.497' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (163, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:01.497' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (164, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:10.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (165, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:10.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (166, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:10.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (167, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:10.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (168, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:10.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (169, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:10.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (170, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:10.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (171, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:10.490' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (172, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:15.777' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (173, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:15.777' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (174, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:15.777' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (175, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 150,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:15.777' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (176, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 9,000,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:53.193' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (177, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 9,000,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:53.193' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (178, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 9,000,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:53.193' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (179, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 9,000,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T14:56:53.193' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (180, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Điều hòa Daikin 9000 BTU'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:56.690' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (181, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Điều hòa Daikin 9000 BTU'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:56.690' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (182, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Điều hòa Daikin 9000 BTU'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:56.690' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (183, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Điều hòa Daikin 9000 BTU'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:56.690' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (184, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Điều hòa Daikin 9000 BTU'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:56.690' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (185, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Điều hòa Daikin 9000 BTU'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:56.690' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (186, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Điều hòa Daikin 9000 BTU'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:56.690' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (187, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Điều hòa Daikin 9000 BTU'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:56.690' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (188, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:59.610' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (189, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:59.610' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (190, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:59.610' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (191, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:59.610' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (192, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:59.610' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (193, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:59.610' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (194, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:59.610' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (195, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T14:56:59.610' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (196, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:08:50.413' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (197, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:08:50.413' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (198, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:08:50.413' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (199, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:08:50.413' AS DateTime))
GO
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (200, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:08:50.413' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (201, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:08:50.413' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (202, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:08:50.413' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (203, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:08:50.413' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (204, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 15,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:08:59.047' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (205, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 15,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:08:59.047' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (206, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 15,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:08:59.047' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (207, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 15,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:08:59.047' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (208, 1, N'Khóa tài khoản', N'Tài khoản guestE@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:12:56.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (209, 2, N'Khóa tài khoản', N'Tài khoản guestE@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:12:56.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (210, 11, N'Khóa tài khoản', N'Tài khoản guestE@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:12:56.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (211, 10, N'Khóa tài khoản', N'Tài khoản guestE@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:12:56.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (212, 1, N'Mở khóa tài khoản', N'Tài khoản guestE@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:00.267' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (213, 2, N'Mở khóa tài khoản', N'Tài khoản guestE@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:00.267' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (214, 11, N'Mở khóa tài khoản', N'Tài khoản guestE@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:00.267' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (215, 10, N'Mở khóa tài khoản', N'Tài khoản guestE@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:00.267' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (216, 1, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:05.463' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (217, 2, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:05.463' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (218, 11, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:05.463' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (219, 9, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:05.463' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (220, 1, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:09.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (221, 2, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:09.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (222, 11, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:09.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (223, 9, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:09.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (224, 1, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:11.517' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (225, 2, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:11.517' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (226, 11, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:11.517' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (227, 9, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:11.517' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (228, 1, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:14.797' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (229, 2, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:14.797' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (230, 11, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:14.797' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (231, 9, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:14.797' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (232, 1, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:15.803' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (233, 2, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:15.803' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (234, 11, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:15.803' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (235, 9, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:15.803' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (236, 1, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:16.353' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (237, 2, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:16.353' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (238, 11, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:16.353' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (239, 9, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:16.353' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (240, 1, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:16.817' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (241, 2, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:16.817' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (242, 11, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:16.817' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (243, 9, N'Khóa tài khoản', N'Tài khoản guestD@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:13:16.817' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (244, 1, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:18.407' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (245, 2, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:18.407' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (246, 11, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:18.407' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (247, 9, N'Mở khóa tài khoản', N'Tài khoản guestD@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:13:18.407' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (248, 1, N'Khóa tài khoản', N'Tài khoản guestC@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:14:31.383' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (249, 2, N'Khóa tài khoản', N'Tài khoản guestC@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:14:31.383' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (250, 11, N'Khóa tài khoản', N'Tài khoản guestC@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:14:31.383' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (251, 8, N'Khóa tài khoản', N'Tài khoản guestC@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:14:31.383' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (252, 1, N'Mở khóa tài khoản', N'Tài khoản guestC@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:14:35.597' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (253, 2, N'Mở khóa tài khoản', N'Tài khoản guestC@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:14:35.597' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (254, 11, N'Mở khóa tài khoản', N'Tài khoản guestC@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:14:35.597' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (255, 8, N'Mở khóa tài khoản', N'Tài khoản guestC@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:14:35.597' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (256, 1, N'Khóa tài khoản', N'Tài khoản guestC@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:14:46.153' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (257, 2, N'Khóa tài khoản', N'Tài khoản guestC@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:14:46.153' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (258, 11, N'Khóa tài khoản', N'Tài khoản guestC@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:14:46.153' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (259, 8, N'Khóa tài khoản', N'Tài khoản guestC@gmail.com đã bị vô hiệu hóa thành công.', N'warning', NULL, 0, CAST(N'2026-03-27T15:14:46.153' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (260, 1, N'Mở khóa tài khoản', N'Tài khoản guestC@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:14:52.200' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (261, 2, N'Mở khóa tài khoản', N'Tài khoản guestC@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:14:52.200' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (262, 11, N'Mở khóa tài khoản', N'Tài khoản guestC@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:14:52.200' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (263, 8, N'Mở khóa tài khoản', N'Tài khoản guestC@gmail.com đã được khôi phục hoạt động.', N'success', NULL, 0, CAST(N'2026-03-27T15:14:52.200' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (264, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:15:48.090' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (265, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:15:48.090' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (266, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:15:48.090' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (267, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:15:48.090' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (268, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:15:48.090' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (269, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:15:48.090' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (270, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:15:48.090' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (271, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:15:48.090' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (272, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:16:06.567' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (273, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:16:06.567' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (274, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:16:06.567' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (275, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:16:06.567' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (276, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 30,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:16:37.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (277, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 30,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:16:37.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (278, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 30,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:16:37.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (279, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 30,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:16:37.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (280, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 15,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:34:24.650' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (281, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 15,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:34:24.650' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (282, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 15,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:34:24.650' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (283, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 103 phát sinh khoản phạt 15,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:34:24.650' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (284, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:34:29.493' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (285, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:34:29.493' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (286, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:34:29.493' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (287, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:34:29.493' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (288, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:34:29.493' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (289, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:34:29.493' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (290, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:34:29.493' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (291, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 103 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:34:29.493' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (292, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:46.793' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (293, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:46.793' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (294, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:46.793' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (295, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:46.793' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (296, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:46.793' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (297, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:46.793' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (298, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:46.793' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (299, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:46.793' AS DateTime))
GO
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (300, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:56.710' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (301, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:56.710' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (302, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:56.710' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (303, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:56.710' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (304, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:56.710' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (305, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:56.710' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (306, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:56.710' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (307, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước ngọt Coca Cola 320ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:56.710' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (308, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:59.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (309, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:59.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (310, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:59.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (311, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:59.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (312, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:59.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (313, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:59.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (314, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:59.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (315, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:36:59.563' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (316, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:37:08.860' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (317, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:37:08.860' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (318, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:37:08.860' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (319, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:37:08.860' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (320, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:40:41.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (321, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:40:41.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (322, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:40:41.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (323, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:40:41.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (324, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:40:41.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (325, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:40:41.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (326, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:40:41.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (327, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:40:41.123' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (328, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:41:00.933' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (329, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:41:00.933' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (330, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:41:00.933' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (331, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:41:00.933' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (332, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:41:10.717' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (333, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:41:10.717' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (334, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:41:10.717' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (335, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:41:10.717' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (336, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:41:10.717' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (337, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:41:10.717' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (338, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:41:10.717' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (339, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:41:10.717' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (340, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:41:24.677' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (341, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:41:24.677' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (342, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:41:24.677' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (343, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:41:24.677' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (344, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:42:13.727' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (345, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:42:13.727' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (346, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:42:13.727' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (347, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 20,000đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:42:13.727' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (348, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:43:03.907' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (349, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:43:03.907' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (350, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:43:03.907' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (351, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:43:03.907' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (352, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:43:03.907' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (353, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:43:03.907' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (354, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:43:03.907' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (355, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Nước suối Lavie 500ml'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-27T15:43:03.907' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (356, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:43:18.250' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (357, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:43:18.250' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (358, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:43:18.250' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (359, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 0đ do ''''.', N'warning', NULL, 0, CAST(N'2026-03-27T15:43:18.250' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (360, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''thủng lỗ''.', N'warning', NULL, 0, CAST(N'2026-03-28T01:09:35.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (361, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''thủng lỗ''.', N'warning', NULL, 0, CAST(N'2026-03-28T01:09:35.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (362, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''thủng lỗ''.', N'warning', NULL, 0, CAST(N'2026-03-28T01:09:35.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (363, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 150,000đ do ''thủng lỗ''.', N'warning', NULL, 0, CAST(N'2026-03-28T01:09:35.863' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (364, 2, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-28T01:10:18.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (365, 3, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-28T01:10:18.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (366, 4, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-28T01:10:18.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (367, 5, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-28T01:10:18.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (368, 6, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-28T01:10:18.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (369, 11, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-28T01:10:18.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (370, 13, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-28T01:10:18.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (371, 15, N'Hủy báo cáo phạt', N'[HỦY PHẠT] Báo cáo đền bù ''Khăn tắm cotton 70x140cm'' tại phòng 102 đã bị hủy.', N'success', NULL, 0, CAST(N'2026-03-28T01:10:18.603' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (372, 2, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 30,000đ do ''khách dùng''.', N'warning', NULL, 0, CAST(N'2026-03-28T01:26:23.180' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (373, 3, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 30,000đ do ''khách dùng''.', N'warning', NULL, 0, CAST(N'2026-03-28T01:26:23.180' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (374, 11, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 30,000đ do ''khách dùng''.', N'warning', NULL, 0, CAST(N'2026-03-28T01:26:23.180' AS DateTime))
INSERT [dbo].[Notifications] ([id], [user_id], [title], [content], [type], [reference_link], [is_read], [created_at]) VALUES (375, 13, N'Báo cáo thất thoát mới', N'[CẢNH BÁO] Phòng 102 phát sinh khoản phạt 30,000đ do ''khách dùng''.', N'warning', NULL, 0, CAST(N'2026-03-28T01:26:23.180' AS DateTime))
SET IDENTITY_INSERT [dbo].[Notifications] OFF
GO
SET IDENTITY_INSERT [dbo].[Order_Service_Details] ON 

INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (1, 2, 2, 1, CAST(150000.00 AS Decimal(18, 2)))
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (2, 2, 10, 1, CAST(50000.00 AS Decimal(18, 2)))
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (3, 4, 3, 1, CAST(500000.00 AS Decimal(18, 2)))
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (4, 6, 5, 1, CAST(350000.00 AS Decimal(18, 2)))
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (5, 7, 9, 1, CAST(800000.00 AS Decimal(18, 2)))
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (6, 9, 1, 5, CAST(200000.00 AS Decimal(18, 2)))
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (7, 10, 2, 1, CAST(150000.00 AS Decimal(18, 2)))
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (8, 4, 8, 2, CAST(40000.00 AS Decimal(18, 2)))
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (9, 6, 10, 2, CAST(50000.00 AS Decimal(18, 2)))
INSERT [dbo].[Order_Service_Details] ([id], [order_service_id], [service_id], [quantity], [unit_price]) VALUES (10, 7, 6, 2, CAST(100000.00 AS Decimal(18, 2)))
SET IDENTITY_INSERT [dbo].[Order_Service_Details] OFF
GO
SET IDENTITY_INSERT [dbo].[Order_Services] ON 

INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (1, 1, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'Cancelled')
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (2, 2, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(200000.00 AS Decimal(18, 2)), N'Delivered')
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (3, 3, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'Pending')
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (4, 4, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(500000.00 AS Decimal(18, 2)), N'Delivered')
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (5, 5, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'Pending')
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (6, 6, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(350000.00 AS Decimal(18, 2)), N'Delivered')
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (7, 7, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(800000.00 AS Decimal(18, 2)), N'Delivered')
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (8, 8, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'Pending')
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (9, 9, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(1000000.00 AS Decimal(18, 2)), N'Delivered')
INSERT [dbo].[Order_Services] ([id], [booking_detail_id], [order_date], [total_amount], [status]) VALUES (10, 10, CAST(N'2026-03-06T22:07:35.027' AS DateTime), CAST(150000.00 AS Decimal(18, 2)), N'Delivered')
SET IDENTITY_INSERT [dbo].[Order_Services] OFF
GO
SET IDENTITY_INSERT [dbo].[Payments] ON 

INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (1, 1, N'Cash', CAST(880000.00 AS Decimal(18, 2)), N'CASH001', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (2, 2, N'VNPay', CAST(1000000.00 AS Decimal(18, 2)), N'VNPAY123', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (3, 3, N'Credit Card', CAST(500000.00 AS Decimal(18, 2)), N'CC456', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (4, 4, N'Momo', CAST(3850000.00 AS Decimal(18, 2)), N'MOMO789', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (5, 5, N'Bank Transfer', CAST(1320000.00 AS Decimal(18, 2)), N'BANK001', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (6, 6, N'Cash', CAST(3850000.00 AS Decimal(18, 2)), N'CASH002', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (7, 7, N'VNPay', CAST(3366000.00 AS Decimal(18, 2)), N'VNPAY999', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (8, 8, N'Credit Card', CAST(11000000.00 AS Decimal(18, 2)), N'CC888', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (9, 9, N'Bank Transfer', CAST(28600000.00 AS Decimal(18, 2)), N'BANK002', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
INSERT [dbo].[Payments] ([id], [invoice_id], [payment_method], [amount_paid], [transaction_code], [payment_date]) VALUES (10, 10, N'Momo', CAST(5000000.00 AS Decimal(18, 2)), N'MOMO111', CAST(N'2026-03-06T22:07:35.027' AS DateTime))
SET IDENTITY_INSERT [dbo].[Payments] OFF
GO
SET IDENTITY_INSERT [dbo].[Permissions] ON 

INSERT [dbo].[Permissions] ([id], [name]) VALUES (1, N'VIEW_DASHBOARD')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (2, N'MANAGE_USERS')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (3, N'MANAGE_ROLES')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (4, N'MANAGE_ROOMS')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (5, N'MANAGE_BOOKINGS')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (6, N'MANAGE_INVOICES')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (7, N'MANAGE_SERVICES')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (8, N'VIEW_REPORTS')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (9, N'MANAGE_CONTENT')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (10, N'MANAGE_INVENTORY')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (11, N'VIEW_USERS')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (12, N'VIEW_ROLES')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (13, N'EDIT_ROLES')
INSERT [dbo].[Permissions] ([id], [name]) VALUES (14, N'CREATE_USERS')
SET IDENTITY_INSERT [dbo].[Permissions] OFF
GO
SET IDENTITY_INSERT [dbo].[Reviews] ON 

INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (1, 6, 1, 5, N'Phòng tuyệt vời!', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (2, 7, 2, 4, N'Khá tốt, nhân viên thân thiện.', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (3, 8, 3, 3, N'Bình thường, điều hòa hơi ồn.', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (4, 9, 4, 5, N'View biển rất đẹp.', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (5, 10, 5, 4, N'Bữa sáng ngon miệng.', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (6, 6, 6, 5, N'Rất thích hợp cho gia đình.', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (7, 7, 7, 5, N'Sang trọng, đẳng cấp.', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (8, 8, 8, 2, N'Chưa hài lòng với dịch vụ dọn phòng.', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (9, 9, 9, 5, N'Hoàn hảo mọi mặt.', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
INSERT [dbo].[Reviews] ([id], [user_id], [room_type_id], [rating], [comment], [created_at]) VALUES (10, 10, 10, 5, N'Trải nghiệm tuyệt vời nhất.', CAST(N'2026-03-06T22:07:35.023' AS DateTime))
SET IDENTITY_INSERT [dbo].[Reviews] OFF
GO
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 1)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 2)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 3)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 4)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 5)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 6)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 7)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 8)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 9)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 10)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 11)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 12)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 13)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (1, 14)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 1)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 2)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 4)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 5)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 6)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 7)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 8)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 9)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 10)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 11)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (2, 12)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (3, 1)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (3, 4)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (3, 5)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (3, 6)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (3, 7)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (3, 9)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (3, 10)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (4, 1)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (4, 2)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (4, 4)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (4, 5)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (4, 6)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (4, 7)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (4, 8)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (5, 4)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (5, 6)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (5, 7)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (5, 8)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (5, 9)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (5, 10)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (7, 7)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (7, 8)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (7, 9)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (7, 10)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (9, 1)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (9, 2)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (9, 3)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (9, 4)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (9, 5)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (9, 6)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (9, 8)
INSERT [dbo].[Role_Permissions] ([role_id], [permission_id]) VALUES (9, 9)
GO
SET IDENTITY_INSERT [dbo].[Roles] ON 

INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (1, N'Admin', N'Quản trị viên')
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (2, N'Manager', N'Quản lý khách sạn')
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (3, N'Receptionist', N'Lễ tân')
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (4, N'Accountant', N'Kế toán')
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (5, N'Housekeeping', N'Buồng phòng')
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (6, N'Security', N'Bảo vệ')
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (7, N'Chef', N'Đầu bếp')
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (8, N'Waiter', N'Nhân viên phục vụ')
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (9, N'IT Support', N'Kỹ thuật viên')
INSERT [dbo].[Roles] ([id], [name], [description]) VALUES (10, N'Guest', N'Khách hàng')
SET IDENTITY_INSERT [dbo].[Roles] OFF
GO
SET IDENTITY_INSERT [dbo].[Room_Images] ON 

INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (1, 1, N'type1_img.jpg', 1, 1)
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (2, 2, N'type2_img.jpg', 1, 1)
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (3, 3, N'type3_img.jpg', 1, 1)
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (4, 4, N'type4_img.jpg', 1, 1)
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (5, 5, N'type5_img.jpg', 1, 1)
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (6, 6, N'type6_img.jpg', 1, 1)
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (7, 7, N'type7_img.jpg', 1, 1)
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (8, 8, N'type8_img.jpg', 1, 1)
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (9, 9, N'type9_img.jpg', 1, 1)
INSERT [dbo].[Room_Images] ([id], [room_type_id], [image_url], [is_primary], [is_active]) VALUES (10, 10, N'type10_img.jpg', 1, 1)
SET IDENTITY_INSERT [dbo].[Room_Images] OFF
GO
SET IDENTITY_INSERT [dbo].[Room_Inventory] ON 

INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (83, 1, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Treo tường', 0, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (84, 1, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Mới bảo dưỡng', 1, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (85, 1, 1, CAST(15000000.00 AS Decimal(18, 2)), N'Không đệm', 0, N'Asset', 6)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (86, 1, 2, CAST(150000.00 AS Decimal(18, 2)), N'Gấp trên giường', 1, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (87, 1, 2, CAST(15000.00 AS Decimal(18, 2)), N'Miễn phí hàng ngày', 1, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (88, 1, 2, CAST(20000.00 AS Decimal(18, 2)), N'Trong Minibar', 1, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (89, 2, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Treo tường', 0, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (90, 2, 1, CAST(9000000.00 AS Decimal(18, 2)), N'', 0, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (91, 2, 2, CAST(7000000.00 AS Decimal(18, 2)), N'Phòng Twin', 0, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (92, 2, 2, CAST(150000.00 AS Decimal(18, 2)), N'', 0, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (93, 2, 2, CAST(15000.00 AS Decimal(18, 2)), N'Miễn phí hàng ngày', 0, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (94, 2, 2, CAST(35000.00 AS Decimal(18, 2)), N'Trong Minibar', 0, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (95, 14, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Treo tường', 0, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (96, 14, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Mới bảo dưỡng', 1, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (97, 14, 1, CAST(15000000.00 AS Decimal(18, 2)), N'Không đệm', 1, N'Asset', 6)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (98, 14, 2, CAST(150000.00 AS Decimal(18, 2)), N'Gấp trên giường', 1, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (99, 14, 2, CAST(15000.00 AS Decimal(18, 2)), N'Miễn phí hàng ngày', 1, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (100, 14, 2, CAST(20000.00 AS Decimal(18, 2)), N'Trong Minibar', 1, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (101, 1, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 20)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (102, 1, 1, CAST(350000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 5)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (103, 1, 1, CAST(1200000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 14)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (104, 1, 1, CAST(5000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 8)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (105, 1, 1, CAST(7000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (106, 1, 1, CAST(50000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 12)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (107, 1, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 10)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (108, 1, 1, CAST(80000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 13)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (109, 1, 1, CAST(250000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 15)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (110, 1, 1, CAST(35000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (111, 1, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 3)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (112, 1, 1, CAST(600000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 4)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (113, 1, 1, CAST(25000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 19)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (114, 2, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Treo tường', 1, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (115, 2, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Mới bảo dưỡng', 1, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (116, 2, 2, CAST(150000.00 AS Decimal(18, 2)), N'Gấp trên giường', 1, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (117, 2, 2, CAST(0.00 AS Decimal(18, 2)), N'Miễn phí hàng ngày', 1, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (118, 2, 2, CAST(20000.00 AS Decimal(18, 2)), N'Trong Minibar', 1, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (119, 2, 0, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 20)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (120, 2, 1, CAST(350000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 5)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (121, 2, 1, CAST(1200000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 14)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (122, 2, 1, CAST(5000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 8)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (123, 2, 1, CAST(7000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (124, 2, 1, CAST(50000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 12)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (125, 2, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 10)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (126, 2, 1, CAST(80000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 13)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (127, 2, 1, CAST(250000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 15)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (128, 2, 1, CAST(35000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (129, 2, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 3)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (130, 2, 1, CAST(600000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 4)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (131, 2, 1, CAST(25000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 19)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (132, 13, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Treo tường', 1, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (133, 13, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Mới bảo dưỡng', 1, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (134, 13, 2, CAST(150000.00 AS Decimal(18, 2)), N'Gấp trên giường', 1, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (135, 13, 2, CAST(15000.00 AS Decimal(18, 2)), N'Miễn phí hàng ngày', 1, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (136, 13, 2, CAST(20000.00 AS Decimal(18, 2)), N'Trong Minibar', 1, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (137, 13, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 20)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (138, 13, 1, CAST(350000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 5)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (139, 13, 1, CAST(1200000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 14)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (140, 13, 1, CAST(5000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 8)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (141, 13, 1, CAST(7000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (142, 13, 1, CAST(50000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 12)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (143, 13, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 10)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (144, 13, 1, CAST(80000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 13)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (145, 13, 1, CAST(250000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 15)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (146, 13, 1, CAST(35000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (147, 13, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 3)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (148, 13, 1, CAST(600000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 4)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (149, 13, 1, CAST(25000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 19)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (150, 3, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (151, 3, 1, CAST(15000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 6)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (152, 3, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 3)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (153, 3, 1, CAST(20000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (154, 3, 1, CAST(600000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 4)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (155, 3, 1, CAST(35000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (156, 3, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 10)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (157, 3, 1, CAST(250000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 15)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (158, 3, 1, CAST(80000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 13)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (159, 3, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 20)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (160, 3, 1, CAST(15000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (161, 3, 1, CAST(350000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 5)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (162, 3, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (163, 3, 1, CAST(5000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 8)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (164, 3, 1, CAST(150000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (165, 3, 1, CAST(7000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (166, 3, 1, CAST(1200000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 14)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (167, 3, 1, CAST(25000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 19)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (168, 3, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 9)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (169, 3, 1, CAST(50000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 12)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (170, 4, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (171, 4, 1, CAST(15000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 6)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (172, 4, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 3)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (173, 4, 1, CAST(20000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (174, 4, 1, CAST(600000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 4)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (175, 4, 1, CAST(35000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (176, 4, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 10)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (177, 4, 1, CAST(250000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 15)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (178, 4, 1, CAST(80000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 13)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (179, 4, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 20)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (180, 4, 1, CAST(15000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (181, 4, 1, CAST(350000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 5)
GO
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (182, 4, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (183, 4, 1, CAST(5000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 8)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (184, 4, 1, CAST(150000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (185, 4, 1, CAST(7000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (186, 4, 1, CAST(1200000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 14)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (187, 4, 1, CAST(25000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 19)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (188, 4, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 9)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (189, 4, 1, CAST(50000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 12)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (190, 6, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Treo tường', 1, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (191, 6, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Mới bảo dưỡng', 1, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (192, 6, 2, CAST(150000.00 AS Decimal(18, 2)), N'Gấp trên giường', 1, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (193, 6, 2, CAST(0.00 AS Decimal(18, 2)), N'Miễn phí hàng ngày', 1, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (194, 6, 2, CAST(20000.00 AS Decimal(18, 2)), N'Trong Minibar', 1, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (195, 6, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 20)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (196, 6, 1, CAST(350000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 5)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (197, 6, 1, CAST(1200000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 14)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (198, 6, 1, CAST(5000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 8)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (199, 6, 1, CAST(7000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (200, 6, 1, CAST(50000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 12)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (201, 6, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 10)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (202, 6, 1, CAST(80000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 13)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (203, 6, 1, CAST(250000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 15)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (204, 6, 1, CAST(35000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (205, 6, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 3)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (206, 6, 1, CAST(600000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 4)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (207, 6, 1, CAST(25000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 19)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (208, 1, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (209, 3, 1, CAST(17000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 21)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (210, 15, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Mới bảo dưỡng', 0, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (211, 15, 2, CAST(150000.00 AS Decimal(18, 2)), N'Gấp trên giường', 0, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (212, 15, 2, CAST(15000.00 AS Decimal(18, 2)), N'Miễn phí hàng ngày', 0, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (213, 15, 2, CAST(20000.00 AS Decimal(18, 2)), N'Trong Minibar', 0, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (214, 15, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 20)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (215, 15, 1, CAST(350000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 5)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (216, 15, 1, CAST(1200000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 14)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (217, 15, 1, CAST(5000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 8)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (218, 15, 1, CAST(7000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (219, 15, 1, CAST(50000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 12)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (220, 15, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 10)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (221, 15, 1, CAST(80000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 13)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (222, 15, 1, CAST(250000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 15)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (223, 15, 1, CAST(35000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (224, 15, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 3)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (225, 15, 1, CAST(600000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 4)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (226, 15, 1, CAST(25000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 19)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (227, 15, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (228, 15, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (229, 15, 1, CAST(15000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 6)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (230, 15, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 3)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (231, 15, 1, CAST(20000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (232, 15, 1, CAST(600000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 4)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (233, 15, 1, CAST(35000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (234, 15, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 10)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (235, 15, 1, CAST(250000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 15)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (236, 15, 1, CAST(80000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 13)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (237, 15, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 20)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (238, 15, 1, CAST(15000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (239, 15, 1, CAST(350000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 5)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (240, 15, 1, CAST(8000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 0, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (241, 15, 1, CAST(5000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 8)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (242, 15, 1, CAST(150000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (243, 15, 1, CAST(7000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (244, 15, 1, CAST(1200000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 14)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (245, 15, 1, CAST(25000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 19)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (246, 15, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 9)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (247, 15, 1, CAST(50000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 12)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (248, 14, 1, CAST(8000000.00 AS Decimal(18, 2)), NULL, 1, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (249, 14, 1, CAST(8000000.00 AS Decimal(18, 2)), NULL, 1, N'Asset', 1)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (250, 16, 1, CAST(9000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 2)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (251, 16, 1, CAST(15000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 6)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (252, 16, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 3)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (253, 16, 1, CAST(20000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 17)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (254, 16, 1, CAST(600000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 4)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (255, 16, 1, CAST(35000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 18)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (256, 16, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 10)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (257, 16, 1, CAST(250000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 15)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (258, 16, 1, CAST(80000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 13)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (259, 16, 1, CAST(30000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 20)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (260, 16, 1, CAST(15000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 16)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (261, 16, 1, CAST(350000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 5)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (262, 16, 1, CAST(5000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 8)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (263, 16, 1, CAST(150000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 11)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (264, 16, 1, CAST(7000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 7)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (265, 16, 1, CAST(1200000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 14)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (266, 16, 1, CAST(25000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 19)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (267, 16, 1, CAST(3000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 9)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (268, 16, 1, CAST(50000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 12)
INSERT [dbo].[Room_Inventory] ([id], [room_id], [quantity], [price_if_lost], [note], [is_active], [item_type], [EquipmentId]) VALUES (269, 16, 1, CAST(17000000.00 AS Decimal(18, 2)), N'Đồng bộ từ kho', 1, N'Asset', 21)
SET IDENTITY_INSERT [dbo].[Room_Inventory] OFF
GO
SET IDENTITY_INSERT [dbo].[Room_Types] ON 

INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (1, N'Phòng tiêu chuẩn 1 giường đơn', CAST(400000.00 AS Decimal(18, 2)), 1, 0, N'Phòng tiêu chuẩn 1 giường đơn', NULL, NULL, NULL, 1, N'phong-tieu-chuan-1-giuong-don', NULL)
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (2, N'Phòng tiêu chuẩn 1 giường đôi', CAST(500000.00 AS Decimal(18, 2)), 2, 1, N'Phòng tiêu chuẩn 1 giường đôi', NULL, NULL, NULL, 1, N'phong-tieu-chuan-1-giuong-doi', NULL)
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (3, N'Phòng cao cấp hướng phố', CAST(700000.00 AS Decimal(18, 2)), 2, 1, N'Phòng cao cấp hướng phố', NULL, NULL, NULL, 1, N'phong-cao-cap-huong-pho', NULL)
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (4, N'Phòng Deluxe hướng biển', CAST(900000.00 AS Decimal(18, 2)), 2, 2, N'Phòng Deluxe hướng biển', NULL, NULL, NULL, 1, N'phong-deluxe-huong-bien', NULL)
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (5, N'Phòng Premium tiện nghi cao cấp', CAST(1200000.00 AS Decimal(18, 2)), 2, 2, N'Phòng Premium tiện nghi cao cấp', NULL, NULL, NULL, 1, N'phong-premium-tien-nghi-cao-cap', NULL)
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (6, N'Phòng Suite cho gia đình', CAST(1500000.00 AS Decimal(18, 2)), 4, 2, N'Phòng Suite cho gia đình', NULL, NULL, NULL, 1, N'phong-suite-cho-gia-dinh', NULL)
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (7, N'Phòng Suite nhỏ nhắn sang trọng', CAST(1800000.00 AS Decimal(18, 2)), 2, 2, N'Phòng Suite nhỏ nhắn sang trọng', NULL, NULL, NULL, 1, N'phong-suite-nho-nhan-sang-trong', NULL)
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (8, N'Phòng Suite cho doanh nhân', CAST(2500000.00 AS Decimal(18, 2)), 2, 2, N'Phòng Suite cho doanh nhân', NULL, NULL, NULL, 1, N'phong-suite-cho-doanh-nhan', NULL)
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (9, N'Phòng Tổng thống', CAST(5000000.00 AS Decimal(18, 2)), 4, 2, N'Phòng Tổng thống', NULL, NULL, NULL, 1, N'phong-tong-thong', NULL)
INSERT [dbo].[Room_Types] ([id], [name], [base_price], [capacity_adults], [capacity_children], [description], [size_sqm], [bed_type], [view_type], [is_active], [slug], [content]) VALUES (10, N'Biệt thự hoàng gia nguyên căn', CAST(8000000.00 AS Decimal(18, 2)), 6, 4, N'Biệt thự hoàng gia nguyên căn', NULL, NULL, NULL, 1, NULL, NULL)
SET IDENTITY_INSERT [dbo].[Room_Types] OFF
GO
SET IDENTITY_INSERT [dbo].[Rooms] ON 

INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (1, 1, N'101', 1, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (2, 1, N'102', 1, N'Occupied', N'Inspecting', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (3, 3, N'201', 2, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (4, 4, N'202', 2, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (5, 5, N'301', 3, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (6, 6, N'302', 3, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (7, 7, N'401', 4, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (8, 8, N'402', 4, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (9, 9, N'501', 5, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (10, 10, N'VILLA-1', 1, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (13, 1, N'103', 1, N'Occupied', N'Inspecting', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (14, 1, N'104', 1, N'Occupied', N'Inspecting', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (15, 4, N'203', 2, N'Available', N'Clean', NULL)
INSERT [dbo].[Rooms] ([id], [room_type_id], [room_number], [floor], [status], [cleaning_status], [extension_number]) VALUES (16, 3, N'204', 2, N'Available', N'Clean', NULL)
SET IDENTITY_INSERT [dbo].[Rooms] OFF
GO
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (1, 1)
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (1, 2)
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (1, 3)
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (2, 1)
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (2, 2)
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (3, 4)
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (3, 5)
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (4, 6)
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (4, 7)
INSERT [dbo].[RoomType_Amenities] ([room_type_id], [amenity_id]) VALUES (5, 8)
GO
SET IDENTITY_INSERT [dbo].[Service_Categories] ON 

INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (1, N'Nhà Hàng & Ẩm Thực')
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (2, N'Spa & Massage')
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (3, N'Di Chuyển & Đưa Đón')
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (4, N'Giặt Ủi')
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (5, N'Tour Du Lịch')
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (6, N'Phòng Gym & Yoga')
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (7, N'Hồ Bơi')
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (8, N'Tổ Chức Sự Kiện')
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (9, N'Khu Vui Chơi Trẻ Em')
INSERT [dbo].[Service_Categories] ([id], [name]) VALUES (10, N'Cửa Hàng Lưu Niệm')
SET IDENTITY_INSERT [dbo].[Service_Categories] OFF
GO
SET IDENTITY_INSERT [dbo].[Services] ON 

INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (1, 1, N'Set Ăn Sáng Buffet', CAST(200000.00 AS Decimal(18, 2)), N'Người')
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (2, 1, N'Mì Ý Hải Sản', CAST(150000.00 AS Decimal(18, 2)), N'Phần')
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (3, 2, N'Massage Toàn Thân 60p', CAST(500000.00 AS Decimal(18, 2)), N'Lượt')
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (4, 2, N'Xông Hơi Thảo Dược', CAST(300000.00 AS Decimal(18, 2)), N'Lượt')
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (5, 3, N'Đưa Đón Sân Bay 4 Chỗ', CAST(350000.00 AS Decimal(18, 2)), N'Chuyến')
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (6, 3, N'Thuê Xe Máy Nửa Ngày', CAST(100000.00 AS Decimal(18, 2)), N'Chiếc')
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (7, 4, N'Giặt Khô Áo Vest', CAST(120000.00 AS Decimal(18, 2)), N'Cái')
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (8, 4, N'Giặt Sấy Tiêu Chuẩn', CAST(40000.00 AS Decimal(18, 2)), N'Kg')
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (9, 5, N'Tour Đảo Nửa Ngày', CAST(800000.00 AS Decimal(18, 2)), N'Người')
INSERT [dbo].[Services] ([id], [category_id], [name], [price], [unit]) VALUES (10, 10, N'Móc Khóa Kỷ Niệm', CAST(50000.00 AS Decimal(18, 2)), N'Cái')
SET IDENTITY_INSERT [dbo].[Services] OFF
GO
SET IDENTITY_INSERT [dbo].[Users] ON 

INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (1, 1, NULL, N'Admin', N'admin@hotel.com', N'0589784564', N'$2a$11$Ps2lDwm2Ewmq8R7aWM4G3OAL.YeltOJLTideDnNcJXGbXDWB6zO2C', 1, N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1773398430/QuanTriKhachSan/Avatars/ufmestnrdxqu9ulbgkko.png', NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (2, 2, NULL, N'Trần Manager', N'manager@hotel.com', N'0900000002', N'hash2', 1, NULL, NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (3, 3, NULL, N'Lê Lễ Tân', N'reception1@hotel.com', N'0900000003', N'hash3', 1, NULL, NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (4, 4, NULL, N'Phạm Lễ Tân', N'reception2@hotel.com', N'0900000004', N'hash4', 1, NULL, NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (5, 4, NULL, N'Hoàng Kế Toán', N'accountant@hotel.com', N'0900000005', N'hash5', 1, NULL, NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (6, 4, 1, N'Khách Hàng A', N'guestA@gmail.com', N'0900000006', N'hash6', 1, NULL, NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (7, 10, 2, N'Khách Hàng B', N'guestB@gmail.com', N'0900000007', N'hash7', 1, NULL, NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (8, 10, 3, N'Khách Hàng C', N'guestC@gmail.com', N'0900000008', N'hash8', 1, NULL, NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (9, 10, 4, N'Khách Hàng D', N'guestD@gmail.com', N'0900000009', N'hash9', 1, NULL, NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (10, 10, 5, N'Khách Hàng E', N'guestE@gmail.com', N'0900000010', N'hash10', 1, NULL, NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (11, 2, NULL, N'Lê Mạnh Hùng', N'hunglm@vaa.edu.vn', N'0123672890', N'$2a$11$Wl2Q.mU9p319OyPPEpztTeFSuZznXYyjFEGoW1ZBKvMWbmPtV3RXW', 1, N'https://res.cloudinary.com/dzfuzh2xg/image/upload/v1773974558/QuanTriKhachSan/Avatars/m94gqu4x7mx6jkoo1iis.jpg', CAST(N'2026-03-20T01:46:38.153' AS DateTime), CAST(N'2026-04-03' AS Date), NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (13, 3, NULL, N'Hùng Lê Mạnh 2', N'manhung08062@gmail.com', N'02323453454', N'$2a$11$GH6uRTL8Gzzycgfk18GQzuoElmtrFXWOR3AlAC9h.XXR1gk5gRXUu', 1, NULL, CAST(N'2026-03-20T07:07:59.807' AS DateTime), NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (14, 5, NULL, N'Trần Đại Nguyên', N'dainguyen1254@gmail.com', N'02343667263', N'$2a$11$zBce/0Lfo/cm/.1m3Nglieuj0kb9yWsMByKIXiBQELxUGutr5k0zS', 1, NULL, CAST(N'2026-03-21T01:57:00.337' AS DateTime), NULL, NULL)
INSERT [dbo].[Users] ([id], [role_id], [membership_id], [full_name], [email], [phone], [password_hash], [status], [avatar_url], [created_at], [date_of_birth], [address]) VALUES (15, 4, NULL, N'Nguyễn Bình An', N'nguyenbinhan2707@gmail.com', N'0589784564', N'$2a$11$gI69kqhBEAYBzcWPxglrj..uv7MwDAIgU/CvyjsjARrkU2Aw/YCBS', 1, NULL, CAST(N'2026-03-21T06:33:09.247' AS DateTime), NULL, NULL)
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
SET IDENTITY_INSERT [dbo].[Vouchers] ON 

INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (1, N'KM1', N'PERCENT', CAST(10.00 AS Decimal(18, 2)), CAST(500000.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 100)
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (2, N'KM2', N'FIXED_AMOUNT', CAST(100000.00 AS Decimal(18, 2)), CAST(1000000.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 50)
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (3, N'KM3', N'PERCENT', CAST(15.00 AS Decimal(18, 2)), CAST(2000000.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 30)
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (4, N'KM4', N'FIXED_AMOUNT', CAST(200000.00 AS Decimal(18, 2)), CAST(1500000.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 50)
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (5, N'KM5', N'PERCENT', CAST(20.00 AS Decimal(18, 2)), CAST(3000000.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 20)
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (6, N'KM6', N'FIXED_AMOUNT', CAST(50000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 200)
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (7, N'KM7', N'PERCENT', CAST(5.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 500)
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (8, N'KM8', N'FIXED_AMOUNT', CAST(500000.00 AS Decimal(18, 2)), CAST(5000000.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 10)
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (9, N'KM9', N'PERCENT', CAST(25.00 AS Decimal(18, 2)), CAST(10000000.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 5)
INSERT [dbo].[Vouchers] ([id], [code], [discount_type], [discount_value], [min_booking_value], [valid_from], [valid_to], [usage_limit]) VALUES (10, N'KM10', N'FIXED_AMOUNT', CAST(1000000.00 AS Decimal(18, 2)), CAST(20000000.00 AS Decimal(18, 2)), CAST(N'2025-01-01T00:00:00.000' AS DateTime), CAST(N'2026-12-31T00:00:00.000' AS DateTime), 2)
SET IDENTITY_INSERT [dbo].[Vouchers] OFF
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Articles__32DD1E4C621B9F62]    Script Date: 3/28/2026 9:25:30 AM ******/
ALTER TABLE [dbo].[Articles] ADD UNIQUE NONCLUSTERED 
(
	[slug] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Bookings__FF29040FE8CDD631]    Script Date: 3/28/2026 9:25:30 AM ******/
ALTER TABLE [dbo].[Bookings] ADD UNIQUE NONCLUSTERED 
(
	[booking_code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Equipmen__3ECC0FEA57E3E7F2]    Script Date: 3/28/2026 9:25:30 AM ******/
ALTER TABLE [dbo].[Equipments] ADD UNIQUE NONCLUSTERED 
(
	[ItemCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_Notifications_UserId_IsRead]    Script Date: 3/28/2026 9:25:30 AM ******/
CREATE NONCLUSTERED INDEX [IX_Notifications_UserId_IsRead] ON [dbo].[Notifications]
(
	[user_id] ASC,
	[is_read] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__AB6E61641B61BEEC]    Script Date: 3/28/2026 9:25:30 AM ******/
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Vouchers__357D4CF9D9E4CA0D]    Script Date: 3/28/2026 9:25:30 AM ******/
ALTER TABLE [dbo].[Vouchers] ADD UNIQUE NONCLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Amenities] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Article_Categories] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Articles] ADD  DEFAULT (getdate()) FOR [published_at]
GO
ALTER TABLE [dbo].[Articles] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Attractions] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Audit_Logs] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Bookings] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[Equipments] ADD  DEFAULT ((0)) FOR [TotalQuantity]
GO
ALTER TABLE [dbo].[Equipments] ADD  DEFAULT ((0)) FOR [InUseQuantity]
GO
ALTER TABLE [dbo].[Equipments] ADD  DEFAULT ((0)) FOR [DamagedQuantity]
GO
ALTER TABLE [dbo].[Equipments] ADD  DEFAULT ((0)) FOR [LiquidatedQuantity]
GO
ALTER TABLE [dbo].[Equipments] ADD  DEFAULT ((0)) FOR [BasePrice]
GO
ALTER TABLE [dbo].[Equipments] ADD  DEFAULT ((0)) FOR [DefaultPriceIfLost]
GO
ALTER TABLE [dbo].[Equipments] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Equipments] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ((0)) FOR [total_room_amount]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ((0)) FOR [total_service_amount]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ((0)) FOR [discount_amount]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ((0)) FOR [tax_amount]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ((0)) FOR [final_total]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ('Unpaid') FOR [status]
GO
ALTER TABLE [dbo].[Loss_And_Damages] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Memberships] ADD  DEFAULT ((0)) FOR [min_points]
GO
ALTER TABLE [dbo].[Memberships] ADD  DEFAULT ((0.00)) FOR [discount_percent]
GO
ALTER TABLE [dbo].[Notifications] ADD  CONSTRAINT [DF_Notifications_is_read]  DEFAULT ((0)) FOR [is_read]
GO
ALTER TABLE [dbo].[Notifications] ADD  CONSTRAINT [DF_Notifications_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Order_Services] ADD  DEFAULT (getdate()) FOR [order_date]
GO
ALTER TABLE [dbo].[Order_Services] ADD  DEFAULT ((0)) FOR [total_amount]
GO
ALTER TABLE [dbo].[Order_Services] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[Payments] ADD  DEFAULT (getdate()) FOR [payment_date]
GO
ALTER TABLE [dbo].[Reviews] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Room_Images] ADD  DEFAULT ((0)) FOR [is_primary]
GO
ALTER TABLE [dbo].[Room_Images] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Room_Inventory] ADD  DEFAULT ((1)) FOR [quantity]
GO
ALTER TABLE [dbo].[Room_Inventory] ADD  DEFAULT ((0)) FOR [price_if_lost]
GO
ALTER TABLE [dbo].[Room_Inventory] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Room_Inventory] ADD  DEFAULT ('Asset') FOR [item_type]
GO
ALTER TABLE [dbo].[Room_Types] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Rooms] ADD  DEFAULT ('Available') FOR [status]
GO
ALTER TABLE [dbo].[Rooms] ADD  DEFAULT ('Clean') FOR [cleaning_status]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[Vouchers] ADD  DEFAULT ((0)) FOR [min_booking_value]
GO
ALTER TABLE [dbo].[Articles]  WITH CHECK ADD FOREIGN KEY([author_id])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Articles]  WITH CHECK ADD FOREIGN KEY([category_id])
REFERENCES [dbo].[Article_Categories] ([id])
GO
ALTER TABLE [dbo].[Audit_Logs]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Booking_Details]  WITH CHECK ADD FOREIGN KEY([booking_id])
REFERENCES [dbo].[Bookings] ([id])
GO
ALTER TABLE [dbo].[Booking_Details]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[Rooms] ([id])
GO
ALTER TABLE [dbo].[Booking_Details]  WITH CHECK ADD FOREIGN KEY([room_type_id])
REFERENCES [dbo].[Room_Types] ([id])
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD FOREIGN KEY([voucher_id])
REFERENCES [dbo].[Vouchers] ([id])
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD FOREIGN KEY([booking_id])
REFERENCES [dbo].[Bookings] ([id])
GO
ALTER TABLE [dbo].[Loss_And_Damages]  WITH CHECK ADD FOREIGN KEY([booking_detail_id])
REFERENCES [dbo].[Booking_Details] ([id])
GO
ALTER TABLE [dbo].[Loss_And_Damages]  WITH CHECK ADD FOREIGN KEY([room_inventory_id])
REFERENCES [dbo].[Room_Inventory] ([id])
GO
ALTER TABLE [dbo].[Notifications]  WITH CHECK ADD  CONSTRAINT [FK_Notifications_Users] FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Notifications] CHECK CONSTRAINT [FK_Notifications_Users]
GO
ALTER TABLE [dbo].[Order_Service_Details]  WITH CHECK ADD FOREIGN KEY([order_service_id])
REFERENCES [dbo].[Order_Services] ([id])
GO
ALTER TABLE [dbo].[Order_Service_Details]  WITH CHECK ADD FOREIGN KEY([service_id])
REFERENCES [dbo].[Services] ([id])
GO
ALTER TABLE [dbo].[Order_Services]  WITH CHECK ADD FOREIGN KEY([booking_detail_id])
REFERENCES [dbo].[Booking_Details] ([id])
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD FOREIGN KEY([invoice_id])
REFERENCES [dbo].[Invoices] ([id])
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD FOREIGN KEY([room_type_id])
REFERENCES [dbo].[Room_Types] ([id])
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Role_Permissions]  WITH CHECK ADD FOREIGN KEY([permission_id])
REFERENCES [dbo].[Permissions] ([id])
GO
ALTER TABLE [dbo].[Role_Permissions]  WITH CHECK ADD FOREIGN KEY([role_id])
REFERENCES [dbo].[Roles] ([id])
GO
ALTER TABLE [dbo].[Room_Images]  WITH CHECK ADD FOREIGN KEY([room_type_id])
REFERENCES [dbo].[Room_Types] ([id])
GO
ALTER TABLE [dbo].[Room_Inventory]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[Rooms] ([id])
GO
ALTER TABLE [dbo].[Room_Inventory]  WITH CHECK ADD  CONSTRAINT [FK_RoomInventory_Equipments] FOREIGN KEY([EquipmentId])
REFERENCES [dbo].[Equipments] ([Id])
GO
ALTER TABLE [dbo].[Room_Inventory] CHECK CONSTRAINT [FK_RoomInventory_Equipments]
GO
ALTER TABLE [dbo].[Rooms]  WITH CHECK ADD FOREIGN KEY([room_type_id])
REFERENCES [dbo].[Room_Types] ([id])
GO
ALTER TABLE [dbo].[RoomType_Amenities]  WITH CHECK ADD FOREIGN KEY([amenity_id])
REFERENCES [dbo].[Amenities] ([id])
GO
ALTER TABLE [dbo].[RoomType_Amenities]  WITH CHECK ADD FOREIGN KEY([room_type_id])
REFERENCES [dbo].[Room_Types] ([id])
GO
ALTER TABLE [dbo].[Services]  WITH CHECK ADD FOREIGN KEY([category_id])
REFERENCES [dbo].[Service_Categories] ([id])
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD FOREIGN KEY([membership_id])
REFERENCES [dbo].[Memberships] ([id])
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD FOREIGN KEY([role_id])
REFERENCES [dbo].[Roles] ([id])
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD CHECK  (([rating]>=(1) AND [rating]<=(5)))
GO
USE [master]
GO
ALTER DATABASE [HotelManagementDB] SET  READ_WRITE 
GO


-- =========================================================================
-- PHẦN BỔ SUNG: CẬP NHẬT CẤU TRÚC VÀ DỮ LIỆU TỪ BACKEND CỦA SINH VIÊN
-- BẠN CHỈ CẦN PASTE ĐOẠN NÀY VÀO DƯỚI CÙNG CỦA FILE GIẢNG VIÊN LÀ XONG!
-- =========================================================================

USE [HotelManagementDB];
GO

-- 1. TẠO BẢNG MỚI (User_Permissions & Refresh_Tokens)
IF OBJECT_ID(N'[dbo].[User_Permissions]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[User_Permissions] (
        [user_id] INT NOT NULL,
        [permission_id] INT NOT NULL,
        [is_granted] BIT NOT NULL, 
        [created_at] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [PK_User_Permissions] PRIMARY KEY ([user_id], [permission_id]),
        CONSTRAINT [FK_UserPermissions_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]),
        CONSTRAINT [FK_UserPermissions_Permissions] FOREIGN KEY ([permission_id]) REFERENCES [dbo].[Permissions]([id])
    );
END

IF OBJECT_ID(N'[dbo].[Refresh_Tokens]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Refresh_Tokens] (
        [id] int NOT NULL IDENTITY(1,1),
        [user_id] int NOT NULL,
        [token] nvarchar(500) NOT NULL,
        [jwt_id] nvarchar(255) NOT NULL,
        [is_used] bit NOT NULL DEFAULT 0,
        [is_revoked] bit NOT NULL DEFAULT 0,
        [created_at] datetime NOT NULL DEFAULT GETDATE(),
        [expire_at] datetime NOT NULL,
        CONSTRAINT [PK_Refresh_Tokens] PRIMARY KEY ([id]),
        CONSTRAINT [FK_RefreshTokens_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users] ([id])
    );
    CREATE INDEX [IX_Refresh_Tokens_user_id] ON [dbo].[Refresh_Tokens] ([user_id]);
END
GO

-- 2. THÊM CỘT MỚI VÀO CÁC BẢNG HIỆN TẠI (Dùng IF để không lỗi nếu chạy nhiều lần)
IF COL_LENGTH('dbo.Users', 'avatar_public_id') IS NULL ALTER TABLE [dbo].[Users] ADD [avatar_public_id] NVARCHAR(255) NULL;
IF COL_LENGTH('dbo.Users', 'loyalty_points') IS NULL ALTER TABLE [dbo].[Users] ADD [loyalty_points] INT NOT NULL DEFAULT 0;
IF COL_LENGTH('dbo.Users', 'updated_at') IS NULL ALTER TABLE [dbo].[Users] ADD [updated_at] DATETIME NULL;
IF COL_LENGTH('dbo.Users', 'last_login_at') IS NULL ALTER TABLE [dbo].[Users] ADD [last_login_at] DATETIME NULL;

IF COL_LENGTH('dbo.Roles', 'status') IS NULL ALTER TABLE [dbo].[Roles] ADD [status] NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
IF COL_LENGTH('dbo.Roles', 'created_at') IS NULL ALTER TABLE [dbo].[Roles] ADD [created_at] DATETIME NOT NULL DEFAULT GETDATE();
IF COL_LENGTH('dbo.Roles', 'updated_at') IS NULL ALTER TABLE [dbo].[Roles] ADD [updated_at] DATETIME NULL;

IF COL_LENGTH('dbo.Permissions', 'description') IS NULL ALTER TABLE [dbo].[Permissions] ADD [description] NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Permissions', 'group_name') IS NULL ALTER TABLE [dbo].[Permissions] ADD [group_name] NVARCHAR(100) NULL;
IF COL_LENGTH('dbo.Permissions', 'created_at') IS NULL ALTER TABLE [dbo].[Permissions] ADD [created_at] DATETIME NOT NULL DEFAULT GETDATE();

IF COL_LENGTH('dbo.Memberships', 'benefits') IS NULL ALTER TABLE [dbo].[Memberships] ADD [benefits] NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.Memberships', 'status') IS NULL ALTER TABLE [dbo].[Memberships] ADD [status] NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
IF COL_LENGTH('dbo.Memberships', 'created_at') IS NULL ALTER TABLE [dbo].[Memberships] ADD [created_at] DATETIME NOT NULL DEFAULT GETDATE();
IF COL_LENGTH('dbo.Memberships', 'updated_at') IS NULL ALTER TABLE [dbo].[Memberships] ADD [updated_at] DATETIME NULL;

IF COL_LENGTH('dbo.Articles', 'summary') IS NULL ALTER TABLE [dbo].[Articles] ADD [summary] NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.Articles', 'thumbnail_public_id') IS NULL ALTER TABLE [dbo].[Articles] ADD [thumbnail_public_id] NVARCHAR(255) NULL;
IF COL_LENGTH('dbo.Articles', 'status') IS NULL ALTER TABLE [dbo].[Articles] ADD [status] NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
IF COL_LENGTH('dbo.Articles', 'created_at') IS NULL ALTER TABLE [dbo].[Articles] ADD [created_at] DATETIME NOT NULL DEFAULT GETDATE();
IF COL_LENGTH('dbo.Articles', 'updated_at') IS NULL ALTER TABLE [dbo].[Articles] ADD [updated_at] DATETIME NULL;

IF COL_LENGTH('dbo.Room_Types', 'late_checkout_fee_percent') IS NULL ALTER TABLE [dbo].[Room_Types] ADD [late_checkout_fee_percent] DECIMAL(5,2) NOT NULL DEFAULT 0;
IF COL_LENGTH('dbo.Room_Types', 'extra_hour_price') IS NULL ALTER TABLE [dbo].[Room_Types] ADD [extra_hour_price] DECIMAL(18,2) NOT NULL DEFAULT 0;
IF COL_LENGTH('dbo.Room_Types', 'status') IS NULL ALTER TABLE [dbo].[Room_Types] ADD [status] NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
IF COL_LENGTH('dbo.Room_Types', 'created_at') IS NULL ALTER TABLE [dbo].[Room_Types] ADD [created_at] DATETIME NOT NULL DEFAULT GETDATE();
IF COL_LENGTH('dbo.Room_Types', 'updated_at') IS NULL ALTER TABLE [dbo].[Room_Types] ADD [updated_at] DATETIME NULL;
GO
-- DATABASE SETTINGS RESTORED
GO
    CONSTRAINT [FK_AuditLogs_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id])
);
GO

CREATE TABLE [dbo].[Notifications] (
    [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [user_id] INT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [is_read] BIT DEFAULT 0,
    [created_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id])
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
INSERT [dbo].[Permissions] ([id], [name], [description]) VALUES 
(1, N'VIEW_DASHBOARD', N'Xem bảng điều khiển'),
(2, N'MANAGE_USERS', N'Quản lý nhân sự'),
(3, N'MANAGE_ROLES', N'Quản lý chức vụ & quyền'),
(4, N'MANAGE_ROOMS', N'Quản lý danh mục phòng'),
(5, N'MANAGE_BOOKINGS', N'Quản lý đặt phòng'),
(6, N'MANAGE_INVOICES', N'Quản lý hóa đơn'),
(7, N'MANAGE_SERVICES', N'Quản lý dịch vụ'),
(8, N'VIEW_REPORTS', N'Xem báo cáo'),
(9, N'MANAGE_CONTENT', N'Quản lý bài viết/tin tức'),
(10, N'MANAGE_INVENTORY', N'Quản lý kho vật tư'),
(11, N'VIEW_SYSTEM_LOGS', N'Xem nhật ký hệ thống'),
(12, N'VIEW_NOTIFICATIONS', N'Xem thông báo'),
(13, N'VIEW_ROOMS', N'Xem trạng thái phòng'),
(14, N'UPDATE_ROOM_STATUS', N'Cập nhật dọn phòng'),
(15, N'CHECK_IN_OUT', N'Thủ tục nhận/trả phòng'),
(16, N'MANAGE_AMENITIES', N'Quản lý tiện nghi'),
(17, N'MANAGE_MAINTENANCE', N'Quản lý bảo trì')
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
(1,1), (1,2), (1,3), (1,4), (1,5), (1,6), (1,7), (1,8), (1,9), (1,10), (1,11), (1,12), (1,13), (1,14), (1,15), (1,16), (1,17), -- Admin (Full 17 Quyền)
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

-- 4. CẬP NHẬT PASSWORD MỚI (Mã hóa Bcrypt của bạn) CHO CÁC TÀI KHOẢN MẪU
UPDATE [dbo].[Users] 
SET [password_hash] = N'$2y$10$wN7KjZt59g0xK5A03v0s/eTq8P9g9B1N0jU3zR5M5N0x3B8b6Q1Oa' 
WHERE [email] IN (
    'admin@hotel.com', 'manager@hotel.com', 'reception1@hotel.com', 
    'reception2@hotel.com', 'accountant@hotel.com', 'guestA@gmail.com', 
    'guestB@gmail.com', 'guestC@gmail.com', 'guestD@gmail.com', 'guestE@gmail.com'
);
GO

-- Cập nhật mô tả (description) cho các quyền đã có sẵn của Giảng viên
UPDATE [dbo].[Permissions] SET [description] = N'Xem bảng điều khiển tổng quan' WHERE [name] = 'VIEW_DASHBOARD';
UPDATE [dbo].[Permissions] SET [description] = N'Quản lý tài khoản người dùng' WHERE [name] = 'MANAGE_USERS';
UPDATE [dbo].[Permissions] SET [description] = N'Quản lý các vai trò phân quyền' WHERE [name] = 'MANAGE_ROLES';
UPDATE [dbo].[Permissions] SET [description] = N'Quản lý danh mục và phòng' WHERE [name] = 'MANAGE_ROOMS';
UPDATE [dbo].[Permissions] SET [description] = N'Quản lý các đơn đặt phòng' WHERE [name] = 'MANAGE_BOOKINGS';
UPDATE [dbo].[Permissions] SET [description] = N'Quản lý hóa đơn và thanh toán' WHERE [name] = 'MANAGE_INVOICES';
UPDATE [dbo].[Permissions] SET [description] = N'Quản lý các dịch vụ đi kèm' WHERE [name] = 'MANAGE_SERVICES';
UPDATE [dbo].[Permissions] SET [description] = N'Xem các báo cáo thống kê' WHERE [name] = 'VIEW_REPORTS';
UPDATE [dbo].[Permissions] SET [description] = N'Quản lý bài viết và nội dung' WHERE [name] = 'MANAGE_CONTENT';
UPDATE [dbo].[Permissions] SET [description] = N'Quản lý kho và tài sản thiết bị' WHERE [name] = 'MANAGE_INVENTORY';
UPDATE [dbo].[Permissions] SET [description] = N'Xem danh sách người dùng' WHERE [name] = 'VIEW_USERS';
UPDATE [dbo].[Permissions] SET [description] = N'Xem danh sách vai trò' WHERE [name] = 'VIEW_ROLES';
UPDATE [dbo].[Permissions] SET [description] = N'Chỉnh sửa thông tin vai trò' WHERE [name] = 'EDIT_ROLES';
UPDATE [dbo].[Permissions] SET [description] = N'Tạo tài khoản người dùng mới' WHERE [name] = 'CREATE_USERS';
GO


-- Cập nhật bảng Attractions
ALTER TABLE Attractions ADD 
    ImageUrl nvarchar(max) NULL, 
    ImagePublicId nvarchar(255) NULL, 
    CreatedAt datetime NULL, 
    Status varchar(50) DEFAULT 'ACTIVE';
GO

-- Cập nhật bảng Articles
-- Tìm đoạn này ở cuối file và thay thế bằng nội dung bên dưới
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Articles]') AND name = 'summary')
BEGIN
    ALTER TABLE [dbo].[Articles] ADD [summary] NVARCHAR(1000) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Articles]') AND name = 'thumbnail_public_id')
BEGIN
    ALTER TABLE [dbo].[Articles] ADD [thumbnail_public_id] NVARCHAR(255) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Articles]') AND name = 'status')
BEGIN
    ALTER TABLE [dbo].[Articles] ADD [status] NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
END
GO

-- Cập nhật bảng Reviews
ALTER TABLE Reviews ADD 
    ImageUrl nvarchar(max) NULL, 
    ImagePublicId nvarchar(255) NULL, 
    IsApproved bit DEFAULT 1,
    Status varchar(50) DEFAULT 'VISIBLE';

GO
-- Thêm cột cho Role_Permissions
ALTER TABLE [dbo].[Role_Permissions] ADD [created_at] DATETIME DEFAULT GETDATE();
GO

-- Thêm cột cho Audit_Logs
ALTER TABLE [dbo].[Audit_Logs] ADD [reason] NVARCHAR(1000) NULL;
GO

-- 1. Tìm và xóa Default Constraint (đang set 'ACTIVE') vừa được thêm ở bước trước
DECLARE @ConstraintName nvarchar(200);
SELECT @ConstraintName = name 
FROM sys.default_constraints 
WHERE parent_object_id = OBJECT_ID('[dbo].[Users]') 
  AND parent_column_id = (SELECT column_id FROM sys.columns WHERE name = 'status' AND object_id = OBJECT_ID('[dbo].[Users]'));

IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE [dbo].[Users] DROP CONSTRAINT ' + @ConstraintName);
END
GO

-- 3. Ép kiểu cột status trở lại thành nguyên bản là BIT
ALTER TABLE [dbo].[Users] ALTER COLUMN [status] [bit] NULL;
GO

-- 4. Thêm lại Default Constraint mặc định là 1 (Hoạt động)
ALTER TABLE [dbo].[Users] ADD CONSTRAINT DF_Users_Status_Bit DEFAULT ((1)) FOR [status];
GO

UPDATE [dbo].[Users] SET [created_at] = GETDATE() WHERE [created_at] IS NULL;
UPDATE [dbo].[Users] SET [updated_at] = GETDATE() WHERE [updated_at] IS NULL;
GO

INSERT INTO [dbo].[Role_Permissions] ([role_id], [permission_id])
SELECT 1, id 
FROM [dbo].[Permissions] 
WHERE [name] IN (
    'VIEW_SYSTEM_LOGS', 
    'VIEW_NOTIFICATIONS', 
    'VIEW_ROOMS', 
    'UPDATE_ROOM_STATUS', 
    'CHECK_IN_OUT', 
    'MANAGE_AMENITIES', 
    'MANAGE_MAINTENANCE'
)
AND NOT EXISTS (
    SELECT 1 FROM [dbo].[Role_Permissions] rp 
    WHERE rp.role_id = 1 AND rp.permission_id = [dbo].[Permissions].id
);
GO