# Doce Rosa Confeitaria (amostra de confeitaria) — 05/11/2026, para o vídeo do direct "live primeiro".
# Fotos geradas no Kairogen (img/). Só existe dentro do motor: nunca gravar em produção.
import time, datetime
UID = 'doceRosaAmostra2026'
SLUG = 'docerosa'
DIA = 86400000
def F(n): return 'img/' + n

def _ms_local(dias, h, m=0):
    d = datetime.datetime.utcnow() - datetime.timedelta(hours=3)
    alvo = datetime.datetime(d.year, d.month, d.day, h, m) + datetime.timedelta(days=dias)
    return int((alvo + datetime.timedelta(hours=3) - datetime.datetime(1970, 1, 1)).total_seconds() * 1000)

def P(nome, preco, sku, foto, desc, **x):
    p = {'nome': nome, 'preco': preco, 'sku': sku, 'descricao': desc, 'fotos': [F(foto)]}
    p.update(x); return p

CARDAPIO = [
    {'categoria': 'Doces', 'capa': F('p-bolopote.jpg'), 'produtos': [
        P('Bolo de pote Ninho com chocolate', '16,90', 'bolopote', 'p-bolopote.jpg', 'Pote de 250 g, feito no dia.', variacoes=[{'nome': 'Sabor', 'ops': ['Ninho com chocolate', 'Ninho com morango', 'Prestígio']}]),
        P('Caixa com 12 brigadeiros', '36,00', 'brig12', 'p-brigadeiros.jpg', 'Tradicional, pistache e coco. Caixa para presente.'),
        P('Brownie', '9,90', 'brownie', 'p-brownie.jpg', 'Casquinha crocante e meio molhadinho por dentro.')]},
    {'categoria': 'Bolos e tortas', 'capa': F('p-bolo.jpg'), 'produtos': [
        P('Bolo de chocolate', '89,90', 'bolochoc', 'p-bolo.jpg', 'Com ganache. Encomenda com 1 dia de antecedência.', variacoes=[{'nome': 'Tamanho', 'ops': ['Pequeno (10 fatias)', 'Médio (20 fatias)']}]),
        P('Torta de limão', '64,90', 'tortalimao', 'p-torta.jpg', 'Merengue maçaricado e raspas de limão.')]},
]

def negocio(**extra):
    n = {
        'nome': 'Doce Rosa Confeitaria', 'slug': SLUG, 'cor': '#7a3f2a', 'tema': 'claro',
        'markerLogo': F('logo.png'),
        'recado': 'Doces feitos no dia, do jeito da vó 💗',
        'whatsapp': '83998760000',
        'horario': 'Terça a domingo 9h às 19h',
        'horarios': {'dom': '09:00-14:00', 'seg': '', 'ter': '09:00-19:00', 'qua': '09:00-19:00', 'qui': '09:00-19:00', 'sex': '09:00-19:00', 'sab': '09:00-19:00'},
        'endereco': 'Av. Governador Argemiro de Figueiredo - Bessa, João Pessoa/PB',
        'lat': -7.0745, 'lng': -34.8360, 'status': 'aberto',
        'segmento': 'confeitaria', 'segmentoMacro': 'alimentacao',
        'entrega': '4 bairros · grátis acima de R$ 80',
        'capa': F('capa.jpg'), 'capaVideo': '',
        'fotos': [F('capa.jpg'), F('p-bolopote.jpg'), F('p-brigadeiros.jpg'), F('p-bolo.jpg')],
        'videos': [],
        'cardapio': CARDAPIO,
        'promocoes': [{'titulo': 'Bolo de pote por R$ 12,90 na live', 'detalhe': 'só na live de sábado', 'capa': F('p-bolopote.jpg')}],
        'eventos': [],
        'faq': [
            {'p': 'Faz bolo por encomenda?', 'r': 'Faz. Peça com 1 dia de antecedência pela página ou no WhatsApp.'},
            {'p': 'Os doces são feitos no dia?', 'r': 'Sim. Tudo sai da cozinha na manhã da entrega.'}],
        'redes': {'instagram': 'docerosa.amostra'},
        'agendaLives': [{'em': _ms_local(1, 16), 'titulo': 'Live dos doces: bolo de pote fresquinho'}],
        'criadoEm': {'__ms': int(time.time() * 1000) - 150 * DIA},
    }
    n.update(extra); return n

CHECKOUT = {
    'ativo': True, 'modo': 'pix', 'reserva': True,
    'entrega': 'ambos', 'retirada': 'Av. Gov. Argemiro de Figueiredo - Bessa, no balcão',
    'bairros': [{'nome': 'Bessa', 'taxa': 5}, {'nome': 'Manaíra', 'taxa': 6},
                {'nome': 'Tambaú', 'taxa': 7}, {'nome': 'Cabo Branco', 'taxa': 8}],
    'minimo': 0, 'minimoEntrega': 25, 'gratisAcima': 80,
    'prazo': 'no mesmo dia', 'cidadeEntrega': 'João Pessoa/PB',
    'estoque': {'s:bolopote': 8},
    'recursos': {'listaVip': True},
}

AVALIACOES = [
    (5, 'Renata M.', 'O bolo de pote mais gostoso que já comi.', 'Obrigada, Renata!'),
    (5, 'Paula A.', 'Encomendei o bolo de aniversário pela página. Perfeito.', ''),
    (4, 'Igor S.', 'Muito bom. Na sexta acabou rápido, mas reservaram o meu.', ''),
    (5, 'Luana T.', 'Brigadeiro de pistache maravilhoso.', ''),
    (5, 'Cris B.', 'Comprei na live e chegou no mesmo dia.', ''),
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
    return {'user': {'uid': UID, 'email': 'contato@docerosa.example', 'emailVerified': True, 'displayName': 'Doce Rosa Confeitaria'}, 'docs': docs, 'writes': []}
