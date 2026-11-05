# Cenas da página da loja no vídeo do direct "live primeiro" (05/11/2026), servem para qualquer ramo:
# c1 topo + catálogo, c2 sacola/entrega ou reserva/Pix, c3 mapa em tempo real (pedido do Paulo 05/11 01:54).
import asyncio
S = asyncio.sleep; Q = 'document.querySelector'
async def c1(r):  # página da loja: topo e catálogo com foto
    await S(0.35); await r.realce(Q + "('.logoWrap')", 900); await S(0.7)
    await r.tocar(Q + "('#btnCat')", 'abrirCardapio()'); await S(0.5)
    await r.tocar(Q + "('#folhaCardapio .catCard')", 'abrirCategoria(0)'); await S(0.45)
    await r.realce(Q + "('#folhaCardapio .itemPub')", 1400)
async def c2(r):  # cor, sacola, entrega ou reserva, Pix
    await r.tocar(Q + "('#folhaCardapio .itemPub .addBtn')"); await S(0.35)
    await r.tocar("document.querySelectorAll('#mvVarFolha .mvVarOp')[0]"); await S(0.25)
    await r.tocar(Q + "('#mvVarFolha .mvVarOk')"); await S(0.35)
    await r.some(); await r.realce(Q + "('#sacolaBar')", 900); await S(0.6)
    await r.tocar(Q + "('#sacolaBar .sIr')", 'abrirPedido()'); await S(0.35)
    await r.ev("mvEntrega('retirada')"); await S(0.2)
    await r.rolar(Q + "('#pdPagBox')", 'center', 500)
    await r.realce(Q + "('#pdPagBox')", 1400); await S(0.8)
    await r.tocar(Q + "('#pdPagRes')", "mvPagamento('reserva')")
async def c3(r):  # mapa: a loja aparece em tempo real para quem está perto
    await r.some()
    await r.ev("try{fecharPedido()}catch(e){}; try{fecharFolha('folhaCardapio')}catch(e){}; const f=document.getElementById('mvVarFolha'); if(f) f.classList.remove('on');"); await S(0.3)
    await r.tocar(Q + "('#tabbar [data-tb=mapa]')", "acaoTab('mapa')"); await S(1.1)
    await r.realce(Q + "('#secOnde .ondeBox')", 1500); await S(1.2)
    await r.tocar(Q + "('#secOnde .mapAbrir')", 'abrirMapaCheio()'); await S(0.6)
CENAS = [c1, c2, c3]
