namespace HotelERP.BE.Models.Enums
{
    public enum NotificationAction
    {
        CreateAccount,
        UpdateAccount,
        ChangeRole,
        LockAccount,
        UnlockAccount,
        ResetPassword,
        SystemUpdate
    }

    public enum NotificationType
    {
        Info,
        Success,
        Warning,
        Error
    }
}