/**
 * Cognitive Shuffle word bank — concrete, emotionally neutral nouns drawn from
 * everyday/object/nature/scene categories. Per Beaudoin's SDIT protocol the
 * goal is words that are easy to picture briefly but boring enough that the
 * mind can't string them into a worry-narrative.
 *
 * Avoided on purpose:
 *  - Anything emotionally charged (love, death, war, money, work, success).
 *  - Anything embarrassment-prone (mistake, regret).
 *  - Stimulating action verbs (race, fight, chase).
 *  - Abstractions (justice, freedom, time) — too narrative-prone.
 *
 * Keep words short and concrete. Add more freely — the list is a noun grab-bag.
 */
export const SHUFFLE_WORDS: readonly string[] = [
  // nature
  'river', 'pebble', 'cloud', 'maple', 'pine', 'fern', 'meadow', 'rain', 'mist',
  'creek', 'stone', 'pond', 'lily', 'willow', 'birch', 'oak', 'moss', 'tide',
  'dune', 'reef', 'cove', 'cliff', 'valley', 'orchard', 'grove', 'glade',
  'lichen', 'thistle', 'clover', 'reed', 'fjord', 'snow', 'frost', 'rainbow',
  'sunset', 'sunrise', 'breeze', 'puddle', 'icicle', 'twilight',
  // animals
  'rabbit', 'turtle', 'otter', 'owl', 'sparrow', 'robin', 'heron', 'cricket',
  'badger', 'beaver', 'goose', 'lamb', 'pony', 'kitten', 'puppy', 'guppy',
  'minnow', 'starfish', 'jellyfish', 'butterfly', 'ladybug', 'dragonfly',
  'snail', 'frog', 'newt', 'mole', 'squirrel', 'fawn', 'duckling',
  // objects · home
  'kettle', 'teapot', 'mug', 'spoon', 'plate', 'bowl', 'lamp', 'candle',
  'pillow', 'blanket', 'quilt', 'sweater', 'mitten', 'sock', 'slipper',
  'curtain', 'rug', 'shelf', 'drawer', 'cupboard', 'pantry', 'kitchen',
  'doorknob', 'window', 'staircase', 'porch', 'hallway',
  // food
  'apple', 'pear', 'plum', 'peach', 'orange', 'lemon', 'lime', 'cherry',
  'berry', 'fig', 'date', 'walnut', 'almond', 'hazelnut', 'pecan', 'raisin',
  'honey', 'bread', 'biscuit', 'cracker', 'oatmeal', 'porridge', 'soup',
  'noodle', 'dumpling', 'tofu', 'rice', 'lentil', 'pumpkin', 'squash',
  // craft · tools
  'thimble', 'thread', 'needle', 'button', 'ribbon', 'scissors', 'pencil',
  'eraser', 'crayon', 'paintbrush', 'palette', 'easel', 'canvas', 'envelope',
  'stamp', 'postcard', 'notebook', 'bookmark', 'compass', 'ruler', 'magnet',
  'feather', 'sponge', 'broom', 'mop', 'bucket', 'ladder', 'hammock',
  // travel · places
  'lighthouse', 'cottage', 'cabin', 'tent', 'wagon', 'canoe', 'kayak',
  'sailboat', 'rowboat', 'bicycle', 'wheelbarrow', 'trolley', 'tram',
  'bridge', 'fountain', 'archway', 'courtyard', 'garden', 'greenhouse',
  'barn', 'meadowland', 'pasture', 'farmhouse', 'windmill', 'lantern',
  // sounds (visual cues for them)
  'bell', 'chime', 'flute', 'harp', 'piano', 'violin', 'drum', 'whistle',
  'cymbal', 'gong', 'tambourine', 'banjo', 'mandolin',
  // weather · sky
  'cumulus', 'comet', 'meteor', 'planet', 'crescent', 'eclipse',
  'aurora', 'starlight', 'moonbeam', 'galaxy',
  // textures
  'velvet', 'linen', 'cotton', 'silk', 'wool', 'cashmere', 'denim', 'corduroy',
  'leather', 'flannel', 'gauze',
  // shapes · misc
  'spiral', 'lattice', 'circle', 'triangle', 'square',
  'oval', 'mosaic', 'tile', 'brick', 'cobblestone', 'pebbled',
  // gentle scenes
  'library', 'bookstore', 'bakery', 'pottery', 'workshop', 'studio',
  'gallery', 'museum', 'observatory', 'aquarium', 'arboretum',
  // tiny things
  'acorn', 'seed', 'sprout', 'sapling', 'blossom', 'petal', 'pollen',
  'dewdrop', 'spider', 'beetle', 'caterpillar', 'cocoon',
  // calm action-nouns
  'whisper', 'lullaby', 'hum', 'sigh', 'yawn', 'stretch',
  // gentle weather
  'drizzle', 'flurry', 'snowflake', 'raindrop', 'sleet', 'fog',
];

/**
 * Returns a random word, avoiding the immediate previous pick so consecutive
 * words don't repeat. Uses crypto.getRandomValues when available so the rhythm
 * doesn't lock into a Math.random pattern.
 */
export function pickWord(previous?: string): string {
  let i = secureRandomIndex(SHUFFLE_WORDS.length);
  if (previous != null && SHUFFLE_WORDS[i] === previous) {
    i = (i + 1) % SHUFFLE_WORDS.length;
  }
  return SHUFFLE_WORDS[i]!;
}

function secureRandomIndex(modulus: number): number {
  const arr = new Uint32Array(1);
  const g = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto);
  if (g) {
    g(arr);
    return arr[0]! % modulus;
  }
  return Math.floor(Math.random() * modulus);
}
