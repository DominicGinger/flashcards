import * as readline from 'readline'
import * as fs from 'fs'

const fileName = 'cards.csv'
const helpText = `
new - create a new flash card
rand - show a random flash card
learn - keep showing random flash cards
list - show all flashcards
exit - quit
help - show this text
`
const cards: card[] = []
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const fileReader = readline.createInterface({ input: fs.createReadStream(fileName) });
fileReader.on('line', line => {
  const [ front, back ] = line.split(';')
  const card: card = { front: new Buffer(front, 'base64').toString(), back: new Buffer(back, 'base64').toString() }
  cards.push(card)
})

fileReader.on('close', () => {
  console.log(helpText)
  inputLoop(handleInput)
})

type card = {
  front: string,
  back: string
}

function inputLoop (callback: Function) {
  rl.question("> ", async (text: String) => {
    await callback(text)
    inputLoop(callback)
  })
}

async function handleInput (input: String): Promise<void> {
  switch (input) {
    case 'new':
      await handleNew()
      return
    case 'rand':
      await handleRand()
      return
    case 'learn':
      await handleLearn()
      return
    case 'list':
      handleList()
      return
    case 'exit':
      process.exit()
      return
    default:
      console.log(helpText)
      return
  }
}

async function handleNew () {
  const front = String(await new Promise(resolve => rl.question('Enter front of card:\n', (text: string) => resolve(text))))
  const back = String(await new Promise(resolve => rl.question('Enter back of card:\n', (text: string) => resolve(text))))

  const card = { front, back }
  cards.push(card)
  fs.appendFileSync(fileName, `${Buffer.from(front).toString('base64')};${Buffer.from(back).toString('base64')}\n`)
}

function handleList() {
  cards.forEach(card => console.log(`${card.front}\n${card.back}\n`))
}

async function handleRand() {
  const randomCard = cards[Math.floor(Math.random()*cards.length)]

  if (!randomCard) {
    return
  }

  if (Math.random() > 0.5) {
    console.log(randomCard.front)
    await new Promise(resolve => rl.question('', resolve))
    console.log(randomCard.back)
  } else {
    console.log(randomCard.back)
    await new Promise(resolve => rl.question('', resolve))
    console.log(randomCard.front)
  }
}

async function handleLearn(): Promise<void> {
  await handleRand()
  const shouldExit = await new Promise(resolve => rl.question('next? (Y\\n) ', x => resolve(x === 'n')))
  if (!shouldExit) {
    return handleLearn()
  }
}

