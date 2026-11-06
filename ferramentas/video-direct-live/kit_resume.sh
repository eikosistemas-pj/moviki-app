#!/bin/bash
# Fila retomável do kit do feed (05/11/2026): a máquina reinicia de tempos em tempos, então cada passo
# confere o que já está pronto (montagem na pasta -feed, carimbo no registro) e faz só o que falta. Um passo por vez.
V=/home/claude/desejo/vozes/chamada; E=/home/claude/entrega/kit; mkdir -p $E
REG=/home/claude/protecao/registro.jsonl
carimbado() { grep -q "\"id\": \"$1\"" $REG; }
faz() {  # pasta ramo PALAVRA voz sub2
  local D=/home/claude/desejo/$1 r=$2; local S=$D-feed/saida
  echo "== $r $(date +%T)"
  if [ ! -f $D-feed/roteiro.json ]; then
    ( cd /home/claude/w/prep && python3 prep_ramo.py $D | tail -n 1 )
    ( cd /home/claude/desejo/motor && python3 variantes.py $D $r "$3" $V/$4 "que eu te mando no direct" "$5" | tail -n 1 )
  fi
  for v in "" "-comente"; do
    local k=reel-$r-ao-vivo$v
    if ! ffprobe -v error -show_entries format=duration -of csv=p=0 $S/$k.mp4 >/dev/null 2>&1 || [ -f $S/.$k.parcial ]; then
      touch $S/.$k.parcial
      ( cd /home/claude/desejo/motor && python3 montar_desejo.py $D-feed ${v:+--comente} | tail -n 1 ) && rm -f $S/.$k.parcial
    fi
  done
  carimbado reel-$r-ao-vivo || ( cd /home/claude/protecao && CARIMBO_BV=1800k python3 carimbar.py $S/reel-$r-ao-vivo.mp4 $E/reel-$r-ao-vivo.mp4 --id reel-$r-ao-vivo --cfg $D-feed/cfg_carimbo.json | tail -n 1 | cut -c1-80 )
  carimbado reel-$r-ao-vivo-comente || ( cd /home/claude/protecao && CARIMBO_BV=1700k python3 carimbar.py $S/reel-$r-ao-vivo-comente.mp4 $E/reel-$r-ao-vivo-comente.mp4 --id reel-$r-ao-vivo-comente --cfg $D-feed/cfg_carimbo.json | tail -n 1 | cut -c1-80 )
  echo "ok $r $(date +%T)"
}
faz live-semi semijoias SEMIJOIA semi.mp3 "a live de uma loja de semijoias"
faz live-acai acai "AÇAÍ" acai.mp3 "a live de uma loja de açaí"
faz live-calc calcados "CALÇADO" calc.mp3 "a live de uma loja de calçados"
faz live-cosm cosmeticos "COSMÉTICO" cosm.mp3 "a live de uma loja de cosméticos"
faz live-pet pet PETSHOP pet.mp3 "a live de um pet shop"
echo "TUDO $(date +%T)"
