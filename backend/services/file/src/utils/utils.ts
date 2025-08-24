export const AVATAR_RULES = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["image/gif", "image/jpeg", "image/jpg", "image/png"],
    ALLOWED_EXTENSIONS: [".gif", ".jpeg", ".jpg", ".png"],
};

export function validateAvatarFile(file: any): {
    valid: boolean;
    error?: string;
} {
    if (!file) {
        return { valid: false, error: "No file provided" };
    }

    // Check file size
    if (file.size > AVATAR_RULES.MAX_SIZE) {
        return { valid: false, error: "File size must be less than 5MB" };
    }

    // Check MIME type
    if (!AVATAR_RULES.ALLOWED_TYPES.includes(file.mimetype)) {
        return {
            valid: false,
            error: "Only GIF, JPEG, and PNG files are allowed",
        };
    }

    // Check file extension
    const filename = file.filename || "";
    const extension = filename
        .toLowerCase()
        .substring(filename.lastIndexOf("."));
    if (!AVATAR_RULES.ALLOWED_EXTENSIONS.includes(extension)) {
        return { valid: false, error: "Invalid file extension" };
    }

    return { valid: true };
}
