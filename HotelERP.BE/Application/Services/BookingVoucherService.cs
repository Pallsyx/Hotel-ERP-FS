using HotelERP.BE.DTOs.Vouchers;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

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
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return (false, "BOOKING_NOT_FOUND", null);

            var voucher = await _context.Vouchers.SingleOrDefaultAsync(v => v.Code == voucherCode);
            if (voucher == null) return (false, "VOUCHER_NOT_FOUND", null);

            // --- 1. VALIDATE ---
            if (voucher.Status != "ACTIVE")
                return (false, "VOUCHER_INACTIVE", null);

            var now = DateTime.UtcNow;
            if ((voucher.ValidFrom.HasValue && voucher.ValidFrom.Value > now) || 
                (voucher.ValidTo.HasValue && voucher.ValidTo.Value < now))
            {
                return (false, "VOUCHER_EXPIRED", null);
            }

            if (voucher.UsageLimit.HasValue && voucher.UsedCount >= voucher.UsageLimit.Value)
                return (false, "USAGE_LIMIT_EXCEEDED", null);

            var subtotal = booking.BookingSubtotal; 
            if (subtotal < voucher.MinBookingAmount)
                return (false, "MIN_BOOKING_NOT_MET", null);

            // --- 2. TÍNH TOÁN ---
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

            decimal finalAmount = subtotal - discount;
            if (finalAmount < 0m) finalAmount = 0m;

            // --- 3. CẬP NHẬT DB ---
            booking.VoucherId = voucher.Id;
            booking.DiscountAmount = discount;
            booking.FinalAmount = finalAmount;
            booking.UpdatedAt = now;

            voucher.UsedCount += 1;

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

            if (booking.Voucher != null && booking.Voucher.UsedCount > 0)
            {
                booking.Voucher.UsedCount -= 1;
            }

            booking.VoucherId = null;
            await _context.SaveChangesAsync();

            return (true, string.Empty, new VoucherResponse
            {
                Subtotal = subtotal,
                DiscountAmount = 0m,
                FinalAmount = subtotal
            });
        }
    }
}