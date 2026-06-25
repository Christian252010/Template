import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAk5vpwEms61MGUMHf42v-5l5YsCKZxPcU",
    authDomain: "music-e4d6a.firebaseapp.com",
    projectId: "music-e4d6a",
    storageBucket: "music-e4d6a.firebasestorage.app",
    messagingSenderId: "485779946327",
    appId: "1:485779946327:web:3c8ddebb80c8eab59fdc12"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn =
document.getElementById("loginBtn");

loginBtn.onclick = async () => {

    try {

        await signInWithPopup(
            auth,
            provider
        );

    } catch(error) {

        console.error(error);

        alert(error.message);

    }

};

const avatar =
document.getElementById("avatar");

const name =
document.getElementById("name");

const email =
document.getElementById("email");

onAuthStateChanged(auth, user => {

    if(user){

        avatar.hidden = false;

        avatar.src =
        user.photoURL;

        name.textContent =
        user.displayName;

        email.textContent =
        user.email;

    }

});

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

console.log(db);