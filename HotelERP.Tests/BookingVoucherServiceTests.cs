using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Services.Bookings;
using Microsoft.EntityFrameworkCore;
using Moq;
using RedLockNet;
using System;
using System.Threading.Tasks;
using Xunit;

namespace HotelERP.Tests
{
    public class BookingVoucherServiceTests
    {
        private HotelDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<HotelDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new HotelDbContext(options);
        }

        [Fact]
        public async Task ApplyVoucherAsync_VoucherNotFound_ReturnsError()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var booking = new Booking { Id = 1, BookingSubtotal = 1000m, BookingCode = "B001", Status = "Pending", PaymentStatus = "Unpaid" };
            context.Bookings.Add(booking);
            await context.SaveChangesAsync();

            var mockLockFactory = new Mock<IDistributedLockFactory>();
            var service = new BookingVoucherService(context, mockLockFactory.Object);

            // Act
            var result = await service.ApplyVoucherAsync(1, "NON_EXISTENT");

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("VOUCHER_NOT_FOUND", result.ErrorCode);
        }

        [Fact]
        public async Task ApplyVoucherAsync_SystemBusy_ReturnsSystemBusyError()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var booking = new Booking { Id = 1, BookingSubtotal = 1000m, BookingCode = "B001", Status = "Pending", PaymentStatus = "Unpaid" };
            var voucher = new Voucher { Id = 1, Code = "DISCOUNT10", DiscountType = "PERCENT", DiscountValue = 10, ValidFrom = DateTime.UtcNow.AddDays(-1), ValidTo = DateTime.UtcNow.AddDays(1) };
            
            context.Bookings.Add(booking);
            context.Vouchers.Add(voucher);
            await context.SaveChangesAsync();

            var mockLockFactory = new Mock<IDistributedLockFactory>();
            var mockLock = new Mock<IRedLock>();
            mockLock.Setup(x => x.IsAcquired).Returns(false); // Simulate lock not acquired
            mockLockFactory.Setup(x => x.CreateLockAsync(It.IsAny<string>(), It.IsAny<TimeSpan>()))
                .ReturnsAsync(mockLock.Object);

            var service = new BookingVoucherService(context, mockLockFactory.Object);

            // Act
            var result = await service.ApplyVoucherAsync(1, "DISCOUNT10");

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("SYSTEM_BUSY", result.ErrorCode);
        }

        [Fact]
        public async Task ApplyVoucherAsync_ValidVoucher_AppliesDiscount()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var booking = new Booking { Id = 1, BookingSubtotal = 1000000m, BookingCode = "B001", Status = "Pending", PaymentStatus = "Unpaid" };
            var voucher = new Voucher { Id = 1, Code = "DISCOUNT10", DiscountType = "PERCENT", DiscountValue = 10, ValidFrom = DateTime.UtcNow.AddDays(-1), ValidTo = DateTime.UtcNow.AddDays(1), MinBookingValue = 500000m };
            
            context.Bookings.Add(booking);
            context.Vouchers.Add(voucher);
            await context.SaveChangesAsync();

            var mockLockFactory = new Mock<IDistributedLockFactory>();
            var mockLock = new Mock<IRedLock>();
            mockLock.Setup(x => x.IsAcquired).Returns(true); // Lock acquired
            mockLockFactory.Setup(x => x.CreateLockAsync(It.IsAny<string>(), It.IsAny<TimeSpan>()))
                .ReturnsAsync(mockLock.Object);

            var service = new BookingVoucherService(context, mockLockFactory.Object);

            // Act
            var result = await service.ApplyVoucherAsync(1, "DISCOUNT10");

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(100000m, result.Data.DiscountAmount); // 10% of 1,000,000
            Assert.Equal(900000m, result.Data.FinalAmount);

            // Verify DB changes
            var dbBooking = await context.Bookings.FindAsync(1);
            Assert.Equal(1, dbBooking.VoucherId);
            Assert.Equal(100000m, dbBooking.DiscountAmount);
            Assert.Equal(900000m, dbBooking.FinalAmount);
        }
    }
}
