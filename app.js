    // ====== Firebase imports ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ====== Firebase config ======
const firebaseConfig = {
  apiKey: "AIzaSyDD81maTjt_uUtNhOR4mvjhF0_vQYwqeic",
  authDomain: "phal-88bd8.firebaseapp.com",
  projectId: "phal-88bd8",
  storageBucket: "phal-88bd8.firebasestorage.app",
  messagingSenderId: "542012665295",
  appId: "1:542012665295:web:811b6ab845a22debea76ba",
  measurementId: "G-4G3WE7J5J0"
};

// ====== Inicializar Firebase ======
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);
const db = getFirestore(app);

// ====== DOM ======
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const photoForm = document.getElementById("photoForm");
const placeInput = document.getElementById("placeInput");
const photoInput = document.getElementById("photoInput");
const gallery = document.getElementById("gallery");
const userArea = document.getElementById("user-area");
const authRow = document.getElementById("auth-row");
const welcome = document.getElementById("welcome");

// ====== Login Google ======
loginBtn.addEventListener("click", async () => {
  try { await signInWithPopup(auth, provider); }
  catch (err) { alert("Error al iniciar sesión: " + err.message); }
});

// ====== Logout ======
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// ====== Detectar estado del usuario ======
onAuthStateChanged(auth, (user) => {
  if(user){
    authRow.style.display = "none";
    userArea.style.display = "flex";
    photoForm.style.display = "flex";
    welcome.textContent = `Hola, ${user.displayName}`;
    loadPhotos();
  } else {
    authRow.style.display = "flex";
    userArea.style.display = "none";
    photoForm.style.display = "none";
    gallery.innerHTML = "";
  }
});

// ====== Subir foto ======
photoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const file = photoInput.files[0];
  const place = placeInput.value.trim();
  const user = auth.currentUser;
  if(!user || !file || !place) return alert("Elegí una foto y escribí el lugar");

  const path = `photos/${user.uid}/${Date.now()}_${file.name}`;
  const sref = ref(storage, path);
  await uploadBytes(sref, file);
  const url = await getDownloadURL(sref);

  await addDoc(collection(db, "photos"), { uid: user.uid, name: user.displayName, url, place, createdAt: serverTimestamp() });

  placeInput.value = "";
  photoInput.value = "";
  loadPhotos();
});

// ====== Cargar fotos ======
async function loadPhotos(){
  gallery.innerHTML = "<p>Cargando...</p>";
  const q = query(collection(db,"photos"), orderBy("createdAt","desc"));
  const snap = await getDocs(q);
  gallery.innerHTML = "";
  if(snap.empty){ gallery.innerHTML="<p>No hay fotos aún.</p>"; return; }

  snap.forEach((doc,i)=>{
    const d = doc.data();
    const card = document.createElement("div");
    card.className = "photo-card";
    card.innerHTML = `<img src="${d.url}" alt="${d.place}"><div class="caption">${d.place}</div>`;
    gallery.appendChild(card);
  });
}

