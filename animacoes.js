/* =========================================================
   ANIMAÇÕES (JavaScript)

   Este arquivo é um EXTRA. Ele não mexe no script.js.
   Para desligar as animações, apague a linha <script> deste
   arquivo no index.html (e a linha <link> do animacoes.css).

   ORGANIZAÇÃO:
     0. Configuração: o que anima e com qual efeito
     1. Aparecer e sumir ao rolar a página
     2. Topo: brasas subindo
     3. Topo: foto descendo devagar ao rolar (paralaxe)
   ========================================================= */

// Tudo fica dentro desta função para não misturar nomes
// com as variáveis do script.js
(function () {

  // Se a pessoa pediu "reduzir movimento" no aparelho,
  // não fazemos nada (o site fica parado e visível).
  const querReduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (querReduzirMovimento) {
    return;
  }

  // Avisa o CSS que as animações estão ligadas
  document.documentElement.classList.add('animacoes-ativas');


  /* =======================================================
     0. CONFIGURAÇÃO
     Cada linha diz: qual elemento anima (seletor) e como (efeito).
       efeito:    'subir', 'esquerda', 'direita' ou 'zoom'
       escalonar: true = os itens irmãos entram um depois do outro
     Para animar algo novo, é só adicionar uma linha aqui.
     ======================================================= */
  const ITENS_ANIMADOS = [
    { seletor: '.cabecalho-secao',      efeito: 'subir' },
    { seletor: '.cartao',               efeito: 'zoom',     escalonar: true },
    { seletor: '.calculadora',          efeito: 'subir' },
    { seletor: '.plano',                efeito: 'esquerda', escalonar: true },
    { seletor: '.nota-planos',          efeito: 'subir' },
    { seletor: '.professor',            efeito: 'subir',    escalonar: true },
    { seletor: '.espaco h2',            efeito: 'subir' },
    { seletor: '.ambiente',             efeito: 'zoom',     escalonar: true },
    { seletor: '.carrossel',            efeito: 'subir' },
    { seletor: '.rodape .conteudo > *', efeito: 'subir',    escalonar: true }
  ];


  /* =======================================================
     1. APARECER E SUMIR AO ROLAR A PÁGINA
     ======================================================= */

  // Passo 1: marcar os elementos da lista com data-animar
  ITENS_ANIMADOS.forEach(function (item) {
    const elementos = document.querySelectorAll(item.seletor);
    const contagemPorPai = new Map(); // conta quantos irmãos já passaram

    elementos.forEach(function (elemento) {
      // Se você já colocou data-animar à mão no HTML, respeitamos
      if (!elemento.hasAttribute('data-animar')) {
        elemento.setAttribute('data-animar', item.efeito);
      }

      // Atraso: 0s, 0.08s, 0.16s... (no máximo 6 passos)
      if (item.escalonar) {
        const pai = elemento.parentElement;
        const posicao = contagemPorPai.get(pai) || 0;
        elemento.style.setProperty('--atraso', Math.min(posicao, 6) * 0.08 + 's');
        contagemPorPai.set(pai, posicao + 1);
      }
    });
  });

  // Passo 2: vigiar cada elemento. O "observador" avisa quando
  // ele entra ou sai da tela.
  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      const elemento = entrada.target;

      if (entrada.isIntersecting) {
        // Entrou na tela: anima a entrada
        elemento.classList.remove('saiu-cima', 'saiu-baixo');
        elemento.classList.add('visivel');

      } else if (elemento.classList.contains('visivel')) {
        // Saiu da tela (e já tinha aparecido antes): anima a saída.
        // Se saiu por cima, a posição dele é negativa.
        elemento.classList.remove('visivel');
        if (entrada.boundingClientRect.top < 0) {
          elemento.classList.add('saiu-cima');
        } else {
          elemento.classList.add('saiu-baixo');
        }
      }
    });
  }, {
    threshold: 0.12,            // aparece quando 12% do elemento está na tela
    rootMargin: '0px 0px -6% 0px' // um pouquinho antes de chegar na borda de baixo
  });

  document.querySelectorAll('[data-animar]').forEach(function (elemento) {
    observador.observe(elemento);
  });


  /* =======================================================
     2. TOPO: BRASAS SUBINDO
     Criamos várias bolinhas (<span class="brasa">) dentro do topo.
     Cada uma recebe valores sorteados (posição, tamanho, tempo)
     para não ficarem todas iguais. O movimento é feito pelo CSS.
     ======================================================= */
  const topo = document.querySelector('.topo');

  if (topo) {
    const caixaBrasas = document.createElement('div');
    caixaBrasas.className = 'brasas';
    caixaBrasas.setAttribute('aria-hidden', 'true'); // leitor de tela ignora

    // Menos brasas no celular, para não pesar
    const quantidade = window.innerWidth < 900 ? 10 : 18;

    for (let i = 0; i < quantidade; i++) {
      const brasa = document.createElement('span');
      brasa.className = 'brasa';

      brasa.style.setProperty('--x', (Math.random() * 100) + '%');                  // posição na horizontal
      brasa.style.setProperty('--tamanho', (3 + Math.random() * 5) + 'px');         // 3px a 8px
      brasa.style.setProperty('--duracao', (6 + Math.random() * 6) + 's');          // 6s a 12s
      brasa.style.setProperty('--atraso', (-Math.random() * 10) + 's');             // atraso negativo = já começa "no meio"
      brasa.style.setProperty('--deriva', ((Math.random() - 0.5) * 80) + 'px');     // balança para os lados

      caixaBrasas.appendChild(brasa);
    }

    topo.appendChild(caixaBrasas);

    // As brasas sobem até o fim do topo: guardamos a altura dele
    function atualizarAlturaDoTopo() {
      caixaBrasas.style.setProperty('--altura-topo', topo.offsetHeight + 'px');
    }
    atualizarAlturaDoTopo();
    window.addEventListener('resize', atualizarAlturaDoTopo);


    /* =====================================================
       3. TOPO: PARALAXE
       Conforme a página rola, a foto desce um pouquinho (até 24px).
       O CSS (.topo-foto) usa a variável --paralaxe.
       ===================================================== */
    const fotoTopo = document.querySelector('.topo-foto');
    let esperandoQuadro = false; // evita fazer a conta mais vezes que o necessário

    function atualizarParalaxe() {
      const deslocamento = Math.min(window.scrollY * 0.15, 24);
      fotoTopo.style.setProperty('--paralaxe', deslocamento + 'px');
      esperandoQuadro = false;
    }

    if (fotoTopo) {
      window.addEventListener('scroll', function () {
        if (!esperandoQuadro) {
          esperandoQuadro = true;
          window.requestAnimationFrame(atualizarParalaxe);
        }
      }, { passive: true });
    }
  }

})();
