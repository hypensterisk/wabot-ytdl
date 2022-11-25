/** @format */

import {randomUUID} from 'crypto'
import {rm} from 'fs/promises'
import {tmpdir} from 'os'
import {join} from 'path'
import qrcode from 'qrcode-terminal'
import whatsapp from 'whatsapp-web.js'
import youtube from 'youtube-dl-exec'

/**
@param {import("whatsapp-web.js").Message} message
*/
async function handleMessage(message) {
  const file = join(tmpdir(), `${randomUUID()}.mp3`)
  await youtube(message.body, {
    extractAudio: true,
    audioFormat: 'mp3',
    audioQuality: 0,
    output: file,
  })
  await message.reply(whatsapp.MessageMedia.fromFilePath(file))
  await rm(file)
}

async function startBot() {
  const client = new whatsapp.Client({
    authStrategy: new whatsapp.LocalAuth(),
  })
  client.on('qr', (qr) => qrcode.generate(qr, {small: true}))
  client.on('message', async (message) => {
    await client.sendMessage(message.from, 'Please Wait!')
    try {
      await handleMessage(message)
    } catch (error) {
      await message.reply('An Error Has Occurred!')
    }
  })
  await client.initialize()
}

await startBot()
