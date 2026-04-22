/**
 * Gợi ý tags cho sản phẩm sức khỏe bằng Claude AI.
 * Chạy: ANTHROPIC_API_KEY=sk-ant-... pnpm tsx scripts/generate-tags.ts
 */
import * as readline from 'readline'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function suggestTags(name: string, category: string, description: string): Promise<string[]> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Bạn là chuyên gia sản phẩm sức khỏe, dinh dưỡng, vitamin.
Từ thông tin sản phẩm dưới đây, hãy liệt kê 5-15 từ khóa ngắn gọn (1-3 chữ) mà người dùng Việt Nam có thể gõ để tìm sản phẩm này.
Bao gồm: công dụng, thành phần chính, nhóm bệnh, đối tượng dùng, tên hoạt chất phổ biến.
Chỉ trả về JSON array các string, không giải thích thêm.

Tên sản phẩm: ${name}
Danh mục: ${category}
Mô tả/Thành phần: ${description || '(không có)'}

Ví dụ output: ["xương khớp", "glucosamine", "canxi", "sụn khớp", "thoái hóa", "người cao tuổi"]`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error(`Không parse được response: ${text}`)
  return JSON.parse(match[0]) as string[]
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Lỗi: Thiếu ANTHROPIC_API_KEY trong environment.')
    console.error('Chạy: ANTHROPIC_API_KEY=sk-ant-... pnpm tsx scripts/generate-tags.ts')
    process.exit(1)
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  console.log('\n=== Gợi ý Tags Sản Phẩm Sức Khỏe ===\n')

  const name = await ask(rl, 'Tên sản phẩm: ')
  const category = await ask(rl, 'Danh mục: ')
  const description = await ask(rl, 'Mô tả / Thành phần chính (Enter để bỏ qua): ')

  rl.close()

  console.log('\nĐang gợi ý tags...')

  const tags = await suggestTags(name.trim(), category.trim(), description.trim())

  console.log('\n✓ Tags gợi ý:')
  console.log(tags.join(', '))
  console.log('\nCopy danh sách trên và paste vào form "Từ khóa tìm kiếm" khi tạo sản phẩm.')
}

main().catch((err) => {
  console.error('Lỗi:', err instanceof Error ? err.message : err)
  process.exit(1)
})
