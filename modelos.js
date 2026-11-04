/* =====================================================================
   MODELOS COMPLETOS POR RAMO — catálogo único (03/11/2026, 2026-11-03-modelosemi)
   Vídeo em pé (YouTube não listado) de uma loja de EXEMPLO do ramo com a
   página toda preenchida. Lojas fictícias, só dentro do motor de gravação.
   Quem lê:
   - index.html  (painel do lojista): cartão "Modelo completo" do Início
     escolhe o vídeo pelo segmento/segmentoMacro do lojista (campo `por`).
   - parceiro.html (painel do parceiro): galeria "Modelos completos" na
     Divulgação, para mostrar ao comerciante e mandar no WhatsApp com o
     link do parceiro (/p/apelido?ramo=<ramo>).
   Ramo novo = 1 item em `lista` + as chaves dele em `por` + o poster em
   icones/modelo-<k>.webp (300x400) + o texto do Vik (moviki-ai,
   lib/catalogoPainel.js) na MESMA entrega. Ordem da lista = ordem da galeria.
   ===================================================================== */
window.MOVIKI_MODELOS = {
  versao: '2026-11-03-modelosemi',
  padrao: 'moda',
  lista: [
    { k:'moda',       ramo:'moda',       id:'HwbCpulOZ4o', dur:'1:26', capa:'icones/modelo-moda.webp',
      tit:'Veja uma loja de roupas toda pronta', curto:'Loja de roupas', nome:'uma loja de roupas', loja:'Atelier Vinha' },
    { k:'perfumaria', ramo:'perfumaria', id:'ASyxMb-SmIs', dur:'1:28', capa:'icones/modelo-perfumaria.webp',
      tit:'Veja uma perfumaria toda pronta', curto:'Perfumaria e cosméticos', nome:'uma perfumaria', loja:'Casa Lírio' },
    { k:'semijoias',  ramo:'semijoias',  id:'M0iCsyQa7o0', dur:'1:30', capa:'icones/modelo-semijoias.webp',
      tit:'Veja uma loja de semijoias toda pronta', curto:'Semijoias e bijuteria', nome:'uma loja de semijoias', loja:'Lua de Prata' }
  ],
  /* segmento ou segmentoMacro do quiz (quiz/quiz-segmentos.js) -> k do modelo.
     Ramo sem modelo próprio vê o `padrao`. */
  por: {
    perfumariacosmeticos:'perfumaria', belezaperfumaria:'perfumaria',
    acessorios:'semijoias', bijuteriaartesanal:'semijoias'
  }
};
