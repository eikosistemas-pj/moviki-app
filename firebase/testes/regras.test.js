/* Testes das regras do Firestore — negocios/{uid} e suas subcolecoes.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * As regras decidem quem le e quem grava o dado de cada lojista. Ate hoje
 * nenhuma delas tinha teste: a unica conferencia era ler e torcer. Estes
 * testes travam, um por um, TODOS os acessos que o curinga
 * `match /{documento=**}` sustentava, para que a troca dele por uma lista
 * explicita nao derrube a live, a moderacao do chat nem o save do painel.
 *
 * Rodar:  npm run teste   (sobe o emulador do Firestore sozinho)
 */
import { readFileSync } from 'node:fs';
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp,
  collection, getDocs, query, where, writeBatch, increment,
} from 'firebase/firestore';

const DONO      = 'lojista-dono-1';
const ESTRANHO  = 'lojista-estranho-2';
const ADM       = 'dono-do-moviki';

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'moviki-teste',
    firestore: {
      rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

after(async () => { if (env) await env.cleanup(); });

/* Semeia o banco ignorando as regras: e o estado que ja existiria em producao. */
async function semear({ liveNoAr = false } = {}) {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'admins', ADM), { desde: 'sempre' });
    await setDoc(doc(db, 'negocios', DONO), { nome: 'Food Truck do Teste' });
    await setDoc(doc(db, 'live_sessoes', DONO), { ativa: liveNoAr });
    await setDoc(doc(db, 'negocios', DONO, 'estado', 'live'), { ativa: false });
    await setDoc(doc(db, 'negocios', DONO, 'estado', 'liveSessao'), { assistindo: 3 });
    await setDoc(doc(db, 'negocios', DONO, 'estado', 'liveAceite'), { versao: 1, email: 'lojista@exemplo.com' });
    await setDoc(doc(db, 'negocios', DONO, 'estado', 'boasvindas'), { visto: true });
    await setDoc(doc(db, 'negocios', DONO, 'livechat', 'msg1'), { nome: 'Ana', texto: 'oi' });
    await setDoc(doc(db, 'negocios', DONO, 'avaliacoes', 'av1'), { nota: 5, nome: 'Ana' });
    await setDoc(doc(db, 'negocios', DONO, 'livepresenca', 'sessao-abcdefghij'), { em: new Date() });
    await setDoc(doc(db, 'negocios', DONO, 'resumo', 'avaliacoes'), { n: 1, soma: 5 });
  });
}

const anon      = () => env.unauthenticatedContext().firestore();
const dono      = () => env.authenticatedContext(DONO).firestore();
const estranho  = () => env.authenticatedContext(ESTRANHO).firestore();
const admin     = () => env.authenticatedContext(ADM).firestore();

/* ================= o documento do negocio ================= */
describe('negocios/{uid} — o cadastro do lojista', () => {
  before(() => semear());

  test('visitante anonimo LE a pagina publica', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'negocios', DONO)));
  });

  test('o dono GRAVA o proprio negocio', async () => {
    await assertSucceeds(setDoc(doc(dono(), 'negocios', DONO), { nome: 'Novo nome' }));
  });

  test('estranho NAO grava no negocio alheio', async () => {
    await assertFails(setDoc(doc(estranho(), 'negocios', DONO), { nome: 'invadido' }));
  });

  test('campo fora da lista derruba o save inteiro (hasOnly)', async () => {
    await assertFails(setDoc(doc(dono(), 'negocios', DONO), { nome: 'ok', campoNovo: 1 }));
  });
});

/* ========== estado/live — hoje SO o curinga sustenta ========== */
describe('estado/live — o interruptor da transmissao', () => {
  before(() => semear());

  test('visitante anonimo LE o estado da live (a pagina publica depende disso)', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'negocios', DONO, 'estado', 'live')));
  });

  test('o dono LIGA e DESLIGA a propria live', async () => {
    await assertSucceeds(setDoc(doc(dono(), 'negocios', DONO, 'estado', 'live'), { ativa: true }));
  });

  test('o dono do Moviki ENCERRA a live de um lojista pelo painel', async () => {
    await assertSucceeds(setDoc(doc(admin(), 'negocios', DONO, 'estado', 'live'), { ativa: false }));
  });

  test('estranho NAO mexe na live alheia', async () => {
    await assertFails(setDoc(doc(estranho(), 'negocios', DONO, 'estado', 'live'), { ativa: true }));
  });
});

