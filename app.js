/* =========================
   FIREBASE IMPORT
========================= */

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
    getDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    doc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
    apiKey: "AIzaSyAk5vpwEms61MGUMHf42v-5l5YsCKZxPcU",
    authDomain: "music-e4d6a.firebaseapp.com",
    projectId: "music-e4d6a",
    storageBucket: "music-e4d6a.firebasestorage.app",
    messagingSenderId: "485779946327",
    appId: "1:485779946327:web:3c8ddebb80c8eab59fdc12"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* =========================
   ELEMENT
========================= */

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

const replyPreview =
document.getElementById("replyPreview");

const replyText =
document.getElementById("replyText");

const cancelReply =
document.getElementById("cancelReply");

const queueBtn =
document.getElementById("queueBtn");

const queuePanel =
document.getElementById("queuePanel");

const queueList =
document.getElementById("queueList");

const settingsBtn =
document.getElementById("settingsBtn");

const settingsPanel =
document.getElementById("settingsPanel");

const volumeSlider =
document.getElementById("volumeSlider");

const deafenBtn =
document.getElementById("deafenBtn");

const toggleVideoBtn =
document.getElementById("toggleVideoBtn");

const playBtn =
document.getElementById("playBtn");

const pauseBtn =
document.getElementById("pauseBtn");

const skipBtn =
document.getElementById("skipBtn");

const stopBtn =
document.getElementById("stopBtn");

/* =========================
   STATE
========================= */

let replyData = null;

let currentVideo = "";

let currentUser = null;

let youtubePlayer = null;

let playerReady = false;

let deafened = false;

let currentRoomData = null;

/* =========================
   LOGIN
========================= */

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

/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(
    auth,
    user=>{

        if(!user){

            loginBtn.style.display =
            "block";

            userInfo.style.display =
            "none";

            return;

        }

        currentUser = user;

        loginBtn.style.display =
        "none";

        userInfo.style.display =
        "flex";

        avatar.src =
        user.photoURL;

        username.textContent =
        user.displayName;

    }
);

/* =========================
   YOUTUBE HELPER
========================= */

function getYoutubeId(input){

    input = input.trim();

    if(
        !input.includes("http")
    ){
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

        if(v){
            return v;
        }

        const shorts =
        url.pathname.match(
            /\/shorts\/([^/?]+)/
        );

        if(shorts){
            return shorts[1];
        }

        const embed =
        url.pathname.match(
            /\/embed\/([^/?]+)/
        );

        if(embed){
            return embed[1];
        }

        return null;

    }catch{

        return null;

    }

}

/* =========================
   TIME FORMAT
========================= */

function formatTime(timestamp){

    if(
        !timestamp ||
        !timestamp.toDate
    ){
        return "";
    }

    return timestamp
        .toDate()
        .toLocaleTimeString(
            "id-ID",
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        );

}

/* =========================
   REPLY SYSTEM
========================= */

function setReply(msg){

    replyData = {
        name: msg.name,
        message: msg.message
    };

    replyPreview.style.display =
    "flex";

    replyText.innerHTML =
    `<b>${msg.name}</b><br>${msg.message}`;

}

cancelReply.onclick = ()=>{

    replyData = null;

    replyPreview.style.display =
    "none";

};

/* =========================
   SEND MESSAGE
========================= */

