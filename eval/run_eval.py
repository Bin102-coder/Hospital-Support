import csv
import json
import os
import sys

BACKEND_DIR = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, BACKEND_DIR)

env_path = os.path.join(BACKEND_DIR, ".env")
if os.path.exists(env_path):
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

from ai import goi_y_tu_ai
from schemas import YeuCau

BASE = os.path.dirname(__file__)
with open(os.path.join(BASE, "cases.json"), encoding="utf-8") as f:
    cases = json.load(f)

if not os.getenv("GEMINI_API_KEY"):
    print("CANH BAO: Chua co GEMINI_API_KEY. Ket qua se rong. Hay tao backend/.env voi GEMINI_API_KEY=...")

rows = []
dat = 0
for c in cases:
    yeu_cau = YeuCau(
        ly_do_kham=c["ly_do_kham"],
        trieu_chung=c.get("trieu_chung", []),
        thoi_gian=c.get("thoi_gian"),
        muc_do=c.get("muc_do"),
        tien_su=c.get("tien_su"),
        thuoc_dang_dung=c.get("thuoc_dang_dung"),
        di_ung=c.get("di_ung"),
        loi_benh_nhan=c["loi_benh_nhan"],
    )
    kq = goi_y_tu_ai(yeu_cau)
    if kq is None:
        ban_tom_tat = ""
        goi_y = []
    else:
        ban_tom_tat = kq.ban_tom_tat
        goi_y = [g.model_dump() for g in kq.goi_y_can_nhac]

    du_thong_tin = bool(ban_tom_tat) and len(goi_y) >= 3

    dap_an = [a.lower() for a in c.get("dap_an_mau", [])]
    goi_y_text = " ".join(g["ten"] + " " + g["ly_do"] for g in goi_y).lower()
    trong_top = any(a in goi_y_text for a in dap_an) if dap_an else False
    if trong_top:
        dat += 1

    rows.append({
        "case_id": c["id"],
        "co_du_thong_tin": "TRUE" if du_thong_tin else "FALSE",
        "bia_them_trieu_chung": "",
        "dap_an_trong_top": "TRUE" if trong_top else "FALSE",
        "goi_y": " | ".join(g["ten"] for g in goi_y),
        "dap_an_mau": " | ".join(c.get("dap_an_mau", [])),
        "ban_tom_tat": ban_tom_tat,
    })

print(f"{'case_id':10}{'du_tt':8}{'top':8}")
for r in rows:
    print(f"{r['case_id']:10}{r['co_du_thong_tin']:8}{r['dap_an_trong_top']:8}")

n = len(rows)
print(f"\n% dat (dap an mau trong top 3-5 goi y): {dat}/{n} = {dat / n * 100:.1f}%")

out = os.path.join(BASE, "results.csv")
with open(out, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
print("Da xuat:", out)