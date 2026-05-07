using HotelERP.BE.Domain.Models;
using HotelERP.BE.Helpers.AuditLogs;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Services.Vouchers;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace HotelERP.Tests
{
    public class VoucherServiceTests
    {
        private HotelDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<HotelDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new HotelDbContext(options);
        }

        [Fact]
        public async Task ExpireVouchersJobAsync_ShouldExpireVoucher_WhenUsageLimitReached()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            
            // Voucher 1: Bị vượt quá số lần sử dụng nhưng ValidTo vẫn ở tương lai
            var exhaustedVoucher = new Voucher 
            { 
                Id = 1, 
                Code = "EXP10", 
                DiscountType = "PERCENT", 
                DiscountValue = 10, 
                ValidFrom = DateTime.UtcNow.AddDays(-5), 
                ValidTo = DateTime.UtcNow.AddDays(5), // Vẫn còn hạn
                UsageLimit = 1 // Chỉ cho dùng 1 lần
            };

            // Tạo một Booking giả lập đã sử dụng voucher này
            var booking = new Booking
            {
                Id = 1,
                VoucherId = 1,
                Status = "Completed",
                PaymentStatus = "Paid",
                BookingCode = "B001"
            };

            // Voucher 2: Vẫn còn hạn và còn lượt
            var validVoucher = new Voucher 
            { 
                Id = 2, 
                Code = "VAL20", 
                DiscountType = "PERCENT", 
                DiscountValue = 20, 
                ValidFrom = DateTime.UtcNow.AddDays(-1), 
                ValidTo = DateTime.UtcNow.AddDays(5), // Còn hạn 5 ngày
                UsageLimit = 10 
            };

            context.Vouchers.AddRange(exhaustedVoucher, validVoucher);
            context.Bookings.Add(booking);
            await context.SaveChangesAsync();

            var mockAuditLogHelper = new Mock<IVoucherAuditLogHelper>();
            var service = new VoucherService(context, mockAuditLogHelper.Object);

            // Act
            await service.ExpireVouchersJobAsync(CancellationToken.None);

            // Assert
            var dbExpiredVoucher = await context.Vouchers.FindAsync(1);
            var dbValidVoucher = await context.Vouchers.FindAsync(2);

            // Voucher 1 phải bị ghi đè Reason và ValidTo bị dời về quá khứ
            Assert.Contains("Hệ thống tự động vô hiệu hóa", dbExpiredVoucher.Reason);
            Assert.True(dbExpiredVoucher.ValidTo < DateTime.UtcNow);
            
            // Voucher 2 không bị thay đổi Reason
            Assert.Null(dbValidVoucher.Reason);
        }
    }
}
