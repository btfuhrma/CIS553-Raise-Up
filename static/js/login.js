document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const repeatPasswordInput = document.getElementById('Password2');
    const errorMessage = document.getElementById('error-message');

    function checkPasswords() {
        if (passwordInput.value !== repeatPasswordInput.value) {
            errorMessage.hidden = false;
            errorMessage.innerText = "Passwords don't match!"
            errorMessage.style = "color: red;"
        } else {
            errorMessage.innerText = "Passwords Match!"
            errorMessage.style = "color: green;"
        }
    }

    passwordInput.addEventListener('input', checkPasswords);
    repeatPasswordInput.addEventListener('input', checkPasswords);
});