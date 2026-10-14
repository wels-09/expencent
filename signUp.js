

document.addEventListener("DOMContentLoaded", () => {

    // Select HTML elements
    const signupForm = document.getElementById("signupForm");
    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const togglePassword = document.querySelectorAll(".toggle-password");
    const terms = document.getElementById("terms");
    const formMessage = document.getElementById("formMessage");

    // Display messages
    function errorMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
    }

    // Show or hide password
    togglePassword.forEach((button) => {
        button.addEventListener("click", () => {

            const targetId = button.dataset.target;
            const targetInput = document.getElementById(targetId);

            if (!targetInput) return;

            if (targetInput.type === "password") {
                targetInput.type = "text";
                button.textContent = "Hide";
                button.setAttribute("aria-label", "Hide password");
            } else {
                targetInput.type = "password";
                button.textContent = "Show";
                button.setAttribute("aria-label", "Show password");
            }
        });
    });

    // Handle form submission
    signupForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Get user input
        const userName = fullName.value.trim();
        const userEmail = email.value.trim().toLowerCase();
        const userPassword = password.value;
        const userConfirmPassword = confirmPassword.value;

        // Validate full name
        if (userName.length < 4) {
            errorMessage(
                "Full name should be at least 4 characters.",
                "error"
            );
            fullName.focus();
            return;
        }

        // Validate email
        email.value = userEmail;

        if (!email.checkValidity() || userEmail === "") {
            errorMessage(
                "Please enter a valid email address.",
                "error"
            );
            email.focus();
            return;
        }

        // Validate password length
        if (userPassword.length < 8) {
            errorMessage(
                "Password must be at least 8 characters.",
                "error"
            );
            password.focus();
            return;
        }

        // Confirm password
        if (userPassword !== userConfirmPassword) {
            errorMessage(
                "Passwords do not match.",
                "error"
            );
            confirmPassword.focus();
            return;
        }

        // Check terms and conditions
        if (!terms.checked) {
            errorMessage(
                "Please agree to the terms and conditions.",
                "error"
            );
            terms.focus();
            return;
        }

        // Load existing users
        let users = [];

        try {
            users = JSON.parse(
                localStorage.getItem("montraUsers") || "[]"
            );

            if (!Array.isArray(users)) {
                errorMessage(
                    "Stored user data is invalid.",
                    "error"
                );
                return;
            }
        } catch (error) {
            errorMessage(
                "Cannot access stored user data.",
                "error"
            );
            return;
        }

        // Check whether email already exists
        const existingUser = users.find(
            (user) => user.email === userEmail
        );

        if (existingUser) {
            errorMessage(
                "This email already exists.",
                "error"
            );
            email.focus();
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            fullName: userName,
            email: userEmail,
            password: userPassword,
            createdAt: new Date().toISOString()
        };

        // Save user
        try {
            users.push(newUser);

            localStorage.setItem(
                "montraUsers",
                JSON.stringify(users)
            );
        } catch (error) {
            errorMessage(
                "Could not save your account. Please try again.",
                "error"
            );
            return;
        }

        // Success
        errorMessage(
            "You have successfully created an account!",
            "success"
        );

        signupForm.reset();
        setTimeout(() => {
            window.location.href = "login.html";
        },  1500);

    });

});
