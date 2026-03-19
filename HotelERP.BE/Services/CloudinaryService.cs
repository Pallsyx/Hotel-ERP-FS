using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace HotelERP.BE.Services;

// Khai báo Dependency Injection (IConfiguration) ngay tại tên class
public class CloudinaryService(IConfiguration config)
{
    // Target-typed new() giúp code gọn hơn
    private readonly Cloudinary _cloudinary = new(new Account(
        config["Cloudinary:CloudName"],
        config["Cloudinary:ApiKey"],
        config["Cloudinary:ApiSecret"]
    ));

    public async Task<ImageUploadResult> UploadImageAsync(IFormFile file)
    {
        if (file.Length == 0) return new ImageUploadResult();

        using var stream = file.OpenReadStream();
        ImageUploadParams uploadParams = new()
        {
            File = new FileDescription(file.FileName, stream),
            Folder = "HotelERP"
        };
        
        return await _cloudinary.UploadAsync(uploadParams);
    }
}