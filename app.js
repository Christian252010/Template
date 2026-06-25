import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "ISI_API_KEY",

    authDomain: "ISI_AUTH_DOMAIN",

    projectId: "ISI_PROJECT_ID",

    storageBucket: "ISI_STORAGE_BUCKET",

    messagingSenderId: "ISI_SENDER_ID",

    appId: "ISI_APP_ID"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();

const loginBtn =
document.getElementById("loginBtn");

const userInfo =
document.getElementById("userInfo");

const avatar =
document.getElementById("avatar");

const username =
document.getElementById("username");

const chat =
document.getElementById("chat");

const input =
document.getElementById("commandInput");

const sendBtn =
document.getElementById("sendBtn");

const player =
document.getElementById("playerFrame");

loginBtn.onclick = async ()=>{

    try{

        await signInWithPopup(
            auth,
            provider
        );

    }catch(err){

        alert(err.message);

    }

};

onAuthStateChanged(auth,user=>{

    if(!user) return;

    loginBtn.parentElement.style.display =
    "none";

    userInfo.style.display =
    "flex";

    avatar.src =
    user.photoURL;

    username.textContent =
    user.displayName;

});

function getYoutubeId(input){

    input = input.trim();

    if(!input.startsWith("http")){

        return input;

    }

    try{

        const url =
        new URL(input);

        if(
            url.hostname.includes(
                "youtu.be"
            )
        ){

            return url.pathname
                .split("/")[1];

        }

        const v =
        url.searchParams.get("v");

        if(v) return v;

        return null;

    }catch{

        return null;

    }

}

async function sendMessage(){

    const text =
    input.value.trim();

    if(!text) return;

    if(!auth.currentUser){

        alert(
            "Silakan login terlebih dahulu"
        );

        return;

    }

    await addDoc(
        collection(db,"messages"),
        {
            uid:
            auth.currentUser.uid,

            name:
            auth.currentUser.displayName,

            photo:
            auth.currentUser.photoURL,

            message:
            text,

            timestamp:
            serverTimestamp()
        }
    );

    input.value = "";

}

sendBtn.onclick =
sendMessage;

input.addEventListener(
    "keydown",
    e=>{

        if(e.key==="Enter"){

            sendMessage();

        }

    }
);

const q =
query(
    collection(db,"messages"),
    orderBy("timestamp")
);

onSnapshot(
    q,
    snapshot=>{

        chat.innerHTML = "";

        snapshot.forEach(doc=>{

            const msg =
            doc.data();

            const div =
            document.createElement("div");

            const own =
            auth.currentUser &&
            msg.uid ===
            auth.currentUser.uid;

            div.className =
            "message " +
            (own
                ? "user"
                : "other");

            div.innerHTML =
            `<b>${msg.name}</b><br>${msg.message}`;

            chat.appendChild(div);

            if(
                msg.message.startsWith(
                    "/play "
                )
            ){

                const id =
                getYoutubeId(
                    msg.message
                    .replace(
                        "/play ",
                        ""
                    )
                );

                if(id){

                    player.style.display =
                    "block";

                    player.src =
                    `https://www.youtube.com/embed/${id}?autoplay=1`;

                }

            }

            if(
                msg.message ===
                "/stop"
            ){

                player.src = "";

                player.style.display =
                "none";

            }

        });

        chat.scrollTop =
        chat.scrollHeight;

    }
);