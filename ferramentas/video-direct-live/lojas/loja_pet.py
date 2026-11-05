# Bicho Feliz Pet Shop (amostra de pet) — 05/11/2026, para o vídeo do direct "live primeiro".
# Fotos geradas no Kairogen (img/). Só existe dentro do motor: nunca gravar em produção.
import time, datetime
UID = 'bichoFelizAmostra2026'
SLUG = 'bichofeliz'
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
    {'categoria': 'Cachorro', 'capa': F('p-peitoral.jpg'), 'produtos': [
        P('Peitoral acolchoado', '79,90', 'peitoral', 'p-peitoral.jpg', 'Não aperta o pescoço. Fecho de clique e alça de mão.', variacoes=[{'nome': 'Tamanho', 'ops': ['P', 'M', 'G']}]),
        P('Kit 3 brinquedos', '49,90', 'brinquedos', 'p-brinquedos.jpg', 'Corda, bolinha e osso de pelúcia.'),
        P('Petisco natural', '29,90', 'petisco', 'p-petisco.jpg', 'Palitos desidratados, sem corante.')]},
    {'categoria': 'Gato', 'capa': F('p-arranhador.jpg'), 'produtos': [
        P('Arranhador torre', '189,90', 'arranhador', 'p-arranhador.jpg', 'Sisal e pelúcia, com plataforma para descansar.'),
        P('Varinha com penas', '24,90', 'varinha', 'p-varinha.jpg', 'Vem com ratinho de pelúcia.')]},
    {'categoria': 'Conforto', 'capa': F('p-cama.jpg'), 'produtos': [
        P('Cama redonda de pelúcia', '159,90', 'cama', 'p-cama.jpg', 'Macia e lavável na máquina.', variacoes=[{'nome': 'Tamanho', 'ops': ['P', 'M', 'G']}]),
        P('Fonte de água', '129,90', 'fonte', 'p-fonte.jpg', 'Água sempre corrente e fresca.')]},
    {'categoria': 'Higiene', 'capa': F('p-shampoo.jpg'), 'produtos': [
        P('Shampoo pet com escova', '44,90', 'shampoopet', 'p-shampoo.jpg', 'pH neutro, para cães e gatos.')]},
]

def negocio(**extra):
    n = {
        'nome': 'Bicho Feliz Pet Shop', 'slug': SLUG, 'cor': '#1f8a7a', 'tema': 'claro',
        'markerLogo': F('logo.png'),
        'recado': 'Peitorais, camas e brinquedos novos para o seu pet 🐾',
        'whatsapp': '41998760000',
        'horario': 'Seg a Sex 9h às 19h · Sáb 9h às 14h',
        'horarios': {'dom': '', 'seg': '09:00-19:00', 'ter': '09:00-19:00', 'qua': '09:00-19:00', 'qui': '09:00-19:00', 'sex': '09:00-19:00', 'sab': '09:00-14:00'},
        'endereco': 'Rua Comendador Araújo - Batel, Curitiba/PR',
        'lat': -25.4310, 'lng': -49.2690, 'status': 'aberto',
        'segmento': 'pet', 'segmentoMacro': 'varejo',
        'entrega': '4 bairros · grátis acima de R$ 250',
        'capa': F('capa.jpg'), 'capaVideo': '',
        'fotos': [F('capa.jpg'), F('p-peitoral.jpg'), F('p-cama.jpg'), F('p-arranhador.jpg')],
        'videos': [],
        'cardapio': CARDAPIO,
        'promocoes': [{'titulo': 'Peitoral com 25% na live', 'detalhe': 'só na live de quinta', 'capa': F('p-peitoral.jpg')}],
        'eventos': [],
        'faq': [
            {'p': 'Como sei o tamanho do peitoral?', 'r': 'Mande o peso e a medida do peito do seu pet no WhatsApp que a gente indica.'},
            {'p': 'Posso reservar e provar na loja?', 'r': 'Pode. Escolha "Reservar e pagar na loja": o produto fica separado por 2 horas.'}],
        'redes': {'instagram': 'bichofeliz.amostra'},
        'agendaLives': [{'em': _ms_local(1, 20), 'titulo': 'Live do passeio: peitorais e guias'}],
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
    'estoque': {'s:arranhador': 2},
    'recursos': {'listaVip': True},
}

AVALIACOES = [
    (5, 'Fernanda P.', 'O peitoral serviu certinho no meu shih-tzu.', 'Que bom, Fernanda!'),
    (5, 'Marcos V.', 'Reservei pela página e busquei no almoço.', ''),
    (4, 'Juliana R.', 'Cama linda. Demorou um pouco para chegar, mas avisaram.', ''),
    (5, 'Carla S.', 'Me ajudaram a escolher o tamanho pelo WhatsApp.', ''),
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
    return {'user': {'uid': UID, 'email': 'contato@bichofeliz.example', 'emailVerified': True, 'displayName': 'Bicho Feliz Pet Shop'}, 'docs': docs, 'writes': []}
