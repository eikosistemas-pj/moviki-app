# Sola Viva (amostra de calçados) — 05/11/2026, para o vídeo do direct "live primeiro".
# Fotos geradas no Kairogen (img/). Só existe dentro do motor: nunca gravar em produção.
import time, datetime
UID = 'solaVivaAmostra2026'
SLUG = 'solaviva'
DIA = 86400000
def F(n): return 'img/' + n

def _ms_local(dias, h, m=0):
    d = datetime.datetime.utcnow() - datetime.timedelta(hours=3)
    alvo = datetime.datetime(d.year, d.month, d.day, h, m) + datetime.timedelta(days=dias)
    return int((alvo + datetime.timedelta(hours=3) - datetime.datetime(1970, 1, 1)).total_seconds() * 1000)

def P(nome, preco, sku, foto, desc, **x):
    p = {'nome': nome, 'preco': preco, 'sku': sku, 'descricao': desc, 'fotos': [F(foto)]}
    p.update(x); return p

NUM = {'nome': 'Número', 'ops': ['34', '35', '36', '37', '38', '39', '40']}

CARDAPIO = [
    {'categoria': 'Tênis', 'capa': F('p-branco.jpg'), 'produtos': [
        P('Tênis branco de couro', '249,90', 'branco', 'p-branco.jpg', 'Couro macio, palmilha acolchoada. Combina com tudo.', variacoes=[NUM]),
        P('Tênis de corrida knit', '299,90', 'corrida', 'p-corrida.jpg', 'Leve e respirável, solado que amortece.', variacoes=[NUM]),
        P('Tênis slip-on knit', '179,90', 'slipon', 'p-slipon.jpg', 'Calça sem cadarço. Para o dia a dia.', variacoes=[NUM])]},
    {'categoria': 'Sandálias', 'capa': F('p-rasteira.jpg'), 'produtos': [
        P('Rasteira trançada', '89,90', 'rasteira', 'p-rasteira.jpg', 'Couro trançado à mão, cor caramelo.', variacoes=[NUM]),
        P('Sandália salto bloco', '159,90', 'salto', 'p-salto.jpg', 'Salto de 6 cm, firme e confortável.', variacoes=[NUM]),
        P('Papete preta', '129,90', 'papete', 'p-papete.jpg', 'Tiras com velcro e solado tratorado.', variacoes=[NUM])]},
    {'categoria': 'Botas', 'capa': F('p-bota.jpg'), 'produtos': [
        P('Bota cano curto', '259,90', 'bota', 'p-bota.jpg', 'Couro preto com salto bloco baixo.', variacoes=[NUM]),
        P('Coturno de couro', '289,90', 'coturno', 'p-coturno.jpg', 'Cadarço e solado tratorado. Couro legítimo.', variacoes=[NUM])]},
    {'categoria': 'Sapatilhas e mocassins', 'capa': F('p-mocassim.jpg'), 'produtos': [
        P('Mocassim de camurça', '189,90', 'mocassim', 'p-mocassim.jpg', 'Camurça caramelo, palmilha macia.', variacoes=[NUM]),
        P('Sapatilha bico fino', '99,90', 'sapatilha', 'p-sapatilha.jpg', 'Preta, leve, vai do trabalho ao jantar.', variacoes=[NUM]),
        P('Mule off-white', '139,90', 'mule', 'p-mule.jpg', 'Bico quadrado, calça e tira fácil.', variacoes=[NUM])]},
]

