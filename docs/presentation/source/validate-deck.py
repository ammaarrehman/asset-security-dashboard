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
    video = (kit / cues['videoPath']).read_bytes()
    story = json.loads((kit / 'source/presentation-story.json').read_text())
    prepared = json.loads((kit / 'source/prepared-notes.json').read_text())['slides']
    assert [note['slide'] for note in prepared] == list(range(1, 7))
    prepared_guide = (kit / 'Prepared_Speaker_Notes.md').read_text()
    link_targets = {
        'https://ammaarrehman.github.io/asset-security-dashboard/',
        'https://github.com/ammaarrehman/asset-security-dashboard',
    }
    assert sum(slide['durationSeconds'] for slide in story['slides']) == story['targetDurationSeconds']
    assert 200 <= story['targetDurationSeconds'] <= 240, 'Presentation timing outside target'
    assert story['slides'][4]['durationSeconds'] == cues['durationSeconds'] + 6
    assert hashlib.sha256((kit / cues['archivePath']).read_bytes()).hexdigest() == cues['archiveSha256'], 'Original archive changed'
    assert cues['durationSeconds'] == 73
    natural_script = (kit / 'story-review/Natural_Script.md').read_text()
    assert hashlib.sha256(video).hexdigest() == cues['videoSha256'], 'Video changed; reinspect cue times'
    cue_rows = []
    for line in guide.splitlines():
        if re.match(r'^\| \d+:\d{2} \|', line):
            cells = [cell.strip().strip('"') for cell in line.strip('|').split('|')]
            cue_rows.append(dict(zip(['time', 'screen', 'say'], cells)))
    assert cue_rows == cues['cues'], 'Presenter guide cue table differs from demo-cues.json'
    script_cues = []
    for line in natural_script.splitlines():
        if re.match(r'^\| \d+:\d{2} \|', line):
            cells = [cell.strip().strip(chr(34)) for cell in line.strip('|').split('|')]
            script_cues.append(dict(zip(['time', 'screen', 'say'], cells)))
    assert script_cues == cues['cues'], 'Natural script cue table differs from demo-cues.json'

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
                    assert rel.attrib['Id'] not in relationship_ids, f'Duplicate relationship: {name}'
                    relationship_ids.add(rel.attrib['Id'])
                    if rel.attrib.get('TargetMode') == 'External':
                        assert name == 'ppt/slides/_rels/slide6.xml.rels', f'External dependency: {name}'
                        assert rel.attrib['Type'] == R + '/hyperlink', f'External media dependency: {name}'
                        assert rel.attrib['Target'] in link_targets, 'Unexpected hyperlink destination'
                        relation_count += 1
                        continue
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
        elapsed = 0
        for index in range(1, 7):
            root = roots[f'ppt/slides/slide{index}.xml']
            note = roots[f'ppt/notesSlides/notesSlide{index}.xml']
            body = next(sp for sp in note.findall('.//p:sp', NS) if sp.find('.//p:ph', NS).attrib.get('type') == 'body')
            notes = ''.join(t.text or '' for t in body.iter(f'{{{A}}}t'))
            assert notes == prepared[index - 1]['notes'], f'Slide {index}: prepared notes changed'
            assert prepared[index - 1]['notes'] in prepared_guide, f'Slide {index}: prepared guide differs'
            script = next(sp for sp in root.findall('.//p:sp', NS)
                          if sp.find('.//p:cNvPr', NS).attrib.get('name') == 'Read-aloud text')
            slide_speech = ' '.join(t.text or '' for t in script.iter(f'{{{A}}}t'))
            expected_speech = ' '.join(story['slides'][index - 1]['say'])
            assert normalized(slide_speech) == normalized(expected_speech), f'Slide {index}: differs from story source'
            guide_section = guide.split(f'## Slide {index}:', 1)[1].split('\n## ', 1)[0]
            guide_speech = ' '.join(line[2:] for line in guide_section.splitlines() if line.startswith('> '))
            assert normalized(guide_speech) == normalized(expected_speech), f'Slide {index}: guide speech differs'
            assert normalized(expected_speech) in normalized(natural_script), f'Slide {index}: script differs'
            duration = story['slides'][index - 1]['durationSeconds']
            clock = lambda n: f'{n // 60}:{n % 60:02}'
            expected_guide_row = f"| {index}. {story['slides'][index - 1]['title']} | {clock(elapsed)} | {duration} s |"
            assert expected_guide_row in guide, f'Slide {index}: guide timing differs'
            assert f'({clock(elapsed)} to {clock(elapsed + duration)})' in natural_script, f'Slide {index}: script timing differs'
            elapsed += duration
        slide6 = roots['ppt/slides/slide6.xml']
        relations = {r.attrib['Id']: r.attrib for r in roots['ppt/slides/_rels/slide6.xml.rels']}
        linked_text = {}
        for shape in slide6.findall('.//p:sp', NS):
            for link in shape.findall('.//a:hlinkClick', NS):
                target = relations[link.attrib[f'{{{R}}}id']]['Target']
                linked_text.setdefault(target, set()).add(''.join(t.text or '' for t in shape.iter(f'{{{A}}}t')))
        for label, target in [('LIVE DEMO', 'https://ammaarrehman.github.io/asset-security-dashboard/'),
                              ('GITHUB SOURCE', 'https://github.com/ammaarrehman/asset-security-dashboard')]:
            assert {label, target.replace('https://', '')} <= linked_text.get(target, set()), f'Missing clickable {label}'
        embedded = [n for n in names if n.startswith('ppt/media/') and n.endswith('.mp4')]
        assert len(embedded) == 1, f'Expected one embedded video, got {len(embedded)}'
        assert archive.read(embedded[0]) == video, 'Embedded video differs from standalone recording'
    return {'status': 'passed', 'slides': 6, 'relationships': relation_count,
            'preparedNotesMatchVerbatim': True, 'slide6HyperlinksMatch': True,
            'cueRowsMatch': len(cue_rows), 'scriptCueRowsMatch': len(script_cues),
            'drawingIdsUnique': True, 'embeddedVideoMatches': True,
            'videoDurationSeconds': cues['durationSeconds'], 'estimatedPresentationSeconds': story['targetDurationSeconds'],
            'guideSpeechMatches': True, 'scriptSpeechMatches': True, 'archiveUnchanged': True,
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
