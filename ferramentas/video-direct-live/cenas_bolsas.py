# Cenas da página da loja no vídeo do direct "live primeiro" — bolsas (Jacarandá Bolsas), 05/11/2026.
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
CENAS = [c1, c2]
