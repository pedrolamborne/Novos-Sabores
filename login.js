const criarContaBtn = document.getElementById('criarContaBtn');
const entrarBtn = document.getElementById('entrarBtn');
const googleBtn = document.getElementById('googleBtn');

criarContaBtn.addEventListener('click', ()=>{
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const telefone = document.getElementById('telefone').value;
  const endereco = document.getElementById('endereco').value;

  if(!nome || !email || !senha || !telefone || !endereco){
    alert('Preencha todos os campos!');
    return;
  }

  auth.createUserWithEmailAndPassword(email, senha)
    .then(userCredential=>{
      const user = userCredential.user;
      db.collection('usuarios').doc(user.uid).set({
        nome, email, telefone, endereco, historicoPedidos: []
      }).then(()=>{
        localStorage.setItem('uid', user.uid);
        window.location.href='home.html';
      });
    })
    .catch(error=>alert(error.message));
});

entrarBtn.addEventListener('click', ()=>{
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(userCredential=>{
      localStorage.setItem('uid', userCredential.user.uid);
      window.location.href='home.html';
    })
    .catch(error=>alert(error.message));
});

googleBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result=>{
      const user = result.user;
      const userRef = db.collection('usuarios').doc(user.uid);
      userRef.get().then(doc=>{
        if(!doc.exists){
          userRef.set({
            nome: user.displayName || "",
            email: user.email,
            telefone: "",
            endereco: "",
            historicoPedidos: []
          });
        }
      });
      localStorage.setItem('uid', user.uid);
      window.location.href='home.html';
    })
    .catch(error=>alert(error.message));
});
