(function () {
  'use strict';

  const config = window.stacklyFirebaseConfig;
  const isConfigured = config && !Object.values(config).some(value => String(value).includes('YOUR_'));

  if (!isConfigured) {
    console.error('Stackly Firebase is not configured. Update firebase-config.js before using authentication.');
    window.loginUser = function (event) {
      event.preventDefault();
      alert('Firebase is not configured. Add your Firebase Web App settings in firebase-config.js.');
    };
    window.createAccount = function (event) {
      event.preventDefault();
      alert('Firebase is not configured. Add your Firebase Web App settings in firebase-config.js.');
    };
    return;
  }

  firebase.initializeApp(config);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const page = window.location.pathname.split('/').pop().toLowerCase();
  const isAdminPage = page === 'admin-dashboard.html';
  const isUserPage = page === 'researcher-dashboard.html' || page === 'user-dashboard.html';

  function normalizeRole(role) {
    const value = String(role || '').trim().toLowerCase();
    if (value === 'administrator' || value === 'admin') return 'Admin';
    if (value === 'patient' || value === 'researcher' || value === 'user' || value === 'researcher / user') return 'Patient';
    return null;
  }

  async function getUserProfile(user) {
    const snapshot = await db.collection('users').doc(user.uid).get();
    const data = snapshot.exists ? snapshot.data() : {};
    return {
      name: data.name || user.displayName || user.email.split('@')[0],
      email: user.email || data.email || '',
      role: normalizeRole(data.role)
    };
  }

  function showProfile(profile) {
    const name = document.getElementById('userName');
    const email = document.getElementById('userEmail');
    const role = document.getElementById('userRole');
    if (name) name.textContent = profile.name;
    if (email) email.textContent = profile.email;
    if (role) role.textContent = profile.role;
    const initials = document.getElementById('adminInitials');
    if (initials) {
      initials.textContent = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    }
  }

  window.handleLogout = async function () {
    await auth.signOut();
    window.location.href = 'login.html';
  };

  window.loginUser = async function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const selectedRole = normalizeRole(document.getElementById('role').value);
    const remember = document.getElementById('remember').checked;

    if (!email || !password) return alert('Please fill all fields');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Enter valid email');

    try {
      const credential = await auth.signInWithEmailAndPassword(email, password);
      const profile = await getUserProfile(credential.user);
      if (!profile.role || profile.role !== selectedRole) {
        await auth.signOut();
        return alert(profile.role
          ? `This account is registered as ${profile.role}. Select the correct role.`
          : 'This account has no valid role. Contact an administrator.');
      }
      if (remember) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');
      window.location.href = selectedRole === 'Admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
    } catch (error) {
      console.error(error);
      alert('Login failed. Check your email and password.');
    }
  };

  window.createAccount = async function (event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = normalizeRole(document.getElementById('role').value);

    if (!name || !email || !password || password !== confirmPassword) return alert('Check all fields and passwords');
    try {
      const credential = await auth.createUserWithEmailAndPassword(email, password);
      await credential.user.updateProfile({ displayName: name });
      await db.collection('users').doc(credential.user.uid).set({ name, email, role });
      await auth.signOut();
      alert('Account created successfully. Please log in.');
      window.location.href = 'login.html';
    } catch (error) {
      console.error(error);
      alert(error.code === 'auth/email-already-in-use' ? 'That email is already registered.' : 'Unable to create account.');
    }
  };

  if (isAdminPage || isUserPage) {
    auth.onAuthStateChanged(async user => {
      if (!user) return window.location.replace('login.html');
      try {
        const profile = await getUserProfile(user);
        if (!profile.role) return window.location.replace('login.html');
        if (isAdminPage && profile.role !== 'Admin') return window.location.replace('user-dashboard.html');
        if (isUserPage && profile.role === 'Admin') return window.location.replace('admin-dashboard.html');
        showProfile(profile);
      } catch (error) {
        console.error(error);
        await auth.signOut();
        window.location.replace('login.html');
      }
    });
  }
})();
