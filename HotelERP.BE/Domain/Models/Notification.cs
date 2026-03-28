using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HotelERP.BE.Domain.Models;

namespace HotelERP.BE.Models 
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")] // Map với cột id
        public int Id { get; set; }

        [Column("user_id")] // Map với cột user_id
        public int? UserId { get; set; } 
        
        [ForeignKey("UserId")]
        public virtual User? User { get; set; } 

        [Required]
        [MaxLength(255)]
        [Column("title")] // Map với cột title
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("content")] // Map với cột content
        public string Content { get; set; } = string.Empty;

        // ⚠️ 2 thuộc tính này KHÔNG CÓ trong bảng SQL, phải dùng [NotMapped] để EF Core bỏ qua truy vấn
        [NotMapped]
        public string? Type { get; set; } 

        [NotMapped]
        public string? ReferenceLink { get; set; }

        [Column("is_read")] // 👉 Đây chính là nguyên nhân gây lỗi IsRead
        public bool IsRead { get; set; } = false; 

        [Column("created_at")] // 👉 Đây chính là nguyên nhân gây lỗi CreatedAt
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}