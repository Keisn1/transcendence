interface ApiResponse {
    message: string;
    timestamp: string;
}

class App {
    private apiUrl = "http://localhost:4000/api";

    constructor() {
        this.init();
    }

    private init(): void {
        const fetchBtn = document.getElementById("fetch-btn");
        fetchBtn?.addEventListener("click", () => this.fetchData());
    }

    private async fetchData(): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            const data: ApiResponse = await response.json();

            const resultDiv = document.getElementById("result");
            if (resultDiv) {
                resultDiv.innerHTML = `
          <div class="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p><strong>Message:</strong> ${data.message}</p>
            <p><strong>Time:</strong> ${data.timestamp}</p>
          </div>
        `;
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
}

new App();
