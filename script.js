/* =========================================================
   BRASA ACADEMIA - ARQUIVO JAVASCRIPT

   ORGANIZAÇÃO:
     0. Configurações (número do WhatsApp)
     1. Funções de apoio
     2. Planos (link do WhatsApp de cada plano)
     3. Calculadora de saúde
     4. Professores (balão com informações)
     5. Espaço (informações de cada ambiente)
     6. Avaliações dos alunos (troca automática)
     7. Fechar tudo ao clicar fora ou apertar Esc
   ========================================================= */


/* =========================================================
   0. CONFIGURAÇÕES
   Para trocar o número do WhatsApp do site inteiro, mude aqui.
   Formato: código do país (55) + DDD + número, sem espaços.
   ========================================================= */
const NUMERO_WHATSAPP = '5583900000000';


/* =========================================================
   1. FUNÇÕES DE APOIO
   ========================================================= */

// Monta um link do WhatsApp já com a mensagem escrita
function montarLinkWhatsapp(mensagem) {
  return 'https://wa.me/' + NUMERO_WHATSAPP + '?text=' + encodeURIComponent(mensagem);
}

// Escreve um número com 1 casa decimal e vírgula (ex.: 24,5)
function formatarDecimal(numero) {
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

// Descobre se o evento veio do mouse (e não do toque no celular)
function veioDoMouse(evento) {
  return evento.pointerType === 'mouse';
}


/* =========================================================
   2. PLANOS
   Cada plano no HTML tem data-plano="Start" e data-preco="99".
   Aqui montamos a mensagem e colocamos no link do plano.
   ========================================================= */
const planos = document.querySelectorAll('.plano');

planos.forEach(function (plano) {
  const nome = plano.dataset.plano;
  const preco = plano.dataset.preco;

  const mensagem = 'Olá! Tenho interesse no plano ' + nome +
    ' (R$ ' + preco + '/mês). Quero saber como contratar e agendar meu treino grátis.';

  plano.href = montarLinkWhatsapp(mensagem);
});


/* =========================================================
   3. CALCULADORA DE SAÚDE
   ========================================================= */

// Pegando os elementos da página
const campoIdade = document.getElementById('campo-idade');
const campoAltura = document.getElementById('campo-altura');
const campoPeso = document.getElementById('campo-peso');
const botaoCalcular = document.getElementById('botao-calcular');
const mensagemErro = document.getElementById('mensagem-erro');
const caixaResultado = document.getElementById('resultado');

// Lê o número de um campo (aceita vírgula: 70,5 vira 70.5)
function lerNumero(campo) {
  return parseFloat(campo.value.replace(',', '.'));
}

function calcular() {
  // 1) Pegar o que a pessoa preencheu
  const genero = document.querySelector('input[name="genero"]:checked').value;
  const idade = lerNumero(campoIdade);
  const alturaCm = lerNumero(campoAltura);
  const peso = lerNumero(campoPeso);

  // 2) Conferir se os valores fazem sentido
  const campos = [campoIdade, campoAltura, campoPeso];
  const valores = [
    idade >= 10 && idade <= 100,
    alturaCm >= 100 && alturaCm <= 250,
    peso >= 25 && peso <= 300
  ];
  const textosErro = [
    'a idade (10 a 100 anos)',
    'a altura (100 a 250 cm)',
    'o peso (25 a 300 kg)'
  ];

  const erros = [];
  let primeiroCampoErrado = null;

  for (let i = 0; i < campos.length; i++) {
    const estaErrado = !valores[i];
    campos[i].setAttribute('aria-invalid', estaErrado); // deixa a borda vermelha
    if (estaErrado) {
      erros.push(textosErro[i]);
      if (primeiroCampoErrado === null) {
        primeiroCampoErrado = campos[i];
      }
    }
  }

  // Se tem erro: mostra a mensagem, esconde o resultado e para aqui
  if (erros.length > 0) {
    mensagemErro.textContent = 'Confira ' + erros.join(', ') + '.';
    caixaResultado.hidden = true;
    primeiroCampoErrado.focus();
    return;
  }
  mensagemErro.textContent = '';

  // 3) Fazer as contas
  const alturaM = alturaCm / 100;
  const imc = peso / (alturaM * alturaM);

  // Metabolismo basal (fórmula de Mifflin-St Jeor)
  let metabolismo = 10 * peso + 6.25 * alturaCm - 5 * idade;
  if (genero === 'masculino') {
    metabolismo = metabolismo + 5;
  } else {
    metabolismo = metabolismo - 161;
  }

  // Faixa de peso saudável (IMC entre 18,5 e 24,9)
  const pesoMinimo = Math.round(18.5 * alturaM * alturaM);
  const pesoMaximo = Math.round(24.9 * alturaM * alturaM);

  // Água por dia: 35 ml por kg
  const aguaLitros = peso * 0.035;

  // 4) Descobrir a classificação, a cor, a dica e o objetivo
  let classificacao;
  let cor;
  let dica;
  let objetivo; // vai na mensagem do WhatsApp

  if (imc < 18.5) {
    classificacao = 'Abaixo do peso';
    cor = '#8a5a00';
    dica = 'Seu foco pode ser ganhar massa com treino de força e boa alimentação. Um treinador monta o plano ideal para você.';
    objetivo = 'ganhar massa muscular';
  } else if (imc < 25) {
    classificacao = 'Peso normal';
    cor = '#1f7a3d';
    dica = 'Ótimo ponto de partida! Dá para trabalhar força, resistência e performance.';
    objetivo = 'melhorar meu condicionamento';
  } else if (imc < 30) {
    classificacao = 'Sobrepeso';
    cor = '#c2410c';
    dica = 'Treino de força somado a exercícios aeróbicos ajuda a chegar ao peso saudável com segurança.';
    objetivo = 'emagrecer com segurança';
  } else {
    if (imc < 35) {
      classificacao = 'Obesidade grau I';
    } else if (imc < 40) {
      classificacao = 'Obesidade grau II';
    } else {
      classificacao = 'Obesidade grau III';
    }
    cor = '#b91c1c';
    dica = 'Comece com acompanhamento de um treinador e, se possível, de um médico. Dá para evoluir com segurança.';
    objetivo = 'emagrecer com segurança e acompanhamento';
  }

  // 5) Mostrar tudo na tela
  document.getElementById('veredito').style.background = cor;
  document.getElementById('res-classificacao').textContent = classificacao;
  document.getElementById('res-imc').textContent = formatarDecimal(imc);
  document.getElementById('res-metabolismo').textContent = Math.round(metabolismo).toLocaleString('pt-BR') + ' kcal';
  document.getElementById('res-agua').textContent = formatarDecimal(aguaLitros) + ' L';
  document.getElementById('res-peso-ideal').textContent = pesoMinimo + ' a ' + pesoMaximo + ' kg';
  document.getElementById('res-dica').textContent = dica;

  // Posição da setinha na escala: o IMC vai de 15 a 40
  const imcLimitado = Math.min(Math.max(imc, 15), 40);
  const posicaoPorcento = (imcLimitado - 15) / 25 * 100;
  document.getElementById('escala-marcador').style.left = posicaoPorcento + '%';

  // 6) Montar o link do WhatsApp com os resultados
  const textoGenero = (genero === 'masculino') ? 'masculino' : 'feminino';
  const mensagem = 'Olá! Usei a calculadora de saúde da BRASA. Sou do gênero ' + textoGenero +
    ', tenho ' + idade + ' anos, ' + alturaCm + ' cm e ' + peso + ' kg. Meu IMC é ' +
    formatarDecimal(imc) + ' (' + classificacao + '). Quero ' + objetivo +
    '. Posso agendar meu treino grátis?';
  document.getElementById('botao-whatsapp-resultado').href = montarLinkWhatsapp(mensagem);

  // 7) Mostrar o resultado e rolar até ele
  caixaResultado.hidden = false;
  caixaResultado.focus({ preventScroll: true });
  caixaResultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

botaoCalcular.addEventListener('click', calcular);

// Apertar Enter dentro de um campo também calcula
[campoIdade, campoAltura, campoPeso].forEach(function (campo) {
  campo.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') {
      calcular();
    }
  });
});


