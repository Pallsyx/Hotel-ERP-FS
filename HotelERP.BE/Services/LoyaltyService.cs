using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelERP.BE.Services;

public class LoyaltyService
{
    private readonly HotelDbContext _context;

    public LoyaltyService(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Xử lý cộng điểm khi Hóa đơn (Invoice) chuyển sang trạng thái Đã thanh toán (PAID).
    /// </summary>
    /// <param name="invoiceId">ID của hóa đơn vừa được thanh toán</param>
    public async Task<bool> ProcessCompletedInvoiceAsync(int invoiceId)
    {
        // 1. Lấy thông tin Hóa đơn (Invoice) kèm theo Booking và User
        var invoice = await _context.Invoices
            .Include(i => i.Booking)
                .ThenInclude(b => b.User)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        // Nếu không tìm thấy, hoặc là khách vãng lai (không có tài khoản User) -> Bỏ qua
        if (invoice == null || invoice.Booking == null || invoice.Booking.UserId == null || invoice.Booking.User == null) 
            return false;

        // 2. RÀNG BUỘC TRẠNG THÁI THEO YÊU CẦU: Chỉ xử lý khi Hóa đơn (Invoice) là PAID
        // (Dùng ToUpper() để tránh lỗi phân biệt hoa/thường: Paid, PAID, paid đều nhận)
        if (string.IsNullOrEmpty(invoice.Status) || invoice.Status.ToUpper() != "PAID") 
            return false;

        // 3. CHỐNG DUPLICATE BẰNG CỜ (MARKER): 
        // Kiểm tra xem Booking liên kết với hóa đơn này đã được cộng điểm chưa
        if (invoice.Booking.IsPointsAwarded == true) 
            return false; 

        // 4. RULE TÍNH ĐIỂM: 10.000 VNĐ = 1 Điểm (Lấy theo FinalTotal của Hóa đơn)
        decimal finalAmount = invoice.FinalTotal ?? 0;
        int pointsToAdd = (int)(finalAmount / 10000);

        if (pointsToAdd <= 0) 
            return false; // Tiền hóa đơn quá nhỏ không đủ đổi điểm

        // 5. CỘNG ĐIỂM VÀO BẢNG USER
        var user = invoice.Booking.User;
        int currentPoints = user.LoyaltyPoints ?? 0;
        user.LoyaltyPoints = currentPoints + pointsToAdd;

        // 6. UPDATE HẠNG THÀNH VIÊN (Dựa trên điểm mới)
        var activeMemberships = await _context.Memberships
            .Where(m => m.Status == "ACTIVE")
            .OrderByDescending(m => m.MinPoints)
            .ToListAsync();

        // Tìm hạng cao nhất mà số điểm hiện tại thỏa mãn
        var newTier = activeMemberships.FirstOrDefault(m => user.LoyaltyPoints >= m.MinPoints);
        
        if (newTier != null && user.MembershipId != newTier.Id)
        {
            user.MembershipId = newTier.Id;
        }

        // 7. BẬT CỜ ĐÁNH DẤU ĐỂ CHỐNG CỘNG TRÙNG LẶP CHO LẦN SAU
        invoice.Booking.IsPointsAwarded = true;

        // 8. CẬP NHẬT DATABASE
        _context.Users.Update(user);
        _context.Bookings.Update(invoice.Booking);
        
        await _context.SaveChangesAsync();

        return true;
    }
}