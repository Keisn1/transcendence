const MIN_LEN_USERNAME = 3;
const MAX_LEN_USERNAME = 20;
const MIN_LEN_EMAIL = 3;
const MAX_LEN_EMAIL = 254;
const ZERO_WIDTH_RE = /[\u200B-\u200D\uFEFF]/g;

// trim whitespace, zero-width chars and NFKC normalisation
export function sanitizeVisibleInput(input: string): string {
    return input.trim().replace(ZERO_WIDTH_RE, "").normalize("NFKC");
}

// allow letters, numbers, underscore, dot and dash
export function isValidUsername(username: string): boolean {
    const re = /^[A-Za-z0-9._-]+$/;
    return re.test(username);
}

export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateUsername(username: string): string[] {
    const errors: string[] = [];

    if (username.length < MIN_LEN_USERNAME) {
        errors.push(`Username must be at least ${MIN_LEN_USERNAME} characters.`);
    }
    if (username.length > MAX_LEN_USERNAME) {
        errors.push(`Username is too long. Maximum ${MAX_LEN_USERNAME} characters.`);
    }
    if (!isValidUsername(username)) {
        errors.push("Username contains invalid characters. Use letters, numbers, '.', '_' or '-'.");
    }

    return errors;
}

export function validateEmail(email: string): string[] {
    const errors: string[] = [];

    if (email.length > MAX_LEN_EMAIL) {
        errors.push(`Email is too long. Maximum ${MAX_LEN_EMAIL} characters.`);
    } else if (email.length < MIN_LEN_EMAIL) {
        errors.push(`Email is too short. Minimum ${MIN_LEN_EMAIL} characters.`);
    } else if (!isValidEmail(email)) {
        errors.push("Email format looks invalid.");
    }

    return errors;
}