/* =========================================================
   4. PROFESSORES
   Os dados de cada professor ficam no HTML (data-nome, etc.).
   Ao clicar, preenchemos o balão e mostramos.
   ========================================================= */
const equipe = document.getElementById('equipe');
const balao = document.getElementById('balao-professor');
const botoesProfessores = document.querySelectorAll('.professor');

function fecharBalao() {
  balao.hidden = true;
  botoesProfessores.forEach(function (botao) {
    botao.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
  });
}

function abrirBalao(botao) {
  fecharBalao(); // fecha o que estiver aberto antes

  // Preenche o balão com os dados do professor clicado
  balao.innerHTML =
    '<h3>' + botao.dataset.nome + '</h3>' +
    '<b>' + botao.dataset.especialidade + ' · ' + botao.dataset.experiencia + '</b>' +
    '<p>' + botao.dataset.descricao + '</p>' +
    '<small>' + botao.dataset.horario + '</small>';

  balao.hidden = false; // mostra primeiro, para conseguir medir a posição

  // A setinha do balão aponta para o professor clicado
  const centroDoBotao = botao.offsetLeft + botao.offsetWidth / 2;
  const posicaoDaSeta = centroDoBotao - balao.offsetLeft;
  balao.style.setProperty('--seta-x', posicaoDaSeta + 'px');

  botao.classList.add('aberto');
  botao.setAttribute('aria-expanded', 'true');
}

botoesProfessores.forEach(function (botao) {
  botao.addEventListener('click', function (evento) {
    evento.stopPropagation(); // evita que o clique "vaze" e feche o balão (item 7)

    if (botao.classList.contains('aberto')) {
      fecharBalao(); // clicou no mesmo professor: fecha
    } else {
      abrirBalao(botao);
    }
  });
});

