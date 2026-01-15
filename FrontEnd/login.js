const apiUrl = 'http://localhost:5678/api/users/login';

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Store token in a session cookie
            document.cookie = `token=${data.token}; path=/; SameSite=Strict`;
            // Redirect to homepage
            window.location.href = 'index.html';
        } else {
            alert('Erreur dans l’identifiant ou le mot de passe');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Une erreur est survenue lors de la connexion');
    }
});