/* ========== livechat — moderacao entra pelo curinga ========== */
describe('livechat — o chat da transmissao', () => {
  test('visitante anonimo LE o chat', async () => {
    await semear({ liveNoAr: true });
    await assertSucceeds(getDoc(doc(anon(), 'negocios', DONO, 'livechat', 'msg1')));
  });

  test('visitante anonimo ESCREVE com a live no ar', async () => {
    await semear({ liveNoAr: true });
    await assertSucceeds(setDoc(doc(anon(), 'negocios', DONO, 'livechat', 'nova1'), {
      nome: 'Ana', texto: 'quanto custa?', tipo: 'msg', criadoEm: serverTimestamp(),
    }));
  });

  test('visitante anonimo NAO escreve com a live fora do ar', async () => {
    await semear({ liveNoAr: false });
    await assertFails(setDoc(doc(anon(), 'negocios', DONO, 'livechat', 'nova2'), {
      nome: 'Ana', texto: 'oi', tipo: 'msg', criadoEm: serverTimestamp(),
    }));
  });

  test('o dono RESPONDE no chat (tipo dono — so o curinga permite)', async () => {
    await semear({ liveNoAr: true });
    await assertSucceeds(setDoc(doc(dono(), 'negocios', DONO, 'livechat', 'resp1'), {
      nome: 'Loja', texto: 'R$ 25', tipo: 'dono', criadoEm: serverTimestamp(),
    }));
  });

  test('o dono APAGA mensagem do chat (moderacao — so o curinga permite)', async () => {
    await semear({ liveNoAr: true });
    await assertSucceeds(deleteDoc(doc(dono(), 'negocios', DONO, 'livechat', 'msg1')));
  });

  test('estranho NAO apaga mensagem do chat alheio', async () => {
    await semear({ liveNoAr: true });
    await assertFails(deleteDoc(doc(estranho(), 'negocios', DONO, 'livechat', 'msg1')));
  });
});

/* ========== avaliacoes — apagar entra pelo curinga ========== */
describe('avaliacoes — a nota de quem comprou', () => {
  before(() => semear());

  test('visitante anonimo LE as avaliacoes', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'negocios', DONO, 'avaliacoes', 'av1')));
  });

  test('visitante anonimo AVALIA', async () => {
    /* v28: id no formato do addDoc (20 letras/numeros) */
    await assertSucceeds(setDoc(doc(anon(), 'negocios', DONO, 'avaliacoes', 'AbCdEfGhIj0123456789'), {
      nota: 5, nome: 'Carlos', criadoEm: serverTimestamp(),
    }));
  });

  test('v28: id de avaliacao montado (apostrofo) e recusado', async () => {
    await assertFails(setDoc(doc(anon(), 'negocios', DONO, 'avaliacoes', "x');alert(1);('"), {
      nota: 5, nome: 'Carlos', criadoEm: serverTimestamp(),
    }));
  });

  test('nota fora de 1 a 5 e recusada', async () => {
    await assertFails(setDoc(doc(anon(), 'negocios', DONO, 'avaliacoes', 'ruim'), {
      nota: 99, nome: 'Carlos', criadoEm: serverTimestamp(),
    }));
  });

  test('o dono APAGA avaliacao (moderacao — so o curinga permite)', async () => {
    await assertSucceeds(deleteDoc(doc(dono(), 'negocios', DONO, 'avaliacoes', 'av1')));
  });
});

