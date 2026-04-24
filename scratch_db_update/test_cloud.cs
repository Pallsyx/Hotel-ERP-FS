using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using HotelERP.BE.Utils;
using Microsoft.AspNetCore.Http;
using Moq; // Need a mock or just a dummy IFormFile

class Program
{
    static async Task Main()
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "HotelERP.BE"))
            .AddJsonFile("appsettings.json")
            .Build();

        var cloudinary = new CloudinaryService(config);
        
        // Create a dummy image file
        string testFilePath = "test_image.jpg";
        File.WriteAllBytes(testFilePath, new byte[1024 * 100]); // 100KB dummy image

        using var stream = new FileStream(testFilePath, FileMode.Open);
        
        // We can't easily mock IFormFile without a library, but we can just use the CloudinaryDotNet directly
        // to see if the delay is in Cloudinary
        Console.WriteLine("Starting upload...");
        var watch = System.Diagnostics.Stopwatch.StartNew();
        
        var uploadParams = new CloudinaryDotNet.Actions.ImageUploadParams
        {
            File = new CloudinaryDotNet.Actions.FileDescription(testFilePath, stream),
            Folder = "test"
        };
        
        var account = new CloudinaryDotNet.Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );
        var _cloudinary = new CloudinaryDotNet.Cloudinary(account);

        try {
            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            watch.Stop();
            Console.WriteLine($"Upload finished in {watch.ElapsedMilliseconds} ms.");
            Console.WriteLine($"URL: {uploadResult.SecureUrl}");
        } catch (Exception ex) {
            Console.WriteLine("Error: " + ex.Message);
        }
    }
}
