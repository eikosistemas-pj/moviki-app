# Lua de Prata (amostra de semijoias) — adaptada em 05/11/2026 do Project claude/videoaulas-motor-v3/loja_semijoias.py:
# fotos locais em img/ (CDN do Kairogen), sem os 3 produtos cujas fotos não estão acessíveis (coração, solitário, riviera).
# Só existe dentro do motor: nunca gravar em produção.
import time, datetime
UID = 'luaDePrataAmostra2026'
SLUG = 'luadeprata'
DIA = 86400000
def F(n): return 'img/' + n
VIDEO = 'https://cdn.kairogen.ai/gallery/videos/6a85cb71af7328d006a48d4c/37cf9902-dd2b-4787-91d3-1f322aed0359.mp4'

def _ms_local(dias, h, m=0):
    d = datetime.datetime.utcnow() - datetime.timedelta(hours=3)
    alvo = datetime.datetime(d.year, d.month, d.day, h, m) + datetime.timedelta(days=dias)
    return int((alvo + datetime.timedelta(hours=3) - datetime.datetime(1970, 1, 1)).total_seconds() * 1000)

def P(nome, preco, sku, foto, desc, **x):
    p = {'nome': nome, 'preco': preco, 'sku': sku, 'descricao': desc, 'fotos': [F(foto)]}
    p.update(x); return p

COR = {'nome': 'Cor', 'ops': ['Dourado', 'Prateado', 'Rosé']}
ARO = {'nome': 'Número', 'ops': ['12', '14', '16', '18', '20']}

CARDAPIO = [
    {'categoria': 'Brincos', 'capa': F('p-gota.jpg'), 'produtos': [
        P('Brinco gota de cristal', '69,90', 'gota', 'p-gota.jpg', 'Cristal lapidado com banho de ródio. Antialérgico.', variacoes=[COR]),
        P('Argola média lisa', '79,90', 'argola', 'p-argola.jpg', 'Banho de ouro 18k com 5 milésimos. Leve para o dia todo.', variacoes=[COR]),
        P('Argolinha trançada', '49,90', 'trancada', 'p-trancada.jpg', 'Argola pequena com trama de corda. Para o segundo furo.'),
        P('Kit 3 pares de brincos', '99,90', 'kitbrinco', 'p-kitbrinco.jpg', 'Ponto de luz, argolinha e estrela. Para presente.')]},
    {'categoria': 'Colares', 'capa': F('p-choker.jpg'), 'produtos': [
        P('Choker de pérolas', '119,90', 'choker', 'p-choker.jpg', 'Pérolas de vidro com fecho dourado.'),
        P('Corrente grumet fina', '59,90', 'grumet', 'p-grumet.jpg', 'Básica que combina com tudo. 50 cm.'),
        P('Colar letra inicial', '74,90', 'inicial', 'p-inicial.jpg', 'Escolha a letra no WhatsApp. Pronto em 1 dia.')]},
    {'categoria': 'Anéis', 'capa': F('p-aparador.jpg'), 'produtos': [
        P('Anel aparador cravejado', '54,90', 'aparador', 'p-aparador.jpg', 'Para usar junto do solitário ou sozinho.', variacoes=[ARO]),
        P('Anel ajustável folhas', '39,90', 'folhas', 'p-folhas.jpg', 'Regula no dedo. Serve do 12 ao 20.'),
        P('Kit 5 anéis falange', '69,90', 'falange', 'p-falange.jpg', 'Cinco modelos finos para empilhar.')]},
    {'categoria': 'Pulseiras', 'capa': F('p-berloque.jpg'), 'produtos': [
        P('Pulseira de berloques', '99,90', 'berloque', 'p-berloque.jpg', 'Vem com 3 berloques. Monte a sua.'),
        P('Bracelete liso', '84,90', 'bracelete', 'p-bracelete.jpg', 'Aberto atrás, ajusta no pulso.'),
        P('Tornozeleira de conchas', '44,90', 'tornozeleira', 'p-tornozeleira.jpg', 'Conchinhas naturais e banho de ouro.')]},
]

