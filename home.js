const uid = localStorage.getItem('uid');
if(!uid){ window.location.href = 'index.html'; }

const cardapioContainer = document.getElementById('cardapioContainer');
let carrinho = [];
const contadorCarrinho = document.getElementById('contadorCarrinho');

function atualizarCarrinho(){
  contadorCarrinho.innerText = carrinho.reduce((acc,item)=>acc+item.quantidade,0);
}

// Logout
document.getElementById('logoutBtnNav').addEventListener('click', ()=>{
  auth.signOut().then(()=>{
    localStorage.removeItem('uid');
    window.location.href='index.html';
  });
});

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', ()=>{
  navLinks.classList.toggle('active');
  hamburger.innerHTML = navLinks.classList.contains('active') ? '&times;' : '&#9776;';
});

// Perfil
const userIcon = document.getElementById('userIcon');
const perfilCard = document.getElementById('perfilCard');
const fecharPerfil = document.getElementById('fecharPerfil');
userIcon.addEventListener('click', ()=>{ perfilCard.classList.toggle('hidden'); });
fecharPerfil.addEventListener('click', ()=>{ perfilCard.classList.add('hidden'); });

// Carregar dados do usuário
db.collection('usuarios').doc(uid).get().then(doc=>{
  if(doc.exists){
    const data = doc.data();
    document.getElementById('nomeUsuario').innerText = data.nome;
    document.getElementById('emailUsuario').innerText = data.email;
    document.getElementById('telefoneUsuario').innerText = data.telefone;
    document.getElementById('enderecoUsuario').innerText = data.endereco;

    const historico = data.historicoPedidos || [];
    const historicoEl = document.getElementById('historicoPedidos');
    historico.forEach(pedido=>{
      const li = document.createElement('li');
      li.innerText = `${pedido.nome} - ${pedido.quantidade}x`;
      historicoEl.appendChild(li);
    });
  }
});

// Renderizar produtos
function renderProduto(produto){
  const div = document.createElement('div');
  div.classList.add('cardapio-item');
  div.innerHTML = `
    <img src="${produto.img}" alt="${produto.nome}">
    <h3>${produto.nome}</h3>
    <p>${produto.descricao}</p>
    <p>Preço: ${produto.preco} Kz</p>
    <p>Estoque: <span class="estoque">${produto.estoque}</span></p>
    <button class="btn">Adicionar</button>
  `;
  const estoqueSpan = div.querySelector('.estoque');

  div.querySelector('button').addEventListener('click', ()=>{
    if(produto.estoque <= 0){ alert('Produto esgotado!'); return; }
    const index = carrinho.findIndex(p=>p.id===produto.id);
    if(index>=0){ carrinho[index].quantidade++; }
    else{ carrinho.push({id:produto.id,nome:produto.nome,quantidade:1,preco:produto.preco}); }
    produto.estoque--;
    estoqueSpan.innerText = produto.estoque;
    atualizarCarrinho();
  });

  cardapioContainer.appendChild(div);
}

// Adicionar produto
document.getElementById('adicionarProdutoBtn').addEventListener('click', ()=>{
  const img = document.getElementById('imagemProduto').value;
  const nome = document.getElementById('nomeProduto').value;
  const descricao = document.getElementById('descricaoProduto').value;
  const preco = parseInt(document.getElementById('precoProduto').value);
  const estoque = parseInt(document.getElementById('estoqueProduto').value);

  if(!img || !nome || !descricao || !preco || !estoque){ alert('Preencha todos os campos!'); return; }

  const novoProduto = { nome, descricao, preco, estoque, img };
  const produtoRef = db.collection('produtos').doc();
  produtoRef.set(novoProduto).then(()=>{
    novoProduto.id = produtoRef.id;
    renderProduto(novoProduto);
    alert('Produto adicionado!');
  });
});

// Carregar produtos do Firestore
db.collection('produtos').get().then(querySnapshot=>{
  querySnapshot.forEach(doc=>{
    const produto = doc.data();
    produto.id = doc.id;
    renderProduto(produto);
  });
});

// Finalizar pedido
document.getElementById('finalizarPedidoBtn').addEventListener('click', ()=>{
  if(carrinho.length === 0){ alert('Carrinho vazio!'); return; }
  const userRef = db.collection('usuarios').doc(uid);
  userRef.get().then(doc=>{
    const historicoAtual = doc.data().historicoPedidos || [];
    const novoHistorico = historicoAtual.concat(carrinho);
    userRef.update({historicoPedidos: novoHistorico}).then(()=>{
      alert('Pedido finalizado! Abrindo WhatsApp...');
      enviarWhatsApp();
      carrinho = [];
      atualizarCarrinho();
    });
  });
});

function enviarWhatsApp(){
  const userRef = db.collection('usuarios').doc(uid);
  userRef.get().then(doc=>{
    const user = doc.data();
    let msg = `Olá, meu pedido:\n`;
    carrinho.forEach(item=>{ msg += `${item.nome} - ${item.quantidade}x\n`; });
    msg += `\nNome: ${user.nome}\nTelefone: ${user.telefone}\nEndereço: ${user.endereco}`;
    const numeroRestaurante = '244XXXXXXXXX'; 
    const link = `https://wa.me/${numeroRestaurante}?text=${encodeURIComponent(msg)}`;
    window.open(link,'_blank');
  });
                       }
