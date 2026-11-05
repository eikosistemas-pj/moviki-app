# Jacaranda Bolsas (amostra de bolsas) — 05/11/2026, no molde da Lua de Prata. Só existe dentro do motor: nunca gravar em produção.
import time, datetime
UID = 'jacarandaBolsasAmostra2026'
SLUG = 'jacarandabolsas'
DIA = 86400000
def F(n): return 'img/' + n
VIDEO = 'https://cdn.kairogen.ai/gallery/videos/6a85cb71af7328d006a48d4c/8374d3d1-1c95-4116-ad75-cb67cd9c718f.mp4'
def _ms_local(dias, h, m=0):
    d = datetime.datetime.utcnow() - datetime.timedelta(hours=3)
    alvo = datetime.datetime(d.year, d.month, d.day, h, m) + datetime.timedelta(days=dias)
    return int((alvo + datetime.timedelta(hours=3) - datetime.datetime(1970, 1, 1)).total_seconds() * 1000)
def P(nome, preco, sku, foto, desc, **x):
    p = {'nome': nome, 'preco': preco, 'sku': sku, 'descricao': desc, 'fotos': [F(foto)]}
    p.update(x); return p
COR = {'nome': 'Cor', 'ops': ['Caramelo', 'Preto', 'Nude']}
CARDAPIO = [
    {'categoria': 'Bolsas de ombro', 'capa': F('p-tote.jpg'), 'produtos': [
        P('Bolsa tote de couro caramelo', '289,90', 'tote', 'p-tote.jpg', 'Couro legítimo. Cabe notebook de até 14 polegadas. Forro com bolso de zíper.', variacoes=[COR]),
        P('Bolsa de ombro com fivela', '229,90', 'ombro', 'p-ombro.jpg', 'Couro preto com fivela dourada. Alça regulável.'),
        P('Bolsa saco nude', '199,90', 'saco', 'p-saco.jpg', 'Fecha com cordão. Leve para o dia a dia.'),
        P('Bolsa de mão vinho', '249,90', 'vinho', 'p-vinho.jpg', 'Estruturada, com alça de mão e alça longa removível.')]},
    {'categoria': 'Transversais', 'capa': F('p-transversal.jpg'), 'produtos': [
        P('Bolsa transversal camel', '159,90', 'transversal', 'p-transversal.jpg', 'Pequena, cabe celular, carteira e chave.', variacoes=[COR]),
        P('Bolsa de palha com couro', '139,90', 'palha', 'p-palha.jpg', 'Palha natural com aba de couro. Para o verão.')]},
    {'categoria': 'Carteiras e mochilas', 'capa': F('p-carteira.jpg'), 'produtos': [
        P('Carteira longa caramelo', '119,90', 'carteira', 'p-carteira.jpg', '12 divisórias para cartão e porta-moedas com zíper.'),
        P('Mochila de couro preta', '269,90', 'mochila', 'p-mochila.jpg', 'Bolso frontal com zíper e alças reguláveis.'),
        P('Clutch envelope rosé', '129,90', 'clutch', 'p-clutch.jpg', 'Para festa. Alça de pulso dourada.')]},
]
def negocio(**extra):
    n = {
        'nome': 'Jacarandá Bolsas', 'slug': SLUG, 'cor': '#5b3a8e', 'tema': 'claro',
        'markerLogo': F('logo.png'),
        'recado': 'Bolsas de couro com preço de live 👜',
        'whatsapp': '41998765432',
        'horario': 'Seg a Sex 10h às 19h · Sáb 10h às 15h',
        'horarios': {'dom': '', 'seg': '10:00-19:00', 'ter': '10:00-19:00', 'qua': '10:00-19:00', 'qui': '10:00-19:00', 'sex': '10:00-19:00', 'sab': '10:00-15:00'},
        'endereco': 'Rua Exemplo, 100 - Centro, Curitiba/PR',
        'lat': -25.4320, 'lng': -49.2710, 'status': 'aberto',
        'segmento': 'bolsas', 'segmentoMacro': 'moda',
        'entrega': '4 bairros · grátis acima de R$ 250',
        'capa': F('capa.jpg'), 'capaVideo': VIDEO,
        'fotos': [F('capa.jpg'), F('p-tote.jpg'), F('p-palha.jpg'), F('p-vinho.jpg')],
        'videos': [],
        'cardapio': CARDAPIO,
        'promocoes': [{'titulo': 'Bolsa + carteira com desconto', 'detalhe': 'Tote caramelo + carteira longa por R$ 369,90', 'capa': F('p-carteira.jpg')}],
        'eventos': [],
        'faq': [
            {'p': 'É couro legítimo?', 'r': 'As bolsas de couro estão marcadas na descrição. As outras têm o material escrito na foto do produto.'},
            {'p': 'Cabe notebook?', 'r': 'A tote caramelo cabe notebook de até 14 polegadas. Pergunte a medida das outras no WhatsApp.'},
            {'p': 'Posso reservar e pagar na loja?', 'r': 'Pode. Escolha "Reservar e pagar na loja": a bolsa fica separada por 2 horas.'},
            {'p': 'Tem troca?', 'r': 'Tem, em até 7 dias, com a etiqueta.'}],
        'redes': {'instagram': 'jacarandabolsas.amostra'},
        'agendaLives': [
            {'em': _ms_local(1, 20), 'titulo': 'Live de lançamento: bolsas de couro'},
            {'em': _ms_local(4, 19, 30), 'titulo': 'Bolsas para o trabalho'}],
        'criadoEm': {'__ms': int(time.time() * 1000) - 120 * DIA},
    }
    n.update(extra); return n
CHECKOUT = {
    'ativo': True, 'modo': 'pix', 'reserva': True,
    'entrega': 'ambos', 'retirada': 'Rua Exemplo, 100 - Centro, no balcão',
    'bairros': [{'nome': 'Centro', 'taxa': 6}, {'nome': 'Batel', 'taxa': 8}, {'nome': 'Água Verde', 'taxa': 9}, {'nome': 'Bigorrilho', 'taxa': 9}],
    'minimo': 0, 'minimoEntrega': 60, 'gratisAcima': 250,
    'prazo': 'no mesmo dia, pedido até 15h', 'cidadeEntrega': 'Curitiba/PR',
    'estoque': {'s:clutch': 0, 's:tote': 3},
    'recursos': {'listaVip': True},
}
AVALIACOES = [
    (5, 'Fernanda R.', 'A tote cabe meu notebook e ainda sobra espaço. Couro muito bom.', 'Que bom, Fernanda! Ela é a queridinha da loja.'),
    (5, 'Luciana M.', 'Vi na live, perguntei a cor e reservei na hora.', ''),
    (4, 'Camila S.', 'Bolsa linda. A entrega atrasou um pouco, mas avisaram.', 'Obrigada pela paciência, Camila!'),
    (5, 'Renata P.', 'A carteira combina certinho com a bolsa caramelo.', ''),
    (5, 'Aline T.', 'Atendimento atencioso, mandaram vídeo da bolsa por dentro.', ''),
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
    return {'user': {'uid': UID, 'email': 'contato@jacarandabolsas.example', 'emailVerified': True, 'displayName': 'Jacarandá Bolsas'}, 'docs': docs, 'writes': []}