def negocio(**extra):
    n = {
        'nome': 'Lua de Prata', 'slug': SLUG, 'cor': '#0e5c5f', 'tema': 'claro',
        'markerLogo': F('logo.png'),
        'recado': 'Coleção de verão com banho de ouro 18k e 1 ano de garantia ✨',
        'whatsapp': '41998761234',
        'horario': 'Seg a Sex 10h às 19h · Sáb 10h às 15h',
        'horarios': {'dom': '', 'seg': '10:00-19:00', 'ter': '10:00-19:00', 'qua': '10:00-19:00', 'qui': '10:00-19:00', 'sex': '10:00-19:00', 'sab': '10:00-15:00'},
        'endereco': 'Rua Comendador Araújo - Batel, Curitiba/PR',
        'lat': -25.4389, 'lng': -49.2811, 'status': 'aberto',
        'segmento': 'acessorios', 'segmentoMacro': 'moda',
        'entrega': '4 bairros · grátis acima de R$ 180',
        'capa': F('capa.jpg'), 'capaVideo': VIDEO,
        'fotos': [F('g-fachada.jpg'), F('g-vitrine.jpg'), F('g-prova.jpg'), F('g-balcao.jpg'), F('g-embalagem.jpg'), F('g-bandeja.jpg')],
        'videos': [{'url': 'https://youtu.be/SFcvFbjJ4OE', 'titulo': 'Conheça a Lua de Prata', 'capa': F('capa.jpg')}],
        'cardapio': CARDAPIO,
        'promocoes': [
            {'titulo': 'Leve 2 argolas, pague 1 e meia', 'detalhe': '2 argolas por R$ 119,90 · cores à escolha', 'capa': F('promo-argola.jpg')},
            {'titulo': 'Kit presente: colar + brinco', 'detalhe': 'por R$ 139,90 · com caixinha e laço', 'capa': F('promo-kit.jpg')}],
        'eventos': [
            {'titulo': 'Bazar de semijoias', 'quando': 'Sáb 14/11 das 10h às 15h', 'detalhe': 'Na loja do Batel · peças a partir de R$ 29,90', 'capa': F('evento-bazar.jpg')}],
        'faq': [
            {'p': 'As peças escurecem?', 'r': 'Não. O banho é de ouro 18k com 5 milésimos e tem 1 ano de garantia contra escurecimento.'},
            {'p': 'Dá alergia?', 'r': 'As peças são antialérgicas, sem níquel. Se tiver dúvida, pergunte no WhatsApp qual modelo é melhor para você.'},
            {'p': 'Posso reservar e pagar na loja?', 'r': 'Pode. Escolha "Reservar e pagar na loja": a peça fica separada por 2 horas.'},
            {'p': 'Vocês fazem embalagem de presente?', 'r': 'Fazemos, sem custo: caixinha, laço e cartão.'}],
        'redes': {'instagram': 'luadeprata.amostra', 'tiktok': 'luadeprata.amostra'},
        'lojaOnline': 'https://loja.luadeprata.example',
        'agendaLives': [
            {'em': _ms_local(1, 20), 'titulo': 'Live de lançamento: coleção verão'},
            {'em': _ms_local(5, 19, 30), 'titulo': 'Como montar o mix de anéis'}],
        'criadoEm': {'__ms': int(time.time() * 1000) - 150 * DIA},
    }
    n.update(extra); return n

CHECKOUT = {
    'ativo': True, 'modo': 'pix', 'reserva': True,
    'entrega': 'ambos', 'retirada': 'Rua Comendador Araújo - Batel, no balcão',
    'bairros': [{'nome': 'Batel', 'taxa': 6}, {'nome': 'Centro', 'taxa': 8},
                {'nome': 'Água Verde', 'taxa': 9}, {'nome': 'Bigorrilho', 'taxa': 9}],
    'minimo': 0, 'minimoEntrega': 40, 'gratisAcima': 180,
    'prazo': 'no mesmo dia, pedido até 15h', 'cidadeEntrega': 'Curitiba/PR',
    'estoque': {'s:kitbrinco': 0, 's:choker': 2},
    'recursos': {'listaVip': True},
}

AVALIACOES = [
    (5, 'Rafaela G.', 'Comprei a argola há 8 meses e continua igual, sem escurecer.', 'Que alegria, Rafaela! É o banho de 5 milésimos fazendo efeito.'),
    (5, 'Bianca T.', 'Mandei a medida do dedo no WhatsApp e o anel serviu certinho.', ''),
    (4, 'Simone A.', 'Peças lindas. A entrega atrasou meia hora, mas avisaram.', 'Obrigada pela paciência, Simone! Já ajustamos a rota do Água Verde.'),
    (5, 'Priscila N.', 'Reservei a pulseira pela página e busquei no almoço.', ''),
    (5, 'Joana L.', 'A caixinha de presente é linda, minha irmã amou.', ''),
    (4, 'Viviane C.', 'Brinco leve e bonito. Queria mais opções de prata.', ''),
    (5, 'Helena M.', 'Fui no bazar e voltei com três peças. Atendimento carinhoso.', ''),
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
    return {'user': {'uid': UID, 'email': 'contato@luadeprata.example', 'emailVerified': True, 'displayName': 'Lua de Prata'}, 'docs': docs, 'writes': []}
