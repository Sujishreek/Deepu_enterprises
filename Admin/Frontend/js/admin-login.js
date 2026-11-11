const adminLoadingScreen = document.getElementById("adminLoadingScreen");
const adminLoginScreen = document.getElementById("adminLoginScreen");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginError = document.getElementById("adminLoginError");
const adminLoginSubmit = document.getElementById("adminLoginSubmit");

window.setTimeout(() => {
    adminLoadingScreen.classList.add("is-hidden");
    adminLoginScreen.hidden = false;
    document.getElementById("adminUsername").focus();
}, 2500);

adminLoginForm.addEventListener("submit", async event => {
    event.preventDefault();
    adminLoginError.textContent = "";
    adminLoginSubmit.disabled = true;
    adminLoginSubmit.textContent = "Signing in…";

    const credentials = Object.fromEntries(new FormData(adminLoginForm));
    try {
        const session = await API.callAppsScript("login", credentials);
        if (!session || !session.token || !session.user || session.user.role !== "Admin") {
            throw new Error("Unable to authenticate. Check your credentials and Apps Script setup.");
        }

        sessionStorage.setItem("deepu_admin_token", session.token);
        adminLoginScreen.hidden = true;
        adminLoadingScreen.remove();
        document.body.dataset.adminAuthenticated = "true";
        document.dispatchEvent(new Event("admin-authenticated"));
    } catch (error) {
        const message = error.message || "";
        adminLoginError.textContent = /unknown action:\s*login/i.test(message)
            ? "Admin login is not enabled on the deployed version yet. Update Code.gs and deploy a new version."
            : message || "Sign-in failed. Please try again.";
        adminLoginSubmit.disabled = false;
        adminLoginSubmit.textContent = "Sign in";
    }
});
