#!/usr/bin/env python3
"""PSNR between the last frame before a cut and the first frame after it.

usage: cut_psnr.py <recording> <aEnd:bStart> [<aEnd:bStart> ...]
Frames are compared at 756px wide. >= 35 dB reads as continuous; inf is ideal.
"""
import re
import subprocess
import sys

rec, joins = sys.argv[1], sys.argv[2:]
for j in joins:
    a, b = (float(x) for x in j.split(":"))
    t1 = round(a - 1 / 30, 3)  # last frame shown from the earlier shot
    cmd = [
        "ffmpeg", "-v", "info", "-ss", str(t1), "-i", rec, "-ss", str(b), "-i", rec,
        "-frames:v", "1", "-lavfi", "[0:v]scale=756:-1[a];[1:v]scale=756:-1[b];[a][b]psnr",
        "-f", "null", "-",
    ]
    out = subprocess.run(cmd, capture_output=True, text=True).stderr
    m = re.search(r"average:([\d.]+|inf)", out)
    print(f"{a:8.2f} -> {b:8.2f}  psnr={m.group(1) if m else '?'}")
