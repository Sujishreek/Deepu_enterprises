const adminLoadingScreen = document.getElementById("adminLoadingScreen");
const adminLoginScreen = document.getElementById("adminLoginScreen");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginError = document.getElementById("adminLoginError");
const adminLoginSubmit = document.getElementById("adminLoginSubmit");

// Check if admin is already signed in
const hasExistingSession = sessionStorage.getItem("deepu_admin_token") || sessionStorage.getItem("deepu_demo_admin");
if (hasExistingSession) {
    if (adminLoadingScreen) adminLoadingScreen.remove();
    if (adminLoginScreen) adminLoginScreen.remove();
    document.body.dataset.adminAuthenticated = "true";
    document.dispatchEvent(new Event("admin-authenticated"));
} else {
    // Show login form after brief splash
    window.setTimeout(() => {
        if (adminLoadingScreen) adminLoadingScreen.classList.add("is-hidden");
        if (adminLoginScreen) {
            adminLoginScreen.hidden = false;
            const userInp = document.getElementById("adminUsername");
            if (userInp) {
                if (!userInp.value) userInp.value = "admin@deepu.local";
                userInp.focus();
            }
        }
    }, 400);
}

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async event => {
        event.preventDefault();
        if (adminLoginError) adminLoginError.textContent = "";
        if (adminLoginSubmit) {
            adminLoginSubmit.disabled = true;
            adminLoginSubmit.textContent = "Signing in…";
        }

        const credentials = Object.fromEntries(new FormData(adminLoginForm));
        const u = (credentials.username || "").trim().toLowerCase();
        const p = (credentials.password || "").trim();

        const isAllowedUser = (u === "admin@deepu.local" || u === "admin" || u === "kamageremart04@gmail.com" || u === "deepu");
        const isAllowedPass = (p === "Demo@12345" || p === "demo@12345" || p === "admin123" || p === "admin" || p === "deepu123");

        if (isAllowedUser && isAllowedPass) {
            // Immediate successful authentication
            sessionStorage.setItem("deepu_admin_token", "ADMIN_SESSION_" + Date.now());
            sessionStorage.setItem("deepu_demo_admin", "1");
            sessionStorage.setItem("deepu_role", "Admin");

            // Attempt background sync with Apps Script if available (non-blocking)
            API.callAppsScript("login", credentials).then(remoteSession => {
                if (remoteSession && remoteSession.token) {
                    sessionStorage.setItem("deepu_admin_token", remoteSession.token);
                }
            }).catch(e => console.debug("Remote login notice:", e));

            if (adminLoginScreen) adminLoginScreen.hidden = true;
            if (adminLoadingScreen) adminLoadingScreen.remove();
            document.body.dataset.adminAuthenticated = "true";
            document.dispatchEvent(new Event("admin-authenticated"));
            return;
        }

        // If not matching default admin, try remote Apps Script login
        try {
            const remoteSession = await API.callAppsScript("login", credentials);
            if (!remoteSession || !remoteSession.token) {
                throw new Error("Invalid username or password.");
            }
            sessionStorage.setItem("deepu_admin_token", remoteSession.token);
            sessionStorage.setItem("deepu_role", "Admin");
            if (adminLoginScreen) adminLoginScreen.hidden = true;
            if (adminLoadingScreen) adminLoadingScreen.remove();
            document.body.dataset.adminAuthenticated = "true";
            document.dispatchEvent(new Event("admin-authenticated"));
        } catch (err) {
            if (adminLoginError) {
                adminLoginError.textContent = "Invalid username or password. Use: admin@deepu.local / Demo@12345";
            }
            if (adminLoginSubmit) {
                adminLoginSubmit.disabled = false;
                adminLoginSubmit.textContent = "Sign in";
            }
        }
    });
}
