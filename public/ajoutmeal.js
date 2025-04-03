document.addEventListener("DOMContentLoaded", () => {
    loadMeals();
    showSection("dashboard"); // Afficher le Dashboard par défaut

    document.getElementById("mealForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("mealName").value;
        const calorie = document.getElementById("mealCalorie").value;
        const proteine = document.getElementById("mealProteine").value;
        const glucide = document.getElementById("mealGlucide").value;

        if (!name || !calorie || !proteine || !glucide) {
            alert("Tous les champs sont obligatoires !");
            return;
        }

        await fetch("/api/meals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, calorie, proteine, glucide })
        });

        document.getElementById("mealForm").reset();
        loadMeals();
    });
});

// Charger les repas
async function loadMeals() {
    const response = await fetch("/api/meals");
    const meals = await response.json();
    const mealList = document.getElementById("mealList");

    mealList.innerHTML = meals.map(meal => `
        <li>${meal.name} - ${meal.calorie} kcal - ${meal.proteine}g protéines - ${meal.glucide}g glucides</li>
    `).join("");
}

// Afficher une section et cacher les autres
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });
    document.getElementById(sectionId).classList.add("active");
}
