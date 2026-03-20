using Microsoft.AspNetCore.Mvc;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Application.DTOs;

namespace HotelERP.BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AmenitiesController(IAmenityService amenityService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() 
        => Ok(await amenityService.GetAllAmenitiesAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await amenityService.GetAmenityByIdAsync(id);
        return result != null ? Ok(result) : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAmenityRequest request)
    {
        var id = await amenityService.CreateAmenityAsync(request);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateAmenityRequest request)
    {
        var success = await amenityService.UpdateAmenityAsync(id, request);
        return success ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await amenityService.DeleteAmenityAsync(id);
        return success ? NoContent() : NotFound();
    }
}