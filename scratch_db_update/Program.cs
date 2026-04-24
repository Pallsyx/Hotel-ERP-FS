using System;
using Microsoft.Data.SqlClient;

class Program
{
    static void Main()
    {
        string connectionString = "Server=DESKTOP-3R12C2Q;Database=HotelManagementDB;Trusted_Connection=True;TrustServerCertificate=True;";
        string sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Attractions';";
        using (var connection = new SqlConnection(connectionString))
        {
            var command = new SqlCommand(sql, connection);
            connection.Open();
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    Console.WriteLine(reader.GetString(0));
                }
            }
        }
    }
}
