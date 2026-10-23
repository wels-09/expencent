
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const Email = document.getElementById("email");
    const password = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const formMessage = document.getElementById("formMessage");

    function errorMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
    }

    togglePassword.addEventListener("click", () => {

        if (password.type === "password") {
            password.type = "text";
            togglePassword.textContent = "Hide";
            togglePassword.setAttribute(
                "aria-label", "Hide password"
            );
        } else {
            password.type = "password";
            togglePassword.textContent = "Show";
            togglePassword.setAttribute(
                "aria-label", "Show password"
            );
        }
    });

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        
        const userEmail = Email.value.trim().toLowerCase();
        const userPassword = password.value;

        let users;

        try {
            users = JSON.parse(
                localStorage.getItem("montraUsers") || "[]"
            );

            if (!Array.isArray(users)) {
                errorMessage("Saved account data is invalid.", "error");
                return;
            }

        } catch (error) {
            errorMessage("Cannot access saved data.", "error");
            return;
        }

        const existingUser = users.find((user) =>
            user.email === userEmail &&
            user.password === userPassword
        );

        if (!existingUser) {
            errorMessage(
                "Incorrect email or password. Please try again.",
                "error"
            );
            return;
        }

        try {
            localStorage.setItem(
                "montraCurrentUser",
                JSON.stringify({
                    email: existingUser.email,
                    fullName: existingUser.fullName || existingUser.name,
                    id: existingUser.id
                })
            );

        } catch (error) {
            errorMessage(
                "Cannot log in right now. Please try again.",
                "error"
            );
            return;
        }

        errorMessage(
            `Login successful! Welcome ${existingUser.fullName || existingUser.name}.`,
            "success"
        );

        
        setTimeout(() => {
             window.location.href = "Dashboard.html";
        }, 2000)

       loginForm.reset()
    });

});
