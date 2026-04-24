using System;
using Microsoft.Data.SqlClient;

class Program
{
    static void Main()
    {
        string connStr = "Server=localhost;Database=HotelManagementDB;Trusted_Connection=True;TrustServerCertificate=True;";
        try
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();
                // Update articles 1-10 to Published
                using (SqlCommand cmd = new SqlCommand("UPDATE Articles SET status = 'Published' WHERE id <= 10", conn))
                {
                    int rows = cmd.ExecuteNonQuery();
                    Console.WriteLine($"Updated {rows} articles to Published.");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Lỗi: " + ex.Message);
        }
    }
}
