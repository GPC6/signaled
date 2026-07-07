import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

function assertContainsAll(source, values, label) {
  for (const value of values) {
    assert.ok(source.includes(value), `${label} should include ${value}`);
  }
}

function assertCoreFilesDoNotLinkTo(paths, bannedLinks) {
  for (const path of paths) {
    const source = read(path);
    for (const banned of bannedLinks) {
      assert.ok(!source.includes(banned), `${path} should not link to ${banned}`);
    }
  }
}

const coreFiles = [
  'components.js',
  'index.html',
  'signal-edu/index.html',
  'consulting/index.html',
  'ai-connects/index.html',
  'partnerships/index.html',
  'stories/index.html',
  'news-contact/index.html',
];

test('shared navigation uses six core pages with in-page section links', () => {
  const components = read('components.js');

  assertContainsAll(components, [
    '시그널에듀',
    '컨설팅 프로그램',
    'AI 커넥츠',
    '학교·기관 연계',
    '포트폴리오',
    '상담·소식',
    'signal-edu/#intro',
    'signal-edu/#philosophy',
    'signal-edu/#consultants',
    'signal-edu/#location',
    'consulting/#career',
    'consulting/#pathway',
    'consulting/#admission',
    'consulting/#coaching',
    'ai-connects/#overview',
    'ai-connects/#middle-score',
    'ai-connects/#student-record',
    'ai-connects/#literacy',
    'ai-connects/#student-analysis',
    'partnerships/#school-program',
    'partnerships/#institution-program',
    'partnerships/#parent-lecture',
    'partnerships/#event-operation',
    'partnerships/#partnership-inquiry',
    'stories/#acceptance-news',
    'stories/#activity-gallery',
    'news-contact/#notice',
    'news-contact/#consultation',
    'news-contact/#location',
  ], 'components.js');
});

test('core public pages avoid legacy detail-page links', () => {
  assertCoreFilesDoNotLinkTo(coreFiles, [
    'consulting/career-design.html',
    'consulting/pathway-design.html',
    'consulting/admission-strategy.html',
    'consulting/learning-coaching.html',
    'href="career-design.html"',
    'href="pathway-design.html"',
    'href="admission-strategy.html"',
    'href="learning-coaching.html"',
    'ai-connects/middle-score.html',
    'ai-connects/student-record.html',
    'ai-connects/literacy-dictionary.html',
    'ai-connects/student-analysis.html',
    'href="./middle-score.html"',
    'href="./student-record.html"',
    'href="./literacy-dictionary.html"',
    'href="./student-analysis.html"',
  ]);
});

test('main page has six carousel entries and six core summary links', () => {
  const home = read('index.html');
  const carouselCount = (home.match(/<(?:a|article) class="arte-card(?:\s|")/g) || []).length;

  assert.equal(carouselCount, 6);
  assert.ok(home.includes('id="corePages"'), 'home should expose a six-page summary section');
  assert.ok(home.includes('id="arteTotal">06</span>'), 'carousel total should be six');
  assert.ok(!home.includes('images/placeholder.svg'), 'home should not render placeholder images');

  assertContainsAll(home, [
    'href="signal-edu/"',
    'href="consulting/"',
    'href="ai-connects/"',
    'href="partnerships/"',
    'href="stories/"',
    'href="news-contact/"',
  ], 'index.html');
});

test('six core pages expose the required in-page sections', () => {
  const expectations = {
    'signal-edu/index.html': ['id="intro"', 'id="philosophy"', 'id="consultants"', 'id="location"'],
    'consulting/index.html': ['id="career"', 'id="pathway"', 'id="admission"', 'id="coaching"'],
    'ai-connects/index.html': ['id="overview"', 'id="middle-score"', 'id="student-record"', 'id="literacy"', 'id="student-analysis"'],
    'partnerships/index.html': ['id="school-program"', 'id="institution-program"', 'id="parent-lecture"', 'id="event-operation"', 'id="partnership-inquiry"'],
    'stories/index.html': ['id="acceptance-news"', 'id="activity-gallery"'],
    'news-contact/index.html': ['id="notice"', 'id="consultation"', 'id="location"'],
  };

  for (const [path, ids] of Object.entries(expectations)) {
    assertContainsAll(read(path), ids, path);
  }
});
