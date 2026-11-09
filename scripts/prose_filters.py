"""Local counting correction: publication dates are metadata, symbols are not verbs."""
import re

VERSION = 'publication-metadata-1'
MONTH = r'(?:January|February|March|April|May|June|July|August|September|October|November|December)'
DATE = rf'(?:{MONTH}\s+\d{{1,2}},?\s+\d{{4}}|\d{{1,2}}[/.-]\d{{1,2}}[/.-]\d{{4}}|\d{{4}}[-/]\d{{1,2}}[-/]\d{{1,2}})'
PUBLICATION_DATE = re.compile(
    rf'\b(?P<label>Received|Revised(?:\s+Manuscript\s+Received)?|Accepted|Published(?:\s+(?:on\s+(?:the\s+)?Web|Online|ASAP))?)\s*:?\s*(?P<date>{DATE})\b')


def strip_publication_metadata(text):
    """Remove exact label/date spans, retaining scientific text on either side."""
    cleaned = []
    removed = []
    for line_number, line in enumerate(text.splitlines(), 1):
        before = len(removed)
        def remove(match):
            removed.append(dict(line=line_number, text=match.group(), label=match['label'], reason='publication_date'))
            return ''
        line = PUBLICATION_DATE.sub(remove, line)
        if len(removed) > before and not re.search(r'\w', line):
            line = ''
        cleaned.append(line.rstrip())
    return '\n'.join(cleaned), removed


def is_lexical_verb(token):
    lemma = token.lemma_.lower()
    return token.pos_ == 'VERB' and token.is_alpha and lemma.isalpha() and len(lemma) > 1
