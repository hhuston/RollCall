let checkPassword = (password, arg) => {
    if (!password) throw `${arg} must be provided`;
    if (typeof password !== "string") throw `${arg} must be of type string`;

    //Password max length?
    if (password.length < 8 || /^[0-9] | ^[A-Z] | [0-9a-zA-Z]+/.test(password)) throw `${arg} must be 8+ characters and contain an uppercase letter, a number, and a special character`;

    return password;
};

let checkName = (str, arg) => {
    str = str.trim();
    if (str.length < 2) {
        throw `${arg} must be at least 2 characters`;
    }
    if (str.length > 25) {
        throw `${arg} may not be longer than 25 characters`;
    }

    if (str.includes("  ")) throw ``;
    if (!/[a-zA-Z ]/.test(str)) throw `${arg} must only contain letters`;
    return str;
};

let checkUserName = (str) => {
    str = checkString(str, "Username");
    if (str.length < 5) {
        throw `Username must be at least 5 characters`;
    }
    if (str.length > 25) {
        throw `Username may not be longer than 25 characters`;
    }
    if (str.includes(" ")) {
        throw `Username must not contain a space`;
    }
    return str;
};

let checkOrgRole = (role) => {
    role = checkString(role, "Org Role").toLowerCase();
    if (role !== "member" && role !== "owner" && role !== "moderator") {
        throw `Role must be 'member', 'owner', or 'moderator'`;
    }
    return role;
};

let checkSessionRole = (role) => {
    role = checkString(role, "Session Role").toLowerCase();
    if (role != "observer" && role != "guest" && role != "voter") {
        throw `Role must be 'observer', 'guest', or 'voter'`;
    }
    return role;
};

let checkString = (str, arg) => {
    if (!str) throw `${arg} must be provided`;
    if (typeof str !== "string") throw `${arg} must be of type string`;
    //str = xss(str);
    str = str.trim();

    if (str.length === 0) throw `${arg} must not be all whitespace`;

    return str;
};

let checkEmail = (email) => {
    email = checkString(email, "Email").toLowerCase();
    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!regex.test(email)) {
        throw "please provide a valid email";
    }

    return email;
};

const button = document.getElementById("submitButton");
if (button) {
    button.addEventListener("click", function (event) {
        event.preventDefault();
        const delete_item = document.querySelector("h2");
        if (delete_item) {
            delete_item.remove();
        }
        try {
            let userName = checkUserName(document.getElementById("userName").value);
            let firstName = checkName(document.getElementById("firstName").value, "First Name");
            let lastName = checkName(document.getElementById("lastName").value, "Last Name");
            let email = checkEmail(document.getElementById("email").value);

            let password = document.getElementById("password").value;
            let confirmPassword = document.getElementById("confirmPassword").value;
            if (password != confirmPassword) {
                throw "passwords must match";
            }

            checkPassword(password, "Password");
            checkPassword(confirmPassword, "Confirm Password");

            let form = document.getElementById("signup-form");
            form.submit();
        } catch (e) {
            const h1 = document.querySelector("h1");
            const new_item = document.createElement("h2");
            new_item.textContent = e;
            h1.insertAdjacentElement("afterend", new_item);
        }
    });
}

let button2 = document.getElementById("submit_button");
if (button2) {
    button2.addEventListener("click", function (event) {
        event.preventDefault();
        const delete_item = document.querySelector("h2");
        if (delete_item) {
            delete_item.remove();
        }
        try {
            let userName = checkUserName(document.getElementById("user_name").value);
            let password = checkPassword(document.getElementById("password").value, "Password");
            let form = document.getElementById("signin-form");
            form.submit();
        } catch (e) {
            const h1 = document.querySelector("h1");
            const new_item = document.createElement("h2");
            new_item.textContent = e;
            h1.insertAdjacentElement("afterend", new_item);
        }
    });
}

let button3 = document.getElementById("org_submit_button");
//this button is for org sign-in
if (button3) {
    button3.addEventListener("click", function (event) {
        event.preventDefault();
        const delete_item = document.querySelector("h2");
        if (delete_item) {
            delete_item.remove();
        }
        try {
            let password = checkPassword(document.getElementById("password").value, "Password");
            let role = checkOrgRole(document.getElementById("role").value);
            let form = document.getElementById("org-signin-form");
            form.submit();
        } catch (e) {
            const h1 = document.querySelector("h1");
            const new_item = document.createElement("h2");
            new_item.textContent = e;
            h1.insertAdjacentElement("afterend", new_item);
        }
    });
}

const button4 = document.getElementById("submitButtonOrg");
//this button is for org creation
if (button4) {
    button4.addEventListener("click", function (event) {
        event.preventDefault();
        const delete_item = document.querySelector("h2");
        if (delete_item) {
            delete_item.remove();
        }
        try {
            let orgName = checkString(document.getElementById("orgName").value, "Org Name");

            let password = document.getElementById("password").value;
            let confirmPassword = document.getElementById("confirmPassword").value;
            if (password != confirmPassword) {
                throw "passwords must match";
            }

            checkPassword(password, "Password");
            checkPassword(confirmPassword, "Confirm Password");

            let form = document.getElementById("create-org-form");
            form.submit();
        } catch (e) {
            const h1 = document.querySelector("h1");
            const new_item = document.createElement("h2");
            new_item.textContent = e;
            h1.insertAdjacentElement("afterend", new_item);
        }
    });
}

const button5 = document.getElementById("orgSubmit");
//this button is for leaving org
if (button5) {
    button5.addEventListener("click", function (event) {
        event.preventDefault();

        const text = document.getElementById("org_search_term");
        let orgName = text.value;

        let error = document.getElementById("searchError");
        error.setAttribute("hidden", true);
        error.innerHTML = "";

        if (!orgName) {
            error.innerHTML = `Must provide an input!`;
            error.removeAttribute("hidden");
        }
        try {
            let orgName = checkString(text.value, "Org Name");
            let form = document.getElementById("searchOrgForm");
            form.submit();
        } catch (e) {
            text.value = "";
            error.innerHTML = e;
            error.removeAttribute("hidden");
        }
    });
}

let button6 = document.getElementById("session_submit_button");
//this button is for org sign-in
if (button6) {
    button6.addEventListener("click", function (event) {
        event.preventDefault();
        const delete_item = document.querySelector("h2");
        if (delete_item) {
            delete_item.remove();
        }
        try {
            let role = checkSessionRole(document.getElementById("session_role").value);
            let form = document.getElementById("session-signin-form");
            form.submit();
        } catch (e) {
            const h1 = document.querySelector("h1");
            const new_item = document.createElement("h2");
            new_item.textContent = e;
            h1.insertAdjacentElement("afterend", new_item);
        }
    });
}

let button7 = document.getElementById("submitButtonAction");
// this button is for creating an action
if (button7) {
    button7.addEventListener("click", function (event) {
        event.preventDefault();
        const delete_item = document.querySelector("h2");
        if (delete_item) {
            delete_item.remove();
        }
        try {
            let actionText = checkString(document.getElementById("actionText").value, "Action Text");
            let form = document.getElementById("create-action-form");
            form.submit();
        } catch (e) {
            const h1 = document.querySelector("h1");
            const new_item = document.createElement("h2");
            new_item.textContent = e;
            h1.insertAdjacentElement("afterend", new_item);
        }
    });
}