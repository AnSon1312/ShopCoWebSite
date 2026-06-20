var Auth = {
    USERS_KEY: 'shopco_users',
    SESSION_KEY: 'shopco_session',

    getUsers: function () {
        var data = localStorage.getItem(Auth.USERS_KEY);
        return data ? JSON.parse(data) : {};
    },

    saveUsers: function (users) {
        localStorage.setItem(Auth.USERS_KEY, JSON.stringify(users));
    },

    getSession: function () {
        var data = localStorage.getItem(Auth.SESSION_KEY);
        return data ? JSON.parse(data) : null;
    },

    saveSession: function (email) {
        localStorage.setItem(Auth.SESSION_KEY, JSON.stringify({ email: email }));
    },

    clearSession: function () {
        localStorage.removeItem(Auth.SESSION_KEY);
    },

    register: function (name, email, phone, password) {
        var users = Auth.getUsers();
        if (users[email]) {
            return { success: false, error: 'This email is already registered.' };
        }
        users[email] = { name: name, email: email, phone: phone, password: password };
        Auth.saveUsers(users);
        return { success: true };
    },

    login: function (email, password) {
        var users = Auth.getUsers();
        var user = users[email];
        if (!user) {
            return { success: false, error: 'No account found with this email.' };
        }
        if (user.password !== password) {
            return { success: false, error: 'Incorrect password.' };
        }
        Auth.saveSession(email);
        return { success: true };
    },

    getCurrentUser: function () {
        var session = Auth.getSession();
        if (!session) return null;
        var users = Auth.getUsers();
        return users[session.email] || null;
    },

    updateField: function (field, value, oldPassword) {
        var session = Auth.getSession();
        if (!session) return { success: false, error: 'Not logged in.' };
        var users = Auth.getUsers();
        var user = users[session.email];
        if (!user) return { success: false, error: 'User not found.' };

        if (field === 'password') {
            if (!oldPassword) return { success: false, error: 'Please enter your current password.' };
            if (oldPassword !== user.password) return { success: false, error: 'Current password is incorrect.' };
            if (value.length < 6) return { success: false, error: 'New password must be at least 6 characters.' };
            user.password = value;
        } else if (field === 'email') {
            if (value === user.email) return { success: false, error: 'This is already your email.' };
            if (users[value]) return { success: false, error: 'This email is already taken.' };
            var oldEmail = user.email;
            delete users[oldEmail];
            user.email = value;
            users[value] = user;
            session.email = value;
            Auth.saveSession(value);
        } else if (field === 'phone') {
            user.phone = value;
        }
        Auth.saveUsers(users);
        return { success: true };
    }
};

// register page
(function () {
    var form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('reg-name').value.trim();
        var email = document.getElementById('reg-email').value.trim();
        var phone = document.getElementById('reg-phone').value.trim();
        var password = document.getElementById('reg-password').value;
        var confirm = document.getElementById('reg-confirm').value;
        var errorEl = document.getElementById('reg-error');

        if (!name || !email || !phone || !password || !confirm) {
            errorEl.textContent = 'Please fill in all fields.';
            return;
        }
        if (password !== confirm) {
            errorEl.textContent = 'Passwords do not match.';
            return;
        }
        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters.';
            return;
        }

        var result = Auth.register(name, email, phone, password);
        if (result.success) {
            Auth.saveSession(email);
            window.location.href = 'account.html';
        } else {
            errorEl.textContent = result.error;
        }
    });
})();

// login page
(function () {
    var form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('login-email').value.trim();
        var password = document.getElementById('login-password').value;
        var errorEl = document.getElementById('login-error');

        if (!email || !password) {
            errorEl.textContent = 'Please fill in all fields.';
            return;
        }

        var result = Auth.login(email, password);
        if (result.success) {
            window.location.href = 'account.html';
        } else {
            errorEl.textContent = result.error;
        }
    });
})();

// account page
(function () {
    var page = document.querySelector('.account-page');
    if (!page) return;

    var user = Auth.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('acc-name').textContent = user.name;
    document.getElementById('acc-email').textContent = user.email;
    document.getElementById('acc-phone').textContent = user.phone;

    // Logout
    document.getElementById('logout-btn').addEventListener('click', function () {
        Auth.clearSession();
        window.location.href = 'login.html';
    });

    // Edit buttons
    var editBtns = document.querySelectorAll('.account-edit-btn');
    var editForm = document.getElementById('account-edit-form');
    var editInput = document.getElementById('edit-input');
    var editLabel = document.getElementById('edit-label');
    var editTitle = document.getElementById('edit-title');
    var editError = document.getElementById('edit-error');
    var editCancel = document.getElementById('edit-cancel');
    var editOldPasswordField = document.getElementById('edit-old-password-field');
    var editOldPasswordInput = document.getElementById('edit-old-password');
    var currentField = null;

    for (var i = 0; i < editBtns.length; i++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                currentField = btn.getAttribute('data-field');
                var labels = { email: 'New Email', phone: 'New Phone', password: 'New Password' };
                var types = { email: 'email', phone: 'tel', password: 'password' };
                var placeholders = { email: 'Enter new email', phone: 'Enter new phone', password: 'At least 6 characters' };

                editTitle.textContent = 'Edit ' + currentField.charAt(0).toUpperCase() + currentField.slice(1);
                editLabel.textContent = labels[currentField] || 'Value';
                editInput.type = types[currentField] || 'text';
                editInput.placeholder = placeholders[currentField] || '';
                editInput.value = '';
                editError.textContent = '';
                editOldPasswordInput.value = '';
                if (currentField === 'password') {
                    editOldPasswordField.style.display = '';
                    editOldPasswordInput.required = true;
                } else {
                    editOldPasswordField.style.display = 'none';
                    editOldPasswordInput.required = false;
                }
                editForm.style.display = 'block';
                document.querySelector('.account-details').style.display = 'none';
            });
        })(editBtns[i]);
    }

    // Save edit
    document.getElementById('edit-form').addEventListener('submit', function (e) {
        e.preventDefault();
        if (!currentField) return;
        var value = editInput.value.trim();
        if (!value) {
            editError.textContent = 'Please enter a value.';
            return;
        }
        var oldPassword = currentField === 'password' ? editOldPasswordInput.value : null;
        var result = Auth.updateField(currentField, value, oldPassword);
        if (result.success) {
            var user = Auth.getCurrentUser();
            if (user) {
                document.getElementById('acc-email').textContent = user.email;
                document.getElementById('acc-phone').textContent = user.phone;
            }
            editForm.style.display = 'none';
            document.querySelector('.account-details').style.display = '';
        } else {
            editError.textContent = result.error;
            editOldPasswordInput.value = '';
        }
    });

    // Cancel edit
    editCancel.addEventListener('click', function () {
        editForm.style.display = 'none';
        document.querySelector('.account-details').style.display = '';
    });
})();
