"""논문 글쓰기 진단: 절별 원고 글을 받아 기준선과 비교한다. 설명은 data/explanations.json(영·한)."""
import json, os
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from analyzer import diagnose, BASE, ROOT, VERBS

app = FastAPI(title='논문 글쓰기 진단')
STATIC = os.path.join(ROOT, 'static')
EXPLAIN = os.path.join(ROOT, 'data', 'explanations.json')
MAX_CHARS = 60000   # 한 절에 이보다 긴 글은 받지 않는다(서버 메모리 보호)


class Req(BaseModel):
    baseline: str
    sections: dict


@app.get('/api/health')
def health():
    return {'ok': True}


@app.get('/api/baselines')
def baselines():
    return {k: dict(en=v['en'], ko=v['ko'], papers=v['papers'], reference_only=v['reference_only'], paper_list=v.get('paper_list', []))
            for k, v in BASE['baselines'].items() if not v.get('hidden')}


@app.get('/api/common_verbs')
def common_verbs():
    """절별 '네 저널 공통' 동사(술어 기반 층 genre_wide)와 저널별 근거(술어로 쓴 논문 수 / 그 절이 있는 논문 수). 분류 데이터에서 그대로 읽는다."""
    acs = ['ACS_CM', 'ACS_IC', 'ACS_JOC', 'ACS_JPC_C']
    out = {}
    for sec in ('INT', 'MET', 'RD', 'CON'):
        verbs = VERBS['layers_pred'].get(sec, {}).get('genre_wide', [])
        out[sec] = [dict(verb=v, journals={b: dict(papers=VERBS['pred'][b][sec][v]['papers'], n=VERBS['pred'][b][sec][v]['n']) for b in acs}) for v in verbs]
    return dict(rule='each of the four ACS sets: predicate use in at least half of the papers that have the section', usage_rules=VERBS.get('usage_rules', ''), sections=out)


@app.get('/api/explanations')
def explanations():
    return json.load(open(EXPLAIN, encoding='utf-8'))   # 고친 설명이 서버 재시작 없이 반영되도록 매번 읽는다


@app.post('/api/diagnose')
def run(req: Req):
    if req.baseline not in BASE['baselines']: raise HTTPException(400, 'unknown baseline')
    secs = {k: str(v) for k, v in req.sections.items() if k in ('INT', 'MET', 'RD', 'CON') and str(v).strip()}
    if not secs: raise HTTPException(400, 'no text')
    if any(len(v) > MAX_CHARS for v in secs.values()): raise HTTPException(413, 'section too long')
    return diagnose(secs, req.baseline)


@app.get('/')
def portal():
    return FileResponse(os.path.join(STATIC, 'portal.html'))   # 교육 포털(입구)


@app.get('/why')
@app.get('/background')
def portal_reading():
    return FileResponse(os.path.join(STATIC, 'portal.html'))   # 읽을거리 두 편(같은 화면, 주소로 구분: 2026-11-11 묶음 1)


@app.get('/diagnose')
def index():
    return FileResponse(os.path.join(STATIC, 'index.html'))    # 원고 입력·분석 작업 화면


app.mount('/static', StaticFiles(directory=STATIC), name='static')
