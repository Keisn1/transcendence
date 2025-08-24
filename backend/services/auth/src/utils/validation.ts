// Validation constants
export const VALIDATION_RULES = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 20,
        PATTERN: /^[A-Za-z0-9._-]+$/,
    },
    EMAIL: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 254,
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
    },
};

export const ZERO_WIDTH_RE = /[\u200B-\u200D\uFEFF]/g;

// Sanitization
export function sanitizeVisibleInput(input: string): string {
    return input.trim().replace(ZERO_WIDTH_RE, "").normalize("NFKC");
}

// Validation functions
export function isValidUsername(username: string): boolean {
    return VALIDATION_RULES.USERNAME.PATTERN.test(username);
}

export function isValidEmail(email: string): boolean {
    return VALIDATION_RULES.EMAIL.PATTERN.test(email);
}

export function isStrongPassword(password: string): boolean {
    const classes = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    return classes.filter(Boolean).length >= 2;
}

export function validateRegisterInput(body: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!body.username || !body.email || !body.password) {
        errors.push("Missing required fields");
        return { valid: false, errors };
    }

    // Sanitize inputs
    const username = sanitizeVisibleInput(body.username);
    const email = sanitizeVisibleInput(body.email);

    // Username validation
    if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
        errors.push(`Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`);
    }
    if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
        errors.push(`Username must be at most ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`);
    }
    if (!isValidUsername(username)) {
        errors.push("Username contains invalid characters");
    }

    // Email validation
    if (email.length < VALIDATION_RULES.EMAIL.MIN_LENGTH) {
        errors.push("Email too short");
    }
    if (email.length > VALIDATION_RULES.EMAIL.MAX_LENGTH) {
        errors.push("Email too long");
    }
    if (!isValidEmail(email)) {
        errors.push("Invalid email format");
    }

    // Password validation
    if (body.password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
        errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`);
    }
    if (body.password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
        errors.push(`Password must be at most ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`);
    }
    if (!isStrongPassword(body.password)) {
        errors.push("Password must include multiple character types");
    }

    return { valid: errors.length === 0, errors };
}

export function validateAvatarPath(avatarPath: string): boolean {
    // Validate avatar path format
    if (!avatarPath || typeof avatarPath !== "string") {
        return false;
    }

    // Must start with /uploads/ and contain valid filename
    const pathRegex = /^\/uploads\/[a-zA-Z0-9._-]+\.(gif|jpeg|jpg|png)$/;
    return pathRegex.test(avatarPath);
}
