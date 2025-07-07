"use strict";
class App {
    apiUrl = "http://localhost:4000/api";
    constructor() {
        this.init();
    }
    init() {
        const fetchBtn = document.getElementById("fetch-btn");
        fetchBtn?.addEventListener("click", () => this.fetchData());
    }
    async fetchData() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            const data = await response.json();
            const resultDiv = document.getElementById("result");
            if (resultDiv) {
                resultDiv.innerHTML = `
          <div class="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p><strong>Message:</strong> ${data.message}</p>
            <p><strong>Time:</strong> ${data.timestamp}</p>
          </div>
        `;
            }
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }
}
new App();
