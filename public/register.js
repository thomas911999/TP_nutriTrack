document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const messageDiv = document.getElementById('message');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Clear previous message
        messageDiv.innerHTML = '';

        // Validate form
        if (!username || !email || !password || !confirmPassword) {
            showMessage('Tous les champs sont requis', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
                // You can redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                showMessage(data.message || 'Erreur lors de l\'inscription', 'error');
            }
        } catch (error) {
            showMessage('Erreur de connexion au serveur', 'error');
        }
    });

    // Helper function to show messages
    function showMessage(message, type) {
        messageDiv.innerHTML = `
            <div class="${type === 'error' ? 'error-message' : 'success-message'}">
                ${message}
            </div>
        `;
    }
});
