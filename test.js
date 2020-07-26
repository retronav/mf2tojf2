import test from 'ava';
import {mf2tojf2} from './index.js';

test('Empty object returns empty object', t => {
  const result = mf2tojf2({});
  t.deepEqual(result, {});
});

test('Empty items array returns empty object', t => {
  const result = mf2tojf2({
    items: []
  });
  t.deepEqual(result, {});
});

test('Empty h-entry returns empty entry', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry']
    }]
  });
  t.deepEqual(result, {
    type: 'entry'
  });
});

test('Returns flattened entry', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        name: ['Simple entry'],
        published: ['2020-07-25'],
        url: ['https://example.com']
      }
    }]
  });
  t.deepEqual(result, {
    type: 'entry',
    name: 'Simple entry',
    published: '2020-07-25',
    url: 'https://example.com'
  });
});

test('Returns single tag as a string', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        name: ['Entry with 1 tag'],
        category: ['tag']
      }
    }]
  });
  t.deepEqual(result, {
    type: 'entry',
    name: 'Entry with 1 tag',
    category: 'tag'
  });
});

test('Returns multiple tags as an array', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        name: ['Entry with tags'],
        category: ['tag', 'tags']
      }
    }]
  });
  t.deepEqual(result, {
    type: 'entry',
    name: 'Entry with tags',
    category: ['tag', 'tags']
  });
});

test('Returns content (HTML and text)', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        name: ['Entry with content'],
        content: [{
          html: '<p><b>This</b> content',
          value: 'This content'
        }]
      }
    }]
  });
  t.deepEqual(result, {
    type: 'entry',
    name: 'Entry with content',
    content: {
      html: '<p><b>This</b> content',
      text: 'This content'
    }
  });
});

test('Returns content (HTML only)', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        name: ['Entry with content'],
        content: [{
          html: '<p><b>This</b> content'
        }]
      }
    }]
  });
  t.deepEqual(result, {
    type: 'entry',
    name: 'Entry with content',
    content: {
      html: '<p><b>This</b> content'
    }
  });
});

test('Returns media', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        name: ['Entry with photos'],
        photo: [{
          alt: 'First photo',
          value: 'https://example.com/photo1.jpg'
        }, {
          alt: 'Second photo',
          value: 'https://example.com/photo2.jpg'
        }]
      }
    }]
  });
  t.deepEqual(result, {
    type: 'entry',
    name: 'Entry with photos',
    photo: [{
      alt: 'First photo',
      value: 'https://example.com/photo1.jpg'
    }, {
      alt: 'Second photo',
      value: 'https://example.com/photo2.jpg'
    }]
  });
});

test('Returns author from simple value', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        name: ['Entry with author'],
        author: ['Jane Doe']
      }
    }]
  });
  t.deepEqual(result, {
    type: 'entry',
    name: 'Entry with author',
    author: 'Jane Doe'
  });
});

test('Returns author from nested value', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        name: ['Entry with nested author'],
        author: [{
          type: ['h-card'],
          properties: {
            name: ['Joe Bloggs']
          }
        }]
      }
    }]
  });
  t.deepEqual(result, {
    type: 'entry',
    name: 'Entry with nested author',
    author: {
      type: 'card',
      name: 'Joe Bloggs'
    }
  });
});

test('Returns child entry from feed', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-feed'],
      properties: {
        author: [{
          type: ['h-card'],
          properties: {
            name: ['John Bull']
          }
        }],
        name: ['Entries']
      },
      children: [{
        type: ['h-entry'],
        properties: {
          name: ['Entry']
        }
      }]
    }]
  });
  t.deepEqual(result, {
    type: 'feed',
    name: 'Entries',
    author: {
      type: 'card',
      name: 'John Bull'
    },
    children: [{
      type: 'entry',
      name: 'Entry'
    }]
  });
});

test('Returns both child entries from feed', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-feed'],
      properties: {
        author: [{
          type: ['h-card'],
          properties: {
            name: ['Sally Smith']
          }
        }],
        name: ['Entries']
      },
      children: [{
        type: ['h-entry'],
        properties: {
          name: ['Entry 1']
        }
      }, {
        type: ['h-entry'],
        properties: {
          name: ['Entry 2']
        }
      }]
    }]
  });
  t.deepEqual(result, {
    type: 'feed',
    name: 'Entries',
    author: {
      type: 'card',
      name: 'Sally Smith'
    },
    children: [{
      type: 'entry',
      name: 'Entry 1'
    }, {
      type: 'entry',
      name: 'Entry 2'
    }]
  });
});

test('Returns bare entries', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        name: ['Entry A']
      }
    }, {
      type: ['h-entry'],
      properties: {
        name: ['Entry B']
      }
    }]
  });
  t.deepEqual(result, {
    children: [{
      type: 'entry',
      name: 'Entry A'
    }, {
      type: 'entry',
      name: 'Entry B'
    }]
  });
});

// https://jf2.spec.indieweb.org/#deriving-note
test('Derives a note', t => {
  const result = mf2tojf2({
    items: [{
      type: ['h-entry'],
      properties: {
        author: [{
          type: ['h-card'],
          properties: {
            name: ['A. Developer'],
            url: ['https://example.com']
          },
          value: 'A. Developer'
        }],
        name: ['Hello World'],
        summary: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus imperdiet ultrices pulvinar.'],
        url: ['https://example.com/2015/10/21'],
        published: ['2015-10-21T12:00:00-0700'],
        content: [{
          html: '<p>Donec dapibus enim lacus, <i>a vehicula magna bibendum non</i>. Phasellus id lacinia felis, vitae pellentesque enim. Sed at quam dui. Suspendisse accumsan, est id pulvinar consequat, urna ex tincidunt enim, nec sodales lectus nulla et augue. Cras venenatis vehicula molestie. Donec sagittis elit orci, sit amet egestas ex pharetra in.</p>',
          value: 'Donec dapibus enim lacus, a vehicula magna bibendum non. Phasellus id lacinia felis, vitae pellentesque enim. Sed at quam dui. Suspendisse accumsan, est id pulvinar consequat, urna ex tincidunt enim, nec sodales lectus nulla et augue. Cras venenatis vehicula molestie. Donec sagittis elit orci, sit amet egestas ex pharetra in.'
        }]
      }
    }]
  });
  t.deepEqual(result, {
    type: 'entry',
    author: {
      type: 'card',
      url: 'https://example.com',
      name: 'A. Developer'
    },
    url: 'https://example.com/2015/10/21',
    published: '2015-10-21T12:00:00-0700',
    name: 'Hello World',
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus imperdiet ultrices pulvinar.',
    content: {
      html: '<p>Donec dapibus enim lacus, <i>a vehicula magna bibendum non</i>. Phasellus id lacinia felis, vitae pellentesque enim. Sed at quam dui. Suspendisse accumsan, est id pulvinar consequat, urna ex tincidunt enim, nec sodales lectus nulla et augue. Cras venenatis vehicula molestie. Donec sagittis elit orci, sit amet egestas ex pharetra in.</p>',
      text: 'Donec dapibus enim lacus, a vehicula magna bibendum non. Phasellus id lacinia felis, vitae pellentesque enim. Sed at quam dui. Suspendisse accumsan, est id pulvinar consequat, urna ex tincidunt enim, nec sodales lectus nulla et augue. Cras venenatis vehicula molestie. Donec sagittis elit orci, sit amet egestas ex pharetra in.'
    }
  });
});
