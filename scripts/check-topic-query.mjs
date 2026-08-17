import { buildTopicSearchQuery, descriptionTopicHints } from '../server/lib/youtube-topic.ts'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const meta = {
  title: 'dude wtf',
  channelTitle: 'Low Level',
  tags: ['hacking', 'cybersecurity', 'computers', 'hackers', 'apple', 'microsoft'],
  description: 'Switch to encrypted email and storage before AI can see your data. Sign up to Proton...',
}

const q = buildTopicSearchQuery(meta)
assert(/cybersecurity|hacking/i.test(q), `query missing security tags: ${q}`)
assert(/low level/i.test(q), `query missing channel: ${q}`)
assert(descriptionTopicHints(meta.description).length > 0, 'expected description hints')

console.log('ok', q)
