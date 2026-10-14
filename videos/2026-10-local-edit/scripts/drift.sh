#!/bin/bash
# 用法: scripts/drift.sh <原图> <结果图...>
# 把每张结果缩放到 1440x1080，统计脸以外三块区域（左墙 / 右墙 / 下半身花束）的平均亮度，
# 与原图比较，输出 |ΔY| 之和。数值越小越稳；> 4.5 视为“光影变了”，需要重生成。
set -e
orig="$1"; shift
tmp=$(mktemp -d)
norm() { ffmpeg -v error -y -i "$1" -vf "scale=1440:1080:force_original_aspect_ratio=decrease,pad=1440:1080:(ow-iw)/2:(oh-ih)/2:black" "$2"; }
yavg() { ffmpeg -v error -i "$1" -vf "crop=$2,scale=64:48,format=yuv444p,signalstats,metadata=print:file=-" -f null - 2>/dev/null | awk -F= '/YAVG/{print $2}' | head -1; }
norm "$orig" $tmp/o.png
regions=("360:700:0:0" "360:700:1080:0" "1440:420:0:660")
for r in "${regions[@]}"; do o[${#o[@]}]=$(yavg $tmp/o.png $r); done
for f in "$@"; do
  norm "$f" $tmp/x.png
  s=0
  for i in 0 1 2; do v=$(yavg $tmp/x.png ${regions[$i]}); s=$(awk -v s=$s -v v=$v -v o=${o[$i]} 'BEGIN{d=v-o; if(d<0)d=-d; print s+d}'); done
  size=$(sips -g pixelWidth -g pixelHeight "$f" | awk '/pixel/{printf $2"x"}' | sed 's/x$//')
  printf "%-40s drift=%.1f  size=%s\n" "$(basename $f)" $s $size
done
rm -rf $tmp