def negocio(**extra):
    n = {
        'nome': 'Sola Viva', 'slug': SLUG, 'cor': '#7c4a28', 'tema': 'claro',
        'markerLogo': F('logo.png'),
        'recado': 'Coleção de verão chegou: tênis e sandálias do 34 ao 40 👟',
        'whatsapp': '41998760000',
        'horario': 'Seg a Sex 9h às 19h · Sáb 9h às 14h',
        'horarios': {'dom': '', 'seg': '09:00-19:00', 'ter': '09:00-19:00', 'qua': '09:00-19:00', 'qui': '09:00-19:00', 'sex': '09:00-19:00', 'sab': '09:00-14:00'},
        'endereco': 'Rua Marechal Deodoro - Centro, Curitiba/PR',
        'lat': -25.4310, 'lng': -49.2690, 'status': 'aberto',
        'segmento': 'calcados', 'segmentoMacro': 'moda',
        'entrega': '4 bairros · grátis acima de R$ 250',
        'capa': F('capa.jpg'), 'capaVideo': '',
        'fotos': [F('capa.jpg'), F('p-branco.jpg'), F('p-rasteira.jpg'), F('p-bota.jpg')],
        'videos': [],
        'cardapio': CARDAPIO,
        'promocoes': [{'titulo': 'Tênis branco com 20% na live', 'detalhe': 'só na live de quinta', 'capa': F('p-branco.jpg')}],
        'eventos': [],
        'faq': [
            {'p': 'Posso trocar o número?', 'r': 'Pode. A troca é em até 30 dias, com a caixa, na loja ou pela entrega.'},
            {'p': 'Posso reservar e provar na loja?', 'r': 'Pode. Escolha "Reservar e pagar na loja": o par fica separado por 2 horas.'}],
        'redes': {'instagram': 'solaviva.amostra'},
        'agendaLives': [{'em': _ms_local(1, 20), 'titulo': 'Live de verão: tênis e sandálias'}],
        'criadoEm': {'__ms': int(time.time() * 1000) - 150 * DIA},
    }
    n.update(extra); return n

CHECKOUT = {
    'ativo': True, 'modo': 'pix', 'reserva': True,
    'entrega': 'ambos', 'retirada': 'Rua Marechal Deodoro - Centro, no balcão',
    'bairros': [{'nome': 'Centro', 'taxa': 6}, {'nome': 'Batel', 'taxa': 8},
                {'nome': 'Água Verde', 'taxa': 9}, {'nome': 'Rebouças', 'taxa': 9}],
    'minimo': 0, 'minimoEntrega': 60, 'gratisAcima': 250,
    'prazo': 'no mesmo dia, pedido até 15h', 'cidadeEntrega': 'Curitiba/PR',
    'estoque': {'s:coturno': 2},
    'recursos': {'listaVip': True},
}

AVALIACOES = [
    (5, 'Fernanda P.', 'O tênis branco é muito confortável, uso o dia todo.', 'Que bom, Fernanda!'),
    (5, 'Marcos V.', 'Reservei pela página e provei no almoço. Serviu certinho.', ''),
    (4, 'Juliana R.', 'Rasteira linda. Demorou um pouco para chegar, mas avisaram.', ''),
    (5, 'Carla S.', 'Atendimento atencioso, me ajudaram a escolher o número.', ''),
    (5, 'Tatiane L.', 'Comprei na live e chegou no mesmo dia.', ''),
]

def fake(plano='premium', neg=None, extra_docs=None):
    now = int(time.time() * 1000)
    docs = {f'negocios/{UID}': neg or negocio(),
            f'assinaturas/{UID}': {'ativo': True, 'plano': plano, 'periodo': 'mensal', 'vence_em': {'__ms': now + 40 * DIA}},
            'configuracoes/liveTermos': {'liveBeta': [], 'liveDesligada': False},
            f'slugs/{SLUG}': {'uid': UID}, f'checkout_publico/{UID}': CHECKOUT,
            f'negocios/{UID}/resumo/avaliacoes': {'n': len(AVALIACOES), 'soma': sum(a[0] for a in AVALIACOES)},
            f'negocios/{UID}/estado/tutoriais': {'vistas': ['mod-boasvindas2', 'mod-inicio', 'mod-desempenho', 'mod-diaadia'], 'em': '2026-09-20'},
            f'negocios/{UID}/estado/pedidosaulas': {'vistas': [], 'em': ''}}
    for i, (n, nm, c, r) in enumerate(AVALIACOES):
        a = {'nota': n, 'nome': nm, 'comentario': c, 'em': {'__ms': now - (i + 1) * 3 * DIA}}
        if r: a['resposta'] = r
        docs[f'negocios/{UID}/avaliacoes/a{i+1}'] = a
    if extra_docs: docs.update(extra_docs)
    return {'user': {'uid': UID, 'email': 'contato@solaviva.example', 'emailVerified': True, 'displayName': 'Sola Viva'}, 'docs': docs, 'writes': []}
