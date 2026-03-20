using Microsoft.AspNetCore.Http;
using HotelERP.Application.DTOs;

namespace HotelERP.Application.Interfaces;

public interface ICloudinaryService
{
    Task<ImageUploadResult> UploadImageAsync(IFormFile file, string folder);

    Task<bool> DeleteImageAsync(string publicId);
}