# Roxo Açaí (amostra de açaí) — 05/11/2026, para o vídeo do direct "live primeiro".
# Fotos geradas no Kairogen (img/). Só existe dentro do motor: nunca gravar em produção.
import time, datetime
UID = 'roxoAcaiAmostra2026'
SLUG = 'roxoacai'
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
    {'categoria': 'Copos', 'capa': F('p-copo.jpg'), 'produtos': [
        P('Copo de açaí 500 ml', '24,90', 'copo500', 'p-copo.jpg', 'Banana, morango, granola e leite condensado.', variacoes=[{'nome': 'Volume', 'ops': ['300 ml', '500 ml', '700 ml']}]),
        P('Açaí com paçoca', '27,90', 'pacoca', 'p-pacoca.jpg', 'Paçoca, creme de avelã e leite em pó.'),
        P('Creme de cupuaçu', '22,90', 'cupuacu', 'p-cupuacu.jpg', 'Cupuaçu cremoso com granola.')]},
    {'categoria': 'Bowls', 'capa': F('p-bowl.jpg'), 'produtos': [
        P('Bowl tropical', '32,90', 'bowl', 'p-bowl.jpg', 'Kiwi, manga, coco, granola e mel.')]},
    {'categoria': 'Bebidas', 'capa': F('p-smoothie.jpg'), 'produtos': [
        P('Smoothie de açaí', '18,90', 'smoothie', 'p-smoothie.jpg', 'Açaí batido com morango, 400 ml.')]},
    {'categoria': 'Para levar', 'capa': F('p-pote.jpg'), 'produtos': [
        P('Pote de açaí 1 litro', '39,90', 'pote1l', 'p-pote.jpg', 'Puro, para montar em casa. Vai congelado.')]},
]

def negocio(**extra):
    n = {
        'nome': 'Roxo Açaí', 'slug': SLUG, 'cor': '#5b2a86', 'tema': 'claro',
        'markerLogo': F('logo.png'),
        'recado': 'Açaí cremoso, montado do seu jeito 💜',
        'whatsapp': '41998760000',
        'horario': 'Todos os dias 12h às 22h',
        'horarios': {'dom': '12:00-22:00', 'seg': '12:00-22:00', 'ter': '12:00-22:00', 'qua': '12:00-22:00', 'qui': '12:00-22:00', 'sex': '12:00-22:00', 'sab': '12:00-22:00'},
        'endereco': 'Rua Comendador Araújo - Batel, Curitiba/PR',
        'lat': -25.4310, 'lng': -49.2690, 'status': 'aberto',
        'segmento': 'acai', 'segmentoMacro': 'alimentacao',
        'entrega': '4 bairros · grátis acima de R$ 60',
        'capa': F('capa.jpg'), 'capaVideo': '',
        'fotos': [F('capa.jpg'), F('p-copo.jpg'), F('p-bowl.jpg'), F('p-pacoca.jpg')],
        'videos': [],
        'cardapio': CARDAPIO,
        'promocoes': [{'titulo': 'Copo 500 ml por R$ 19,90 na live', 'detalhe': 'só na live de sexta', 'capa': F('p-copo.jpg')}],
        'eventos': [],
        'faq': [
            {'p': 'Posso escolher os acompanhamentos?', 'r': 'Pode. Escreva no pedido o que trocar, ou chame no WhatsApp.'},
            {'p': 'Chega derretido?', 'r': 'Não. Vai em embalagem térmica e entregamos em até 40 minutos.'}],
        'redes': {'instagram': 'roxoacai.amostra'},
        'agendaLives': [{'em': _ms_local(1, 20), 'titulo': 'Live do açaí: monte o seu copo'}],
        'criadoEm': {'__ms': int(time.time() * 1000) - 150 * DIA},
    }
    n.update(extra); return n

CHECKOUT = {
    'ativo': True, 'modo': 'pix', 'reserva': True,
    'entrega': 'ambos', 'retirada': 'Rua Comendador Araújo - Batel, no balcão',
    'bairros': [{'nome': 'Centro', 'taxa': 5}, {'nome': 'Batel', 'taxa': 6},
                {'nome': 'Água Verde', 'taxa': 7}, {'nome': 'Rebouças', 'taxa': 7}],
    'minimo': 0, 'minimoEntrega': 25, 'gratisAcima': 60,
    'prazo': 'em até 40 minutos', 'cidadeEntrega': 'Curitiba/PR',
    'estoque': {'s:pote1l': 3},
    'recursos': {'listaVip': True},
}

AVALIACOES = [
    (5, 'Fernanda P.', 'O açaí mais cremoso do bairro.', 'Obrigada, Fernanda!'),
    (5, 'Marcos V.', 'Pedi pela página e chegou geladinho.', ''),
    (4, 'Juliana R.', 'Muito bom. No sábado demorou um pouco, mas avisaram.', ''),
    (5, 'Carla S.', 'Trocaram o morango por kiwi sem problema.', ''),
    (5, 'Tatiane L.', 'Comprei na live e chegou rapidinho.', ''),
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
    return {'user': {'uid': UID, 'email': 'contato@roxoacai.example', 'emailVerified': True, 'displayName': 'Roxo Açaí'}, 'docs': docs, 'writes': []}
