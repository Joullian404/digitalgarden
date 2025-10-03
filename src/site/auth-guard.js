// Authentication guard script
(function() {
    'use strict';
    
    // Skip authentication check for auth page itself
    if (window.location.pathname === '/auth' || window.location.pathname === '/auth/') {
        return;
    }
    
    let isAuthenticated = false;
    let authCheckCompleted = false;
    
    // Hide content initially
    document.addEventListener('DOMContentLoaded', function() {
        // Hide the main content until authentication is verified
        const body = document.body;
        body.style.visibility = 'hidden';
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'auth-loading';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;
        loadingDiv.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 20px;">
                    <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007cba; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
                <p>Verificando autenticação...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingDiv);
        
        // Check authentication
        checkAuthentication();
    });
    
    async function checkAuthentication() {
        try {
            const response = await fetch('/api/verify', {
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.authenticated) {
                isAuthenticated = true;
                showContent();
            } else {
                redirectToAuth();
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            redirectToAuth();
        }
        
        authCheckCompleted = true;
    }
    
    function showContent() {
        // Remove loading indicator
        const loadingDiv = document.getElementById('auth-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        
        // Show the actual content
        document.body.style.visibility = 'visible';
    }
    
    function redirectToAuth() {
        // Store the current URL to redirect back after login
        localStorage.setItem('redirect_after_auth', window.location.href);
        window.location.href = '/auth';
    }
    
    // Export for potential use in other scripts
    window.authGuard = {
        isAuthenticated: function() { return isAuthenticated; },
        isCheckCompleted: function() { return authCheckCompleted; }
    };
})();