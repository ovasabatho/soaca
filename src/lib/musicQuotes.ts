export interface MusicQuote {
  quote: string;
  author: string;
  context?: string;
}

export const musicQuotes: MusicQuote[] = [
  {
    quote: "He who sings prays twice.",
    author: "Saint Augustine",
    context: "On holy praise and prayer",
  },
  {
    quote: "Next to the Word of God, the noble art of music is the greatest treasure in the world.",
    author: "Martin Luther",
    context: "Theology of sacred music",
  },
  {
    quote: "The aim and final end of all music should be none other than the glory of God and the refreshment of the soul.",
    author: "Johann Sebastian Bach",
    context: "Soli Deo Gloria",
  },
  {
    quote: "Sing to the Lord a new song; sing to the Lord, all the earth. Proclaim His salvation day after day.",
    author: "Psalm 96:1-2",
    context: "Sacred Scripture",
  },
  {
    quote: "Choir singing is not just about making music; it is communion, breathing together as one spirit and one body in worship.",
    author: "John Rutter",
    context: "On choral unity and fellowship",
  },
  {
    quote: "To sing is to love and affirm, to fly and soar, to enter into the presence of the Divine with thanksgiving.",
    author: "Saint John Chrysostom",
    context: "Homilies on praise",
  },
  {
    quote: "Make a joyful noise unto the Lord, all ye lands. Serve the Lord with gladness: come before His presence with singing.",
    author: "Psalm 100:1-2",
    context: "Song of praise",
  },
  {
    quote: "A choir is like a stained-glass window: each voice has its own color, but the light of God shines through all together.",
    author: "Choral Master Proverb",
    context: "Sacred vocal arts",
  },
  {
    quote: "Let the word of Christ dwell in you richly, teaching and admonishing one another in psalms, hymns, and spiritual songs.",
    author: "Colossians 3:16",
    context: "Apostolic Epistle",
  },
  {
    quote: "Music produces a kind of pleasure which human nature cannot do without.",
    author: "Confucius",
    context: "Philosophy of harmony",
  },
  {
    quote: "Where there is devotional music, God is always at hand with His gracious presence.",
    author: "Johann Sebastian Bach",
    context: "Spiritual devotions",
  },
  {
    quote: "The voice is the only musical instrument crafted directly by God Himself.",
    author: "Anonymous Choral Master",
    context: "The human voice",
  },
  {
    quote: "Singing in church isn't a performance; it is our humble offering of heart, breath, and reverence to our Creator.",
    author: "Liturgical Choral Reflection",
    context: "Sacred liturgy",
  },
  {
    quote: "When words fail, music speaks.",
    author: "Hans Christian Andersen",
    context: "Power of song",
  },
  {
    quote: "Be filled with the Spirit, speaking to one another with psalms, hymns, and spiritual songs, making melody from your heart to the Lord.",
    author: "Ephesians 5:18-19",
    context: "Sacred Scripture",
  },
  {
    quote: "The beauty of a choir is that no single voice needs to carry the entire weight; we blend and sustain one another in holy harmony.",
    author: "Sacred Chorister Wisdom",
    context: "Choral fellowship",
  },
  {
    quote: "I only know that whenever I have sung with a choir, my heart felt lifted higher than my voice could ever reach alone.",
    author: "Sacred Choir Tradition",
    context: "Choral reflections",
  },
  {
    quote: "There is nothing that elevates the soul, gives it wings, and frees it from earthly fetters like harmonious sacred chant.",
    author: "Saint John Chrysostom",
    context: "On liturgical song",
  },
  {
    quote: "Music washes away from the soul the dust of everyday life.",
    author: "Berthold Auerbach",
    context: "Choral renewal",
  },
  {
    quote: "Holy, holy, holy is the Lord of hosts: the whole earth is full of His glory. Join the celestial chorus in joyful praise.",
    author: "Isaiah 6:3",
    context: "The Seraphic hymn",
  },
  {
    quote: "In choir, we learn to listen more attentively to others than to ourselves. That is the essence of love and worship.",
    author: "Choral Director's Note",
    context: "Art of ensemble",
  }
];

/**
 * Returns a deterministic quote for the day based on the day of the year.
 * Math.floor difference from Jan 1 modulo array length.
 */
export function getDailyQuote(date: Date = new Date()): MusicQuote {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % musicQuotes.length;
  return musicQuotes[index];
}
