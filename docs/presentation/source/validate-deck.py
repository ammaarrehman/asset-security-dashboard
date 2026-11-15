"""Validate the generated capstone package independently of PptxGenJS (stdlib only)."""
import argparse
import hashlib
import json
import posixpath
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

P = 'http://schemas.openxmlformats.org/presentationml/2006/main'
A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS = {'p': P, 'a': A}


def normalized(value):
    return ' '.join(value.replace('’', "'").split())


def validate(deck, kit):
    cues = json.loads((kit / 'source/demo-cues.json').read_text())
    guide = (kit / 'Presenter_Guide_v2.md').read_text()
    video = (kit / 'media/Demo_Recording.mp4').read_bytes()
    assert hashlib.sha256(video).hexdigest() == cues['videoSha256'], 'Video changed; reinspect cue times'
    cue_rows = []
    for line in guide.splitlines():
        if re.match(r'^\| \d+:\d{2} \|', line):
            cells = [cell.strip().strip('"') for cell in line.strip('|').split('|')]
            cue_rows.append(dict(zip(['time', 'screen', 'say'], cells)))
    assert cue_rows == cues['cues'], 'Presenter guide cue table differs from demo-cues.json'

    with zipfile.ZipFile(deck) as archive:
        assert archive.testzip() is None, 'ZIP integrity failure'
        names = set(archive.namelist())
        slides = sorted(n for n in names if re.fullmatch(r'ppt/slides/slide\d+\.xml', n))
        assert len(slides) == 6, f'Expected six slides, got {len(slides)}'
        roots = {}
        relation_count = 0
        for name in sorted(names):
            if not name.endswith(('.xml', '.rels')):
                continue
            raw = archive.read(name)
            roots[name] = ET.fromstring(raw)
            assert b'/Users/' not in raw and b'file://' not in raw, f'Local path metadata: {name}'
            ids = set()
            for element in roots[name].iter(f'{{{P}}}cNvPr'):
                drawing_id = element.attrib['id']
                assert drawing_id not in ids, f'{name}: duplicate non-visual drawing ID {drawing_id}'
                ids.add(drawing_id)
            if name.endswith('.rels'):
                relationship_ids = set()
                for rel in roots[name]:
                    assert rel.attrib.get('TargetMode') != 'External', f'External dependency: {name}'
                    assert rel.attrib['Id'] not in relationship_ids, f'Duplicate relationship: {name}'
                    relationship_ids.add(rel.attrib['Id'])
                    target = rel.attrib['Target']
                    folder = posixpath.dirname(posixpath.dirname(name))
                    resolved = posixpath.normpath(posixpath.join(folder, target)) if not target.startswith('/') else target[1:]
                    assert resolved in names, f'Broken relationship: {name} -> {target}'
                    relation_count += 1
        # Check the actual references, not just whether the .rels targets exist.
        for name, root in roots.items():
            if not name.endswith('.xml'):
                continue
            folder, filename = posixpath.split(name)
            rel_name = posixpath.join(folder, '_rels', filename + '.rels')
            known = {r.attrib['Id'] for r in roots.get(rel_name, [])}
            for element in root.iter():
                for attribute, value in element.attrib.items():
                    if attribute.startswith('{' + R + '}') and value:
                        assert value in known, f'Unresolved reference {value} in {name}'
        for index in range(1, 7):
            root = roots[f'ppt/slides/slide{index}.xml']
            note = roots[f'ppt/notesSlides/notesSlide{index}.xml']
            notes = '\n'.join(t.text or '' for t in note.iter(f'{{{A}}}t'))
            speech = notes.split('SAY (the text on the slide):\n')[1].split('\n\nPOINT AT:')[0]
            script = next(sp for sp in root.findall('.//p:sp', NS)
                          if sp.find('.//p:cNvPr', NS).attrib.get('name') == 'Read-aloud text')
            slide_speech = ' '.join(t.text or '' for t in script.iter(f'{{{A}}}t'))
            assert normalized(speech) == normalized(slide_speech), f'Slide {index}: notes differ from visible speech'
            if index == 5:
                for cue in cues['cues']:
                    assert f"{cue['time']} {cue['screen']}: {cue['say']}" in notes, f"Notes omit cue {cue['time']}"
        embedded = [n for n in names if n.startswith('ppt/media/') and n.endswith('.mp4')]
        assert len(embedded) == 1, f'Expected one embedded video, got {len(embedded)}'
        assert archive.read(embedded[0]) == video, 'Embedded video differs from standalone recording'
    return {'status': 'passed', 'slides': 6, 'relationships': relation_count,
            'notesMatchSlides': True, 'cueRowsMatch': len(cue_rows),
            'drawingIdsUnique': True, 'embeddedVideoMatches': True,
            'videoSha256': cues['videoSha256'], 'deckSha256': hashlib.sha256(deck.read_bytes()).hexdigest()}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('deck', nargs='?', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    kit_path = Path(__file__).resolve().parent.parent
    result = validate(args.deck or kit_path / 'Asset_Security_Dashboard_CRC_Capstone_v2.pptx', kit_path)
    output = json.dumps(result, indent=2) + '\n'
    if args.report:
        args.report.write_text(output)
    print(output, end='')
