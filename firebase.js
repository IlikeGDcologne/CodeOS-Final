import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


const firebaseConfig = {

    apiKey: "AIzaSyAvpus9SlTgpmPtpMj2h8Ywtjx5zpf0H_s",
    authDomain: "codeos-79eca.firebaseapp.com",
    databaseURL: "https://codeos-79eca-default-rtdb.firebaseio.com",
    projectId: "codeos-79eca",
    storageBucket: "codeos-79eca.firebasestorage.app",
    messagingSenderId: "998922296534",
    appId: "1:998922296534:web:f02b823fbb96b157e37d77"

};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);

const db = getDatabase(app);

const googleProvider = new GoogleAuthProvider();


export {
    app,
    auth,
    db,
    googleProvider
};

window.codeosFirebase = {
    db,
    ref,
    get,
    set
};