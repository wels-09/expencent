
document.addEventListener("DOMContentLoaded", () => {
    
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("active");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );
        });

        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Open navigation");
            });
        });
    }

    
    const contactForm = document.getElementById("contactForm");
    const formFeedback = document.getElementById("formFeedback");

    if (!contactForm || !formFeedback) {
        console.error("Contact form or feedback element not found.");
        return;
    }

    
    function showFeedback(message, type) {
        formFeedback.textContent = message;
        formFeedback.className = `form-feedback ${type}`;
    }

    
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fullName = document
            .getElementById("fullName")
            .value.trim();

        const email = document
            .getElementById("email")
            .value.trim()
            .toLowerCase();

        const subject = document
            .getElementById("subject")
            .value;

        const message = document
            .getElementById("message")
            .value.trim();

        
        if (!fullName || !email || !subject || !message) {
            showFeedback(
                "Please fill in all the required fields.",
                "error"
            );
            return;
        }

        
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showFeedback(
                "Please enter a valid email address.",
                "error"
            );
            return;
        }

    
        if (
            fullName.length > 100 ||
            email.length > 254 ||
            message.length > 5000
        ) {
            showFeedback(
                "Please shorten your name, email, or message.",
                "error"
            );
            return;
        }

        
        const contactMessage = {
            id: Date.now().toString(),
            fullName,
            email,
            subject,
            message,
            createdAt: new Date().toISOString(),
            status: "unread"
        };

        try {
            const savedMessages = localStorage.getItem(
                "montraContactMessages"
            );

            const messages = savedMessages
                ? JSON.parse(savedMessages)
                : [];

            if (!Array.isArray(messages)) {
                showFeedback(
                    "Saved contact data is invalid. Please check your browser storage.",
                    "error"
                );
                return;
            }

            
            messages.push(contactMessage);

            localStorage.setItem(
                "montraContactMessages",
                JSON.stringify(messages)
            );

            showFeedback(
                "Your message has been saved successfully. Thank you for contacting Montra!",
                "success"
            );

            contactForm.reset();

        } catch (error) {
            console.error("Contact form error:", error);

            showFeedback(
                "Unable to save your message. Please check your browser storage and try again.",
                "error"
            );
        }
    });
});