async function sendMessage(){

    const text =
    input.value.trim();

    if(!text) return;

    if(!currentUser){

        alert(
            "Login terlebih dahulu"
        );

        return;

    }

    /* =====================
       /PLAY
    ===================== */

    if(
        text.startsWith("/play")
    ){

        const raw =
        text.replace(
            "/play",
            ""
        ).trim();

        const id =
        getYoutubeId(raw);

        if(!id){

            alert(
                "Link YouTube tidak valid"
            );

            return;

        }

        const roomSnap =
        await getDoc(
            doc(
                db,
                "room",
                "main"
            )
        );

        const roomData =
        roomSnap.data();

        if(
            roomData &&
            roomData.videoId
        ){

            await addDoc(
                collection(
                    db,
                    "queue"
                ),
                {
                    videoId:id,
                    addedBy:
                    currentUser.displayName,
                    timestamp:
                    serverTimestamp()
                }
            );

        }else{

            await setDoc(
                doc(
                    db,
                    "room",
                    "main"
                ),
                {
                    videoId:id,
                    startedAt:
                    serverTimestamp(),
                    status:
                    "playing"
                }
            );

        }

        await addDoc(
            collection(
                db,
                "messages"
            ),
            {
                uid:
                currentUser.uid,

                name:
                currentUser.displayName,

                photo:
                currentUser.photoURL,

                message:
                text,

                system:true,

                timestamp:
                serverTimestamp()
            }
        );

        input.value="";

        return;

    }

    /* =====================
       /STOP
    ===================== */

    if(
        text === "/stop"
    ){

        await setDoc(
            doc(
                db,
                "room",
                "main"
            ),
            {
                videoId:"",
                status:"stopped",
                startedAt:null
            }
        );

        await addDoc(
            collection(
                db,
                "messages"
            ),
            {
                uid:
                currentUser.uid,

                name:
                currentUser.displayName,

                photo:
                currentUser.photoURL,

                message:
                "/stop",

                system:true,

                timestamp:
                serverTimestamp()
            }
        );

        input.value="";

        return;

    }

    /* =====================
       NORMAL CHAT
    ===================== */

    await addDoc(
        collection(
            db,
            "messages"
        ),
        {
            uid:
            currentUser.uid,

            name:
            currentUser.displayName,

            photo:
            currentUser.photoURL,

            message:
            text,

            timestamp:
            serverTimestamp(),

            replyTo:
            replyData
        }
    );

    replyData = null;

    replyPreview.style.display =
    "none";

    input.value = "";

}

sendBtn.onclick =
sendMessage;

input.addEventListener(
    "keydown",
    e=>{

        if(
            e.key==="Enter"
        ){

            sendMessage();

        }

    }
);

/* =========================
   CHAT REALTIME
========================= */

const messagesQuery =
query(
    collection(
        db,
        "messages"
    ),
    orderBy(
        "timestamp"
    )
);

onSnapshot(
    messagesQuery,
    snapshot=>{

        chat.innerHTML = "";

        snapshot.forEach(
            docSnap=>{

                const msg =
                docSnap.data();

                const div =
                document.createElement(
                    "div"
                );

                const time =
                formatTime(
                    msg.timestamp
                );

                div.className =
                "msg";

                div.innerHTML =

                `
                <img
                class="msg-avatar"
                src="${msg.photo}">

                <div class="msg-content">

                    <div class="msg-header">

                        <span class="msg-name">
                        ${msg.name}
                        </span>

                        <span class="msg-time">
                        ${time}
                        </span>

                    </div>

                    ${
                        msg.replyTo
                        ?
                        `
                        <div class="reply-box">

                            <b>
                            ${msg.replyTo.name}
                            </b>

                            <br>

                            ${msg.replyTo.message}

                        </div>
                        `
                        :
                        ""
                    }

                    <div class="msg-text">

                        ${msg.message}

                    </div>

                </div>
                `;

                let startX = 0;

                div.addEventListener(
                    "touchstart",
                    e=>{

                        startX =
                        e.touches[0]
                        .clientX;

                    }
                );

                div.addEventListener(
                    "touchend",
                    e=>{

                        const diff =
                        e.changedTouches[0]
                        .clientX
                        -
                        startX;

                        if(
                            diff > 80
                        ){

                            setReply(
                                msg
                            );

                        }

                    }
                );

                chat.appendChild(
                    div
                );

            }
        );

        chat.scrollTop =
        chat.scrollHeight;

    }
);

/* =========================
   QUEUE REALTIME
========================= */

const queueQuery =
query(
    collection(
        db,
        "queue"
    ),
    orderBy(
        "timestamp"
    )
);

onSnapshot(
    queueQuery,
    snapshot=>{

        queueList.innerHTML =
        "";

        let number = 1;

        snapshot.forEach(
            docSnap=>{

                const data =
                docSnap.data();

                const item =
                document.createElement(
                    "div"
                );

                item.className =
                "queue-item";

                item.innerHTML =
                `
                <b>
                #${number}
                </b>

                <br>

                ${data.videoId}

                <br>

                <small>

                Ditambahkan oleh
                ${data.addedBy}

                </small>
                `;

                queueList.appendChild(
                    item
                );

                number++;

            }
        );

    }
);

/* =========================
   PANEL BUTTON
========================= */

queueBtn.onclick = ()=>{

    queuePanel.style.display =

    queuePanel.style.display
    ===
    "block"

    ?

    "none"

    :

    "block";

};

settingsBtn.onclick = ()=>{

    settingsPanel.style.display =