/* ========== livepresenca e resumo ========== */
describe('livepresenca e resumo', () => {
  before(() => semear({ liveNoAr: true }));

  test('visitante anonimo LE a presenca', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'negocios', DONO, 'livepresenca', 'sessao-abcdefghij')));
  });

  test('o dono LIMPA presenca antiga (so o curinga permite)', async () => {
    await assertSucceeds(deleteDoc(doc(dono(), 'negocios', DONO, 'livepresenca', 'sessao-abcdefghij')));
  });

  test('visitante anonimo LE o resumo de avaliacoes', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'negocios', DONO, 'resumo', 'avaliacoes')));
  });

  test('o dono REESCREVE o proprio resumo', async () => {
    await assertSucceeds(setDoc(doc(dono(), 'negocios', DONO, 'resumo', 'avaliacoes'), { n: 3, soma: 14 }));
  });
});

/* ================================================================
 *  A BRECHA
 *  Subcolecao que ninguem previu. Com o curinga, ela nasce legivel
 *  por QUALQUER PESSOA DO MUNDO, sem ninguem mudar uma linha de regra.
 *  Este teste FALHA nas regras de hoje — e e exatamente o ponto.
 * ================================================================ */
describe('A BRECHA — subcolecao nova embaixo de negocios', () => {
  before(async () => {
    await semear();
    await env.withSecurityRulesDisabled(async (ctx) => {
      // Imagine que amanha alguem guarde a lista de clientes do lojista aqui.
      await setDoc(doc(ctx.firestore(), 'negocios', DONO, 'clientes', 'cliente1'), {
        nome: 'Maria', telefone: '41999990000', endereco: 'Rua das Flores, 120',
      });
    });
  });

  test('estranho NAO deve ler a lista de clientes de outro lojista', async () => {
    await assertFails(getDoc(doc(estranho(), 'negocios', DONO, 'clientes', 'cliente1')));
  });

  test('visitante anonimo NAO deve ler a lista de clientes', async () => {
    await assertFails(getDoc(doc(anon(), 'negocios', DONO, 'clientes', 'cliente1')));
  });

  /* Falha FECHADA: nem o proprio dono alcanca, ate alguem escrever a regra.
     E o ponto do conserto. Quem criar a subcolecao e obrigado a decidir, na
     hora, quem pode ler — em vez de herdar "todo mundo" sem perceber. */
  test('nem o proprio dono alcanca antes de existir regra (falha fechada)', async () => {
    await assertFails(getDoc(doc(dono(), 'negocios', DONO, 'clientes', 'cliente1')));
  });
});

/* ================================================================
 *  v26 — estado/ deixou de ser tudo publico
 *  A pagina da live precisa de estado/live e estado/liveSessao.
 *  O resto e interno — e estado/liveAceite guarda o E-MAIL do lojista.
 * ================================================================ */
describe('estado/ — publico so o que a live precisa', () => {
  before(() => semear());

  test('estado/liveSessao continua publico (a pagina da live le sem login)', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'negocios', DONO, 'estado', 'liveSessao')));
  });

  test('o e-mail do lojista em estado/liveAceite NAO e publico', async () => {
    await assertFails(getDoc(doc(anon(), 'negocios', DONO, 'estado', 'liveAceite')));
  });

  test('estranho NAO le o e-mail do lojista', async () => {
    await assertFails(getDoc(doc(estranho(), 'negocios', DONO, 'estado', 'liveAceite')));
  });

  test('o proprio lojista le o seu aceite', async () => {
    await assertSucceeds(getDoc(doc(dono(), 'negocios', DONO, 'estado', 'liveAceite')));
  });

  test('estado interno de onboarding NAO e publico', async () => {
    await assertFails(getDoc(doc(anon(), 'negocios', DONO, 'estado', 'boasvindas')));
  });

  test('o lojista grava o proprio onboarding', async () => {
    await assertSucceeds(setDoc(doc(dono(), 'negocios', DONO, 'estado', 'boasvindas'), { visto: true }));
  });
});


/* ========== v27 — criador_pecas: as duas chaves ========== */
const CRIADOR = 'criador-ana-3';
const PARC_COMUM = 'parceiro-comum-4';
const criador = () => env.authenticatedContext(CRIADOR).firestore();
const parcComum = () => env.authenticatedContext(PARC_COMUM).firestore();

