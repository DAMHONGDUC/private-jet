import { imageFor } from '@/core/ui/images';

test('a bundled key loads the bundled photo', () => {
  expect(imageFor('news-2')).not.toEqual(imageFor('jet-1'));
});

test('an http(s) URL loads over the network', () => {
  expect(imageFor('https://cdn.example.com/jets/g650.jpg')).toEqual({
    uri: 'https://cdn.example.com/jets/g650.jpg',
  });
  expect(imageFor('http://cdn.example.com/a.jpg')).toEqual({
    uri: 'http://cdn.example.com/a.jpg',
  });
});

test('an unknown key falls back to jet-1', () => {
  expect(imageFor('missing')).toBe(imageFor('jet-1'));
});
