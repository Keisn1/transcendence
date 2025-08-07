export class TwoFAService {
    static async init2FA(token: string): Promise<string> {
        const response = await fetch("/api/auth/2fa/init", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const json = JSON.parse(errorText);
                throw json.error || json.message || `HTTP ${response.status}`;
            } catch {
                throw errorText || `HTTP ${response.status}`;
            }
        }

        const { qrCodeSvg } = await response.json();
        return qrCodeSvg;
    }

    static async complete2FA(token: string, userToken: string): Promise<void> {
        const response = await fetch("/api/auth/2fa/complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ token: userToken })
        });

        if (!response.ok) {
            const error = await response.json();
            throw error.error || error.message || `HTTP ${response.status}`;
        }
    }
}