function peca(uid, extra = {}) {
  return Object.assign({
    uid, formato: 'reel', midia: 'video',
    url: 'https://firebasestorage.googleapis.com/v0/b/x/o/v.mp4?alt=media&token=1',
    storagePath: 'criadores/' + uid + '/v.mp4',
    w: 1080, h: 1920, duracao: 30, titulo: 'Pastel na feira', legenda: 'oi', categoria: 'alimentacao',
    status: 'aguardando', criadaEm: serverTimestamp(),
  }, extra);
}

async function semearCriadores() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'admins', ADM), { desde: 'sempre' });
    await setDoc(doc(db, 'parceiros', CRIADOR), { nome: 'Ana', status: 'aprovado', criador: true });
    await setDoc(doc(db, 'parceiros', PARC_COMUM), { nome: 'Beto', status: 'aprovado' });
    await setDoc(doc(db, 'criador_pecas', 'p1'), Object.assign(peca(CRIADOR), { criadaEm: new Date() }));
  });
}

describe('criador_pecas — pecas dos influenciadores', () => {
  before(() => semearCriadores());

  test('criador aprovado ENVIA peca aguardando', async () => {
    await assertSucceeds(setDoc(doc(criador(), 'criador_pecas', 'p2'), peca(CRIADOR)));
  });

  test('criador NAO envia peca ja aprovada', async () => {
    await assertFails(setDoc(doc(criador(), 'criador_pecas', 'p3'), peca(CRIADOR, { status: 'aprovada' })));
  });

  test('parceiro comum (sem marca de criador) NAO envia peca', async () => {
    await assertFails(setDoc(doc(parcComum(), 'criador_pecas', 'p4'), peca(PARC_COMUM)));
  });

  test('criador NAO envia arquivo de fora da pasta dele', async () => {
    await assertFails(setDoc(doc(criador(), 'criador_pecas', 'p5'),
      peca(CRIADOR, { storagePath: 'criadores/outro/v.mp4' })));
  });

  test('criador AUTORIZA a propria peca', async () => {
    await assertSucceeds(updateDoc(doc(criador(), 'criador_pecas', 'p1'),
      { autorizaRedes: true, autorizaRedesEm: serverTimestamp(), termoVersao: '3.1' }));
  });

  test('criador NAO aprova a propria peca', async () => {
    await assertFails(updateDoc(doc(criador(), 'criador_pecas', 'p1'),
      { status: 'aprovada', avaliadaEm: serverTimestamp(), avaliadaPor: CRIADOR }));
  });

  test('criador NAO troca o video depois de enviado', async () => {
    await assertFails(updateDoc(doc(criador(), 'criador_pecas', 'p1'),
      { url: 'https://firebasestorage.googleapis.com/v0/b/x/o/outro.mp4' }));
  });

  test('o dono APROVA', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'criador_pecas', 'p1'),
      { status: 'aprovada', avaliadaEm: serverTimestamp(), avaliadaPor: ADM, motivoRecusa: '' }));
  });

  test('o dono NAO autoriza em nome do criador', async () => {
    await assertFails(updateDoc(doc(admin(), 'criador_pecas', 'p1'),
      { autorizaRedes: true, autorizaRedesEm: serverTimestamp(), termoVersao: '3.1' }));
  });

  test('criador REVOGA', async () => {
    await assertSucceeds(updateDoc(doc(criador(), 'criador_pecas', 'p1'),
      { autorizaRedes: false, revogadaEm: serverTimestamp() }));
  });

  test('estranho NAO le a peca do criador', async () => {
    await assertFails(getDoc(doc(estranho(), 'criador_pecas', 'p1')));
  });

  test('o dono LE a peca', async () => {
    await assertSucceeds(getDoc(doc(admin(), 'criador_pecas', 'p1')));
  });

  test('criador APAGA a propria peca', async () => {
    await assertSucceeds(deleteDoc(doc(criador(), 'criador_pecas', 'p1')));
  });
});


