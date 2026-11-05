# Pétala Cosméticos (amostra de cosméticos) — 05/11/2026, para o vídeo do direct "live primeiro".
# Fotos geradas no Kairogen (img/). Só existe dentro do motor: nunca gravar em produção.
import time, datetime
UID = 'petalaAmostra2026'
SLUG = 'petala'
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
    {'categoria': 'Skincare', 'capa': F('p-serum.jpg'), 'produtos': [
        P('Sérum vitamina C', '89,90', 'serum', 'p-serum.jpg', 'Ilumina e uniformiza o tom. Textura leve, para todo tipo de pele.'),
        P('Creme hidratante facial', '79,90', 'creme', 'p-creme.jpg', 'Hidratação de 24 horas, sem deixar a pele oleosa.'),
        P('Protetor solar FPS 50', '69,90', 'protetor', 'p-protetor.jpg', 'Toque seco e cor invisível. Para usar todo dia.')]},
    {'categoria': 'Maquiagem', 'capa': F('p-batom.jpg'), 'produtos': [
        P('Kit 3 batons', '99,90', 'batom', 'p-batom.jpg', 'Nude, rosé e malva. Acabamento cremoso.', variacoes=[{'nome': 'Cor', 'ops': ['Nude', 'Rosé', 'Malva']}]),
        P('Paleta de sombras 12 cores', '119,90', 'paleta', 'p-paleta.jpg', 'Tons quentes e bronze, do dia à noite.'),
        P('Base líquida', '89,90', 'base', 'p-base.jpg', 'Cobertura média e acabamento natural.', variacoes=[{'nome': 'Tom', 'ops': ['Claro', 'Médio', 'Escuro']}])]},
    {'categoria': 'Cabelo e corpo', 'capa': F('p-shampoo.jpg'), 'produtos': [
        P('Kit shampoo e máscara', '109,90', 'shampoo', 'p-shampoo.jpg', 'Limpeza suave e nutrição para fios secos.')]},
    {'categoria': 'Perfumes e unhas', 'capa': F('p-perfume.jpg'), 'produtos': [
        P('Perfume floral 50 ml', '149,90', 'perfume', 'p-perfume.jpg', 'Notas de rosa e baunilha. Fixação longa.'),
        P('Kit 4 esmaltes', '39,90', 'esmalte', 'p-esmalte.jpg', 'Nude, vermelho, rosé e coral.')]},
]

def negocio(**extra):
    n = {
        'nome': 'Pétala Cosméticos', 'slug': SLUG, 'cor': '#c4607a', 'tema': 'claro',
        'markerLogo': F('logo.png'),
        'recado': 'Skincare de verão chegou: sérum, protetor e kits de presente 🌸',
        'whatsapp': '41998760000',
        'horario': 'Seg a Sex 9h às 19h · Sáb 9h às 14h',
        'horarios': {'dom': '', 'seg': '09:00-19:00', 'ter': '09:00-19:00', 'qua': '09:00-19:00', 'qui': '09:00-19:00', 'sex': '09:00-19:00', 'sab': '09:00-14:00'},
        'endereco': 'Rua Comendador Araújo - Batel, Curitiba/PR',
        'lat': -25.4310, 'lng': -49.2690, 'status': 'aberto',
        'segmento': 'cosmeticos', 'segmentoMacro': 'beleza',
        'entrega': '4 bairros · grátis acima de R$ 250',
        'capa': F('capa.jpg'), 'capaVideo': '',
        'fotos': [F('capa.jpg'), F('p-serum.jpg'), F('p-batom.jpg'), F('p-perfume.jpg')],
        'videos': [],
        'cardapio': CARDAPIO,
        'promocoes': [{'titulo': 'Sérum com 20% na live', 'detalhe': 'só na live de quinta', 'capa': F('p-serum.jpg')}],
        'eventos': [],
        'faq': [
            {'p': 'Vocês ajudam a escolher o produto?', 'r': 'Ajudamos. Mande uma foto da pele no WhatsApp que a gente indica.'},
            {'p': 'Posso reservar e provar na loja?', 'r': 'Pode. Escolha "Reservar e pagar na loja": o produto fica separado por 2 horas.'}],
        'redes': {'instagram': 'petala.amostra'},
        'agendaLives': [{'em': _ms_local(1, 20), 'titulo': 'Live de skincare: rotina de verão'}],
        'criadoEm': {'__ms': int(time.time() * 1000) - 150 * DIA},
    }
    n.update(extra); return n

CHECKOUT = {
    'ativo': True, 'modo': 'pix', 'reserva': True,
    'entrega': 'ambos', 'retirada': 'Rua Comendador Araújo - Batel, no balcão',
    'bairros': [{'nome': 'Centro', 'taxa': 6}, {'nome': 'Batel', 'taxa': 8},
                {'nome': 'Água Verde', 'taxa': 9}, {'nome': 'Rebouças', 'taxa': 9}],
    'minimo': 0, 'minimoEntrega': 60, 'gratisAcima': 250,
    'prazo': 'no mesmo dia, pedido até 15h', 'cidadeEntrega': 'Curitiba/PR',
    'estoque': {'s:perfume': 2},
    'recursos': {'listaVip': True},
}

AVALIACOES = [
    (5, 'Fernanda P.', 'O sérum deixou minha pele iluminada em uma semana.', 'Que bom, Fernanda!'),
    (5, 'Marcos V.', 'Reservei pela página e busquei no almoço.', ''),
    (4, 'Juliana R.', 'Batons lindos. Demorou um pouco para chegar, mas avisaram.', ''),
    (5, 'Carla S.', 'Me ajudaram a escolher a base pelo WhatsApp.', ''),
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
    return {'user': {'uid': UID, 'email': 'contato@petala.example', 'emailVerified': True, 'displayName': 'Pétala Cosméticos'}, 'docs': docs, 'writes': []}
