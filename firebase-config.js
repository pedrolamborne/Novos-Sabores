// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDDu4v2em-XMtZCtEexMEkmqnQXe_GzsXg",
  authDomain: "lamboeduca.firebaseapp.com",
  projectId: "lamboeduca",
  storageBucket: "lamboeduca.firebasestorage.app",
  messagingSenderId: "1073244300533",
  appId: "1:1073244300533:web:fc7cb5d8b133ecb5ddd1bc",
  measurementId: "G-CK5DVM02VX"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