/* ========== v28 (23/09/2026): caixa de mensagens ========== */
describe('v28 — conversas e anexos', () => {
  before(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'admins', ADM), { desde: 'sempre' });
      /* conversa em que o filtro do Vik ja barrou uma resposta */
      await setDoc(doc(db, 'conversas', DONO), {
        uid: DONO, ultimoDe: 'bot', ultimaMsg: 'oi', docsLiberado: true,
        botLigado: true, botUsos: 2, botDia: '2026-09-23',
        botFiltro: 'promessa_de_ganho', botFiltroEm: new Date(), botFiltros: 2,
      });
    });
  });

  test('lojista MANDA mensagem depois que o filtro do Vik barrou (antes: negado para sempre)', async () => {
    await assertSucceeds(updateDoc(doc(dono(), 'conversas', DONO), {
      ultimaMsg: 'e agora?', ultimaEm: serverTimestamp(), ultimoDe: 'lojista', vistoLojistaEm: serverTimestamp(),
    }));
  });

  test('lojista NAO apaga nem mexe no carimbo do filtro', async () => {
    await assertFails(updateDoc(doc(dono(), 'conversas', DONO), { botFiltro: 'nada', ultimoDe: 'lojista' }));
  });

  test('lojista NAO cria conversa ja com carimbo do filtro', async () => {
    await assertFails(setDoc(doc(estranho(), 'conversas', ESTRANHO), {
      uid: ESTRANHO, ultimoDe: 'lojista', ultimaMsg: 'oi', botFiltros: 0,
    }));
  });

  test('anexo com endereco do Storage passa', async () => {
    await assertSucceeds(setDoc(doc(dono(), 'conversas', DONO, 'mensagens', 'm1'), {
      de: 'lojista', criadoEm: serverTimestamp(), arquivoNome: 'nota.pdf', arquivoTipo: 'application/pdf', arquivoTam: 100,
      arquivoUrl: 'https://firebasestorage.googleapis.com/v0/b/moviki-app.firebasestorage.app/o/documentos%2Fx%2F1_nota.pdf?alt=media&token=abc',
    }));
  });

  test('anexo com endereco inventado e recusado', async () => {
    await assertFails(setDoc(doc(dono(), 'conversas', DONO, 'mensagens', 'm2'), {
      de: 'lojista', criadoEm: serverTimestamp(), arquivoNome: 'x', arquivoTam: 1,
      arquivoUrl: "javascript:alert(1)//'",
    }));
  });
});

/* ========== v29 (23/09/2026): parceiros ========== */
describe('v29 — cadastro e selo de treinamento do parceiro', () => {
  const NOVO = 'parceiro-novo-v29';
  const VELHO = 'parceiro-velho-v29';
  before(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      /* cadastrado agora: nao pode carimbar treinamento ja */
      await setDoc(doc(db, 'parceiros', NOVO), { nome: 'Novo', status: 'pendente', criadoEm: new Date() });
      /* cadastrado ha 1 hora: pode */
      await setDoc(doc(db, 'parceiros', VELHO), { nome: 'Velho', status: 'aprovado', criadoEm: new Date(Date.now() - 3600000) });
    });
  });
  const como = (uid) => env.authenticatedContext(uid, { email: uid + '@exemplo.com' }).firestore();

  test('cadastro com hora do servidor passa', async () => {
    await assertSucceeds(setDoc(doc(como('p-cad-ok'), 'parceiros', 'p-cad-ok'), {
      nome: 'Maria', email: 'p-cad-ok@exemplo.com', pix: 'maria@pix.com', slug: 'mariaok',
      status: 'pendente', aceite: { versao: '1.0', em: serverTimestamp() }, criadoEm: serverTimestamp(),
    }));
  });

  test('cadastro com data inventada no passado e recusado', async () => {
    await assertFails(setDoc(doc(como('p-cad-ruim'), 'parceiros', 'p-cad-ruim'), {
      nome: 'Maria', email: 'p-cad-ruim@exemplo.com', pix: 'maria@pix.com', slug: 'mariaruim',
      status: 'pendente', aceite: { versao: '1.0', em: serverTimestamp() }, criadoEm: new Date(2020, 0, 1),
    }));
  });

  test('carimbo de treinamento no mesmo minuto do cadastro e recusado', async () => {
    await assertFails(updateDoc(doc(como(NOVO), 'parceiros', NOVO), { aulasVistas: ['a'], aulasEm: new Date().toISOString() }));
  });

  test('progresso sem carimbo continua gravando', async () => {
    await assertSucceeds(updateDoc(doc(como(NOVO), 'parceiros', NOVO), { aulasVistas: ['a', 'b'] }));
  });

  test('carimbo depois do tempo minimo passa', async () => {
    await assertSucceeds(updateDoc(doc(como(VELHO), 'parceiros', VELHO), { aulasVistas: ['a'], aulasEm: new Date().toISOString() }));
  });
});


