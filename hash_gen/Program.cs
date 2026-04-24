using System;
using Microsoft.Data.SqlClient;
using BCrypt.Net;

class Program
{
    static void Main()
    {
        string connStr = "Server=localhost;Database=HotelManagementDB;Trusted_Connection=True;TrustServerCertificate=True;";
        
        // Mật khẩu user muốn dùng
        string hashAdmin = BCrypt.Net.BCrypt.HashPassword("admin");
        string hashQuan = BCrypt.Net.BCrypt.HashPassword("quan");

        try
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();

                // Cập nhật cho tài khoản ADMIN
                using (SqlCommand cmd = new SqlCommand($"UPDATE Users SET password_hash = '{hashAdmin}' WHERE email = 'ADMIN'", conn))
                {
                    cmd.ExecuteNonQuery();
                    Console.WriteLine("Đã cập nhật mật khẩu cho ADMIN thành: admin");
                }

                // Cập nhật cho tài khoản admin@hotel.com (đề phòng user dùng email này nhưng gõ password admin)
                using (SqlCommand cmd = new SqlCommand($"UPDATE Users SET password_hash = '{hashAdmin}' WHERE email = 'admin@hotel.com'", conn))
                {
                    cmd.ExecuteNonQuery();
                    Console.WriteLine("Đã cập nhật mật khẩu cho admin@hotel.com thành: admin");
                }

                // Cập nhật cho tài khoản quan
                using (SqlCommand cmd = new SqlCommand($"UPDATE Users SET password_hash = '{hashQuan}' WHERE email = 'quan'", conn))
                {
                    cmd.ExecuteNonQuery();
                    Console.WriteLine("Đã cập nhật mật khẩu cho quan thành: quan");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Lỗi: " + ex.Message);
        }
    }
}