// Mouse saiu da área dos professores: fecha o balão
equipe.addEventListener('pointerleave', function (evento) {
  if (veioDoMouse(evento)) {
    fecharBalao();
  }
});

// Teclado saiu da área dos professores: fecha o balão
equipe.addEventListener('focusout', function (evento) {
  if (!equipe.contains(evento.relatedTarget)) {
    fecharBalao();
  }
});


/* =========================================================
   5. ESPAÇO
   O texto de cada ambiente já está no HTML (.info-ambiente),
   escondido. Aqui só mostramos e escondemos.
   ========================================================= */
const ambientes = document.querySelectorAll('.ambiente');

function fecharAmbientes() {
  ambientes.forEach(function (ambiente) {
    ambiente.classList.remove('aberto');
    ambiente.setAttribute('aria-expanded', 'false');
    ambiente.querySelector('.info-ambiente').hidden = true;
  });
}

function alternarAmbiente(ambiente) {
  const estavaAberto = ambiente.classList.contains('aberto');

  fecharAmbientes();

  if (!estavaAberto) {
    ambiente.classList.add('aberto');
    ambiente.setAttribute('aria-expanded', 'true');
    ambiente.querySelector('.info-ambiente').hidden = false;
  }
}

ambientes.forEach(function (ambiente) {
  // Clique (ou toque)
  ambiente.addEventListener('click', function (evento) {
    evento.stopPropagation();
    alternarAmbiente(ambiente);
  });

  // Teclado: Enter ou espaço
  ambiente.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      evento.stopPropagation();
      alternarAmbiente(ambiente);
    }
  });

  // Mouse saiu: fecha
  ambiente.addEventListener('pointerleave', function (evento) {
    if (veioDoMouse(evento)) {
      fecharAmbientes();
    }
  });

  // Perdeu o foco: fecha
  ambiente.addEventListener('blur', fecharAmbientes);
});


/* =========================================================
   6. AVALIAÇÕES DOS ALUNOS
   Mostra uma avaliação por vez. A troca automática funciona
   assim: a barrinha vermelha (CSS) enche em 6 segundos e, quando
   termina, o evento "animationend" chama a próxima avaliação.
   ========================================================= */
const carrossel = document.getElementById('carrossel');
const cartaoAvaliacao = document.getElementById('cartao-avaliacao');
const textoAvaliacao = document.getElementById('texto-avaliacao');
const autorAvaliacao = document.getElementById('autor-avaliacao');
const barraTempo = document.getElementById('barra-tempo-avaliacao');
const botoesAlunos = document.querySelectorAll('.aluno');

let alunoAtual = 0; // posição do aluno que está aparecendo (0 = primeiro)

// Reinicia a barrinha de tempo do começo
function reiniciarBarra() {
  barraTempo.classList.remove('rodando');
  void barraTempo.offsetWidth; // truque para o navegador reiniciar a animação
  barraTempo.classList.add('rodando');
}

function mostrarAvaliacao(posicao, primeiraVez) {
  alunoAtual = posicao;

  // Marca só o aluno escolhido como selecionado
  botoesAlunos.forEach(function (botao, i) {
    botao.setAttribute('aria-selected', i === posicao);
  });

  const botao = botoesAlunos[posicao];

  // Troca o texto (com uma piscadinha, exceto na primeira vez)
  function trocarTexto() {
    textoAvaliacao.textContent = botao.dataset.texto;
    autorAvaliacao.textContent =
      botao.querySelector('.aluno-nome').textContent + ', ' +
      botao.querySelector('.aluno-idade').textContent;
    cartaoAvaliacao.classList.remove('trocando');
  }

  if (primeiraVez) {
    trocarTexto();
  } else {
    cartaoAvaliacao.classList.add('trocando');
    setTimeout(trocarTexto, 180);
  }

  reiniciarBarra();
}

// Clicou em um aluno: mostra a avaliação dele
botoesAlunos.forEach(function (botao, i) {
  botao.addEventListener('click', function () {
    mostrarAvaliacao(i, false);
  });
});

// A barra terminou de encher: vai para o próximo aluno (e volta ao primeiro no fim)
barraTempo.addEventListener('animationend', function () {
  const proximo = (alunoAtual + 1) % botoesAlunos.length;
  mostrarAvaliacao(proximo, false);
});

// Mouse em cima do carrossel: pausa a troca
carrossel.addEventListener('pointerenter', function (evento) {
  if (veioDoMouse(evento)) {
    carrossel.classList.add('pausado');
  }
});
carrossel.addEventListener('pointerleave', function () {
  carrossel.classList.remove('pausado');
});

// Começa mostrando o primeiro aluno
mostrarAvaliacao(0, true);


/* =========================================================
   7. FECHAR TUDO
   Clicar fora ou apertar Esc fecha o balão dos professores
   e as informações dos ambientes.
   ========================================================= */
document.addEventListener('click', function () {
  fecharBalao();
  fecharAmbientes();
});

document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape') {
    fecharBalao();
    fecharAmbientes();
  }
});