/* ========== v30 (23/09/2026): varredura de seguranca ========== */
describe('v30 — leitura de assinaturas/indicacoes, resumo e nome do parceiro', () => {
  const PARC = 'parceiro-v30';
  before(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'admins', ADM), { desde: 'sempre' });
      await setDoc(doc(db, 'negocios', DONO), { nome: 'Food Truck do Teste' });
      await setDoc(doc(db, 'negocios', DONO, 'resumo', 'avaliacoes'), { n: 1, soma: 5 });
      await setDoc(doc(db, 'assinaturas', DONO), { plano: 'pro', ativo: true });
      await setDoc(doc(db, 'indicacoes', DONO), { ref: 'anav30' });
      await setDoc(doc(db, 'parceiros', PARC), { nome: 'Ana', slug: 'anav30', status: 'aprovado', pix: 'ana@pix.com' });
    });
  });

  test('ler UMA assinatura continua publico', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'assinaturas', DONO)));
  });
  test('LISTAR assinaturas: anonimo nao', async () => {
    await assertFails(getDocs(collection(anon(), 'assinaturas')));
  });
  test('LISTAR assinaturas: admin sim', async () => {
    await assertSucceeds(getDocs(collection(admin(), 'assinaturas')));
  });
  test('indicacao: anonimo nao le', async () => {
    await assertFails(getDoc(doc(anon(), 'indicacoes', DONO)));
  });
  test('indicacao: o parceiro lista as do proprio apelido', async () => {
    const db = env.authenticatedContext(PARC).firestore();
    await assertSucceeds(getDocs(query(collection(db, 'indicacoes'), where('ref', '==', 'anav30'))));
  });
  test('indicacao: o parceiro NAO lista as de outro apelido', async () => {
    const db = env.authenticatedContext(PARC).firestore();
    await assertFails(getDocs(query(collection(db, 'indicacoes'), where('ref', '==', 'outro'))));
  });
  test('resumo: +1 sem avaliacao nova e recusado', async () => {
    await assertFails(updateDoc(doc(anon(), 'negocios', DONO, 'resumo', 'avaliacoes'), { n: increment(1), soma: increment(1) }));
  });
  test('resumo: avaliacao + resumo na mesma escrita passa', async () => {
    const db = anon();
    const av = doc(collection(db, 'negocios', DONO, 'avaliacoes'));
    const b = writeBatch(db);
    b.set(av, { nota: 4, nome: 'Carlos', criadoEm: serverTimestamp() });
    b.update(doc(db, 'negocios', DONO, 'resumo', 'avaliacoes'), { n: increment(1), soma: increment(4), ultimaAv: av.id });
    await assertSucceeds(b.commit());
  });
  test('resumo: soma diferente da nota da avaliacao e recusada', async () => {
    const db = anon();
    const av = doc(collection(db, 'negocios', DONO, 'avaliacoes'));
    const b = writeBatch(db);
    b.set(av, { nota: 5, nome: 'Carlos', criadoEm: serverTimestamp() });
    b.update(doc(db, 'negocios', DONO, 'resumo', 'avaliacoes'), { n: increment(1), soma: increment(1), ultimaAv: av.id });
    await assertFails(b.commit());
  });
  test('parceiro aprovado NAO troca o nome sozinho', async () => {
    const db = env.authenticatedContext(PARC).firestore();
    await assertFails(updateDoc(doc(db, 'parceiros', PARC), { nome: 'Suporte Moviki' }));
  });
  test('parceiro aprovado troca a chave Pix', async () => {
    const db = env.authenticatedContext(PARC).firestore();
    await assertSucceeds(updateDoc(doc(db, 'parceiros', PARC), { pix: 'ana2@pix.com' }));
  });
});
