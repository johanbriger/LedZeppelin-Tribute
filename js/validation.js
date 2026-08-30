document.addEventListener('DOMContentLoaded', () => {
    initSignupValidation();
});

function initSignupValidation() {
    const form = document.querySelector('#signup-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        const fullnameInput = document.querySelector('#fullname');
        const emailInput = document.querySelector('#email');
        const albumSelect = document.querySelector('#favorite-album');
        const feedback = document.querySelector('#form-feedback');

        // 1. Validera Namn
        if (fullnameInput.value.trim().length < 3) {
            showInputError(fullnameInput, 'Ange ditt namn (minst 3 tecken).');
            isValid = false;
        } else {
            clearInputError(fullnameInput);
        }

        // Validera E-post
        const emailValue = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(emailValue)) {
            showInputError(emailInput, 'Ange en giltig e-postadress.');
            isValid = false;
        } else {
            clearInputError(emailInput);
        }

        // Validera Val av Favoritalbum
        if (albumSelect.value === '') {
            showInputError(albumSelect, 'Vänligen välj ditt favoritalbum.');
            isValid = false;
        } else {
            clearInputError(albumSelect);
        }

        // Om alla fält klarar valideringen
        if (isValid) {
            feedback.textContent = `Välkommen till fancluben, ${fullnameInput.value.trim()}! Ett bekräftelsemail har skickats till ${emailValue}.`;
            feedback.classList.remove('hidden');

            // Nollställ formuläret
            form.reset();
        } else {
            feedback.classList.add('hidden');
        }
    });
}

function showInputError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    const errorSpan = formGroup.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
    inputElement.style.borderColor = 'var(--accent-crimson)';
}

function clearInputError(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    const errorSpan = formGroup.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = '';
    }
    inputElement.style.borderColor = 'var(--border-color)';
}