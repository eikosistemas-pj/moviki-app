import asyncio, sys
sys.path.insert(0,'/home/claude/w/motor')
from base import *
async def main():
    async with async_playwright() as p:
        br = await navegador(p)
        chat=[(2,'Carla','Tem no M?',  'msg', 20000),(3,'Bia','Que linda essa blusa 😍','msg',12000)]
        ctx,pg,er = await abrirPublica(br, fakeComprador(chat=chat))
        await pg.evaluate('window.__setT(40)'); await asyncio.sleep(0.5)
        await pg.screenshot(path='/home/claude/w/probe/pub.png')
        ids = await pg.evaluate("[...document.querySelectorAll('[id]')].filter(e=>e.offsetParent!==null).map(e=>e.id).join(' ')")
        print('PUB IDS', ids[:3000]); print('erros', er[:5])
        await ctx.close()
        ENSAIO['pode']=True
        ctx,pg,er = await abrirEstudio(br, aoVivo=False)
        await pg.evaluate('window.__setT(40)'); await asyncio.sleep(0.5)
        await pg.screenshot(path='/home/claude/w/probe/est.png')
        ids = await pg.evaluate("[...document.querySelectorAll('[id]')].filter(e=>e.offsetParent!==null).map(e=>e.id).join(' ')")
        print('EST IDS', ids[:3000]); print('erros', er[:5])
        await br.close()
asyncio.run(main())
