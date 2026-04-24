using System;
using Microsoft.Data.SqlClient;

class Program
{
    static void Main()
    {
        string connectionString = "Server=DESKTOP-3R12C2Q;Database=HotelManagementDB;Trusted_Connection=True;TrustServerCertificate=True;";
        string sql = @"
            UPDATE Attractions SET latitude = 0 WHERE latitude IS NULL;
            UPDATE Attractions SET longitude = 0 WHERE longitude IS NULL;
        ";
        using (var connection = new SqlConnection(connectionString))
        {
            var command = new SqlCommand(sql, connection);
            connection.Open();
            try {
                int rows = command.ExecuteNonQuery();
                Console.WriteLine($"Updated {rows} rows successfully!");
            } catch (Exception ex) {
                Console.WriteLine("Error: " + ex.Message);
            }
        }
    }
}
