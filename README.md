# gnu_10team_cho — 화학 논문 글쓰기 진단용 기준선(공동연구)

화학 연구논문의 절(서론·실험·결과·논의·결론)마다 **헷지(완곡 표현), 강조 표현, 선행연구 보고동사, 동사**가 1,000단어당 몇 번 나오는지 세어, 분야별 **기준선(중간값과 범위)**을 만들고 새 원고를 그 기준선과 견주어 **진단**하기 위한 코드와 기준선 자료입니다.

*Code (section-verb-hedge-baseline 0.4.8) and baseline data (ACS 2020–2021 CC BY, 80 papers) for diagnosing chemistry research-article drafts against field baselines of hedges, boosters, reporting verbs and verbs per 1,000 words, section by section.*

- 경상국립대학교 10팀(AI 교수법 연구회) 공동연구 자료
- 기준선 자료·검증: 조은정
- 진단 웹 화면(gnu_10team)과 추출·집계 수정(+gnu.2): 박용규 튜터

## 들어 있는 것
| 폴더 | 내용 |
|---|---|
| `scripts/` | 기준선 계산 코드 **section-verb-hedge-baseline 0.4.8** (pdf-extract-0.4.8, hedge-baseline-0.4.5) |
| `baselines/acs_80/` | ACS 4개 학술지 2020–2021 CC BY 연구논문 80편의 기준선 숫자. 품질 점검을 통과한 67편으로 계산 |
| `baselines/acs_80/paper_list.csv` | 80편 목록(DOI·제목·라이선스·품질 점검 결과) |
| `docs/` | 사용법, 기준선 설명서, 재현 검증 보고, 헷지·강조 목록 |

**들어 있지 않은 것**: 논문 PDF, 추출된 본문, 근거 문장(`evidence.csv`) 등 논문 문장이 담긴 파일. 분석할 PDF는 각자 정당한 경로(위 DOI)로 받아 쓰세요.

## 기준선 요약
| 분야(학술지) | 논문 | 기준선에 들어간 논문 |
|---|---|---|
| 재료 · Chemistry of Materials (CM) | 20 | 18 |
| 무기 · Inorganic Chemistry (IC) | 20 | 17 |
| 유기 · J. Org. Chem. (JOC) | 20 | 15 |
| 물리·재료 · J. Phys. Chem. C (JPC_C) | 20 | 17 |

값은 **중간값과 최솟값–최댓값**입니다. 분야당 15–18편이라 경향을 보는 **예비 기준**이며, 점수가 아닙니다. 자세한 내용은 [docs/기준선_설명서.md](docs/기준선_설명서.md).

## 재현성
이 코드(0.4.8)와 poppler로 같은 80편을 다시 계산하면, gnu_10team 진단 사이트의 기준선(`baselines_acs2021`)과 **같은 67편이 통과하고 논문별·절별 수치와 중간값 72개가 모두 같습니다.** → [docs/0단계_재현_보고.md](docs/0단계_재현_보고.md)

## 빠른 시작
```
python -m pip install -r requirements.txt
python scripts/run_stage1.py <PDF 폴더> <출력 폴더> --max-papers 20
```
poppler의 pdftotext가 PATH에 있어야 합니다(xpdf면 멈춥니다). 자세한 안내는 [docs/사용법.md](docs/사용법.md).

## 라이선스와 출처
- 코드·기준선 숫자·문서: [CC BY 4.0](LICENSE). 사용할 때 이 저장소와 기여자(조은정, 박용규)를 밝혀 주세요.
- 0.4.8의 추출·집계 수정(+gnu.2)은 박용규 튜터가 gnu_10team 프로젝트에서 만든 것을 반영했습니다(`scripts/prose_filters.py` 포함).
- 기준선 논문은 모두 CC BY(이용 허락)로 공개된 ACS 논문입니다. 원문 출처는 `paper_list.csv`의 DOI.
- 헷지·강조 목록은 Hyland (2005) *Metadiscourse* 부록을 따릅니다([docs/hedge_lexicon.md](docs/hedge_lexicon.md)).
