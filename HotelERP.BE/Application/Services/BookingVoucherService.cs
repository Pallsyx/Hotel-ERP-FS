using HotelERP.BE.DTOs.Vouchers;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelERP.BE.Services.Bookings
{
    public class BookingVoucherService : IBookingVoucherService
    {
        private readonly HotelDbContext _context;

        public BookingVoucherService(HotelDbContext context)
        {
            _context = context;
        }

        public async Task<(bool IsSuccess, string ErrorCode, VoucherResponse? Data)> ApplyVoucherAsync(int bookingId, string voucherCode)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(x => x.Id == bookingId);
            if (booking == null) return (false, "BOOKING_NOT_FOUND", null);

            var normalizedCode = voucherCode?.Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(normalizedCode)) return (false, "VOUCHER_NOT_FOUND", null);

            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == normalizedCode);
            if (voucher == null) return (false, "VOUCHER_NOT_FOUND", null);

            var now = DateTime.UtcNow;
            var usedCount = await GetUsedCountAsync(voucher.Id);
            var status = ResolveVoucherStatus(voucher, usedCount, now);

            if (status != "ACTIVE")
                return (false, "VOUCHER_INACTIVE", null);

            if (voucher.UsageLimit.HasValue && usedCount >= voucher.UsageLimit.Value)
                return (false, "USAGE_LIMIT_EXCEEDED", null);

            var subtotal = booking.BookingSubtotal;
            if (subtotal < voucher.MinBookingValue)
                return (false, "MIN_BOOKING_NOT_MET", null);

            decimal discount = 0m;
            if (voucher.DiscountType == "PERCENT")
            {
                discount = subtotal * (voucher.DiscountValue / 100m);
            }
            else if (voucher.DiscountType == "FIXED_AMOUNT")
            {
                discount = voucher.DiscountValue;
            }

            if (discount > subtotal) discount = subtotal;

            var finalAmount = subtotal - discount;
            if (finalAmount < 0m) finalAmount = 0m;

            booking.VoucherId = voucher.Id;
            booking.DiscountAmount = discount;
            booking.FinalAmount = finalAmount;
            booking.UpdatedAt = now;

            await _context.SaveChangesAsync();

            return (true, string.Empty, new VoucherResponse
            {
                Subtotal = subtotal,
                DiscountAmount = discount,
                FinalAmount = finalAmount
            });
        }

        public async Task<(bool IsSuccess, string ErrorCode, VoucherResponse? Data)> RemoveVoucherAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Voucher)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null) return (false, "BOOKING_NOT_FOUND", null);
            if (booking.VoucherId == null) return (false, "NO_VOUCHER_APPLIED", null);

            var subtotal = booking.BookingSubtotal;
            booking.DiscountAmount = 0m;
            booking.FinalAmount = subtotal;
            booking.UpdatedAt = DateTime.UtcNow;
            booking.VoucherId = null;

            await _context.SaveChangesAsync();

            return (true, string.Empty, new VoucherResponse
            {
                Subtotal = subtotal,
                DiscountAmount = 0m,
                FinalAmount = subtotal
            });
        }

        private async Task<int> GetUsedCountAsync(int voucherId)
        {
            return await _context.Bookings.CountAsync(x => x.VoucherId == voucherId);
        }

        private static string ResolveVoucherStatus(Domain.Models.Voucher voucher, int usedCount, DateTime now)
        {
            if (voucher.ValidFrom.HasValue && voucher.ValidFrom.Value > now)
            {
                return "INACTIVE";
            }

            if (voucher.ValidTo.HasValue && voucher.ValidTo.Value < now)
            {
                return "INACTIVE";
            }

            if (voucher.UsageLimit.HasValue && usedCount >= voucher.UsageLimit.Value)
            {
                return "INACTIVE";
            }

            return "ACTIVE";
        }
    }
}