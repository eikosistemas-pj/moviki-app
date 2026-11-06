# Textos e dados do kit do feed dos 7 ramos do vídeo "live primeiro" (05/11/2026).
RAMOS = [
 # chave, pasta, ramo (slug do arquivo), categoria do Material de apoio, palavra ManyChat, nome da loja, gancho, corpo, dias da grade
 dict(r='moda', pasta='live-moda', cat='moda', pal='MODA', tipo='uma loja de moda', dias=['2026-11-07', '2026-11-14', '2026-11-21'],
      gancho='Roupa no cabide não mostra o caimento. Na live, mostra.',
      corpo='a loja mostra a peça de perto, o tecido e o caimento, e responde no chat se tem o P e se vem em outra cor',
      dica_chat='se tem o P e se vem em outra cor', emoji='👗'),
 dict(r='semijoias', pasta='live-semi', cat='joalheria', pal='SEMIJOIA', tipo='uma loja de semijoias', dias=['2026-11-08', '2026-11-15', '2026-11-22'],
      gancho='Semijoia na foto não brilha. Na live, brilha.',
      corpo='a loja mostra o colar no pescoço, o fecho de perto e o brilho na luz, e responde no chat se escurece e se tem garantia',
      emoji='✨'),
 dict(r='calcados', pasta='live-calc', cat='moda', pal='CALÇADO', tipo='uma loja de calçados', dias=['2026-11-10', '2026-11-17', '2026-11-24'],
      gancho='Tênis na foto não mostra a sola. Na live, mostra.',
      corpo='a loja vira o tênis na frente da cliente, mostra a sola e a costura de perto e responde no chat se tem o 37 e se a forma é pequena',
      emoji='👟'),
 dict(r='cosmeticos', pasta='live-cosm', cat='beleza', pal='COSMÉTICO', tipo='uma loja de cosméticos', dias=['2026-11-12', '2026-11-19', '2026-11-26'],
      gancho='Cosmético na foto não tira dúvida. Na live, tira.',
      corpo='a loja mostra o produto de perto, lê o rótulo junto com a cliente e responde no chat para que tipo de pele serve e como usar',
      emoji='💄'),
 dict(r='pet', pasta='live-pet', cat='pet', pal='PETSHOP', tipo='um pet shop', dias=['2026-11-13', '2026-11-20', '2026-11-27'],
      gancho='Na foto, ninguém sabe se o peitoral serve. Na live, a loja mostra.',
      corpo='a loja mostra o peitoral de perto, a costura e o tamanho, e responde no chat se serve no cachorro da cliente',
      emoji='🐶'),
 dict(r='acai', pasta='live-acai', cat='alimentacao', pal='AÇAÍ', tipo='uma loja de açaí', dias=['2026-11-09', '2026-11-16', '2026-11-23'],
      gancho='Açaí na foto não mostra o creme. Na live, dá água na boca.',
      corpo='a loja mostra o copo montado na frente do cliente e responde no chat se dá para trocar o morango e se entrega no bairro',
      emoji='🍧'),
 dict(r='confeitaria', pasta='live-conf', cat='alimentacao', pal='BOLO', tipo='uma confeitaria', dias=['2026-11-11', '2026-11-18', '2026-11-25'],
      gancho='Bolo na foto não mostra as camadas. Na live, mostra.',
      corpo='a confeitaria mostra o bolo de pote de perto, as camadas e o recheio, e responde no chat que sabores tem e se entrega hoje',
      emoji='🎂'),
]
ENTERPRISE = 'Pagamento com Pix e oferta relâmpago com contagem dentro da transmissão: recursos do plano Enterprise. Cena ilustrativa, loja de exemplo.'

def legenda_material(k):
    return ('#publi ' + k['gancho'] + '\n\nCom o Moviki, ' + k['tipo'] + ' entra ao vivo pelo próprio celular, sem precisar de seguidores: '
            'a cliente entra pelo link, sem baixar nada, e ' + k['corpo'] + '. Compra com um toque, e do lado da loja o pedido chega na tela. '
            'E fora da live, a página da loja com catálogo, sacola, entrega ou reserva, e o mapa em tempo real.\n\n' + ENTERPRISE +
            '\n\n30 dias grátis. Sem cartão, sem fidelidade — você só continua se fizer sentido.\nComece pelo meu link: {link}')

def legenda_grade(k):
    return (k['gancho'].split('. ')[0] + '. ' + k['emoji'] + '\n\nNa live, ' + k['corpo'] + '. Sem precisar de seguidores: '
            'a cliente entra pelo link, sem baixar nada.\n\nPix e oferta relâmpago dentro da live são do plano Enterprise. '
            'Cena ilustrativa, loja fictícia. Teste grátis de 30 dias, sem cartão.')

def chamada(k):
    return '💬 Comente %s que eu te mando no direct a live de %s funcionando.' % (k['pal'], k['tipo'])
