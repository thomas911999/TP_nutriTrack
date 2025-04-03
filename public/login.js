document.addEventListener('DOMContentLoaded', () => {
    console.log('Page de login chargée');
    const loginForm = document.getElementById('login-form');
    const errorDiv = document.getElementById('error-message');
    const debugBtn = document.getElementById('debug-btn');
    
    // Fonction de débogage
    function debugLogin() {
        console.log('--- Débogage de connexion ---');
        
        // Simuler une connexion réussie avec un utilisateur de test
        const fakeUserData = {
            _id: '64567890abcdef01234567',
            username: 'testuser',
            token: 'user_64567890abcdef01234567'
        };
        
        // Enregistrer manuellement les données dans le localStorage
        localStorage.setItem('token', fakeUserData.token);
        localStorage.setItem('userId', fakeUserData._id);
        localStorage.setItem('username', fakeUserData.username);
        
        console.log('Test data set in localStorage:', {
            token: localStorage.getItem('token'),
            userId: localStorage.getItem('userId'),
            username: localStorage.getItem('username')
        });
        
        // Rediriger vers la page principale
        window.location.href = '/index.html';
    }
    
    // Écouter le clic sur le bouton de débogage
    if (debugBtn) {
        debugBtn.addEventListener('click', debugLogin);
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Formulaire soumis');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        console.log('Tentative de connexion avec:', username);

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Réponse du serveur:', response.status, response.statusText);
            const data = await response.json();
            console.log('Données reçues:', data);

            if (response.ok) {
                console.log('Connexion réussie, sauvegarde des données');
                // Store all necessary data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data._id);
                localStorage.setItem('username', data.username);

                console.log('Données enregistrées:', {
                    token: data.token,
                    userId: data._id,
                    username: data.username
                });

                // Redirect to dashboard
                console.log('Redirection vers /index.html');
                window.location.href = '/index.html';
            } else {
                console.error('Erreur de connexion:', data.message);
                errorDiv.textContent = data.message || 'Erreur lors de la connexion';
                errorDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Erreur lors de la requête:', error);
            
            // Afficher un message d'erreur plus détaillé
            errorDiv.textContent = `Erreur de connexion au serveur: ${error.message}`;
            errorDiv.style.color = 'red';
        }
    });
});
