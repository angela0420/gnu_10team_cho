# 논문 글쓰기 진단 MVP (Manuscript diagnosis)

원고의 절(서론, 실험·방법, 결과·논의, 결론)마다 동사·헷지·부스터·보고동사를 세어 분야 기준선(0.4.9)과 나란히 보여 주는 화면입니다. 숫자와 기준선 용어마다 ⓘ 단추를 누르면 영·한 설명이 열립니다(EN · 한 / EN / 한 전환).

## 구성
- `app/analyzer.py`: 세는 규칙은 `vendor/`의 원본 스크립트를 그대로 씁니다(section-verb-hedge-baseline: hedge-baseline-0.4.5, prose_filters, engine_local, rvtool; 동사 쓰임 규칙 v0.2).
- `app/main.py`: FastAPI. `/`(화면), `/api/baselines`, `/api/explanations`, `/api/diagnose`.
- `data/baselines.json`, `data/verbs.json`: `build_data.py`가 `기준선_0.4.9`에서 만듭니다. RES·DIS는 RD로 묶고, 사분위수는 포함 방식입니다.
- `data/explanations.json`: 화면 설명(영·한). **문구는 이 파일만 고치면 됩니다**(화면을 새로 고칠 때 반영됨).
- `static/index.html`: 화면 한 장.

## 실행(로컬)
```
python build_data.py "<화학과 AI>/기준선_0.4.9"
python -m uvicorn main:app --app-dir app --port 8020
```
필요한 것: Python 3.12, `requirements.txt`, spaCy 모델 en_core_web_sm 3.8.0.

## 확인한 것(2026-11-09)
- 기준선 논문 1편(acs.jpcc.0c01724)을 절별로 넣어 보니 단어 수·동사 수는 네 절 모두 같고, 결과·논의에서 헷지와 보고동사가 각각 1개 다릅니다. 붙여 넣은 글에서 문장 경계를 다시 찾기 때문입니다.
- 원고 글은 저장하지 않습니다.

## 2026-11-09 추가
- 동사 목록은 **술어 기반 층**으로 판정합니다(`기준선_0.4.9/동사층/verb_usage_table.csv`, `verb_layers_pred.json`, 만든 스크립트 `검증_0단계_재현/build_verb_usage.py`). 기준선 총계는 그대로입니다.
- 술어보다 수식어·비정형으로 더 많이 쓴 동사는 따로 표로 보여 줍니다.
- 쓰임 규칙 v0.3: *the pristine and doped samples*처럼 and로 이어진 수식 분사는 앞 수식어의 쓰임을 따릅니다.
- "PDF로 저장" 단추(브라우저 인쇄 → PDF로 저장). 열어 둔 설명과 용례도 함께 들어갑니다.

- **내 글 살펴보기**(교수님 결정, 2026-11-09): 기준선 논문 KWIC 대신, 입력한 글(본인·학생·외부 검증용 논문)만으로 어휘 목록(품사·절 고르기)과 KWIC(기본형/그대로, 오른쪽·왼쪽 낱말 정렬)를 보여 줍니다. 기준선 논문 문장은 화면에 나오지 않습니다.

## 아직 아님
- 배포(새 Render 서비스, gnu_10team_cho 저장소)는 교수님 승인 뒤.
- 쓰임 규칙은 샘플 2(사람 판정 60문장)로 검증하는 중입니다.
