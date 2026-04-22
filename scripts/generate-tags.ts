/**
 * Gợi ý tags cho sản phẩm sức khỏe (không cần API).
 * Chạy: pnpm gen-tags
 *
 * Sửa 3 biến dưới đây trước khi chạy:
 */
const PRODUCT_NAME = "Viên uống Omega-3 Fish Oil 1000mg"
const PRODUCT_CATEGORY = "Vitamin & Khoáng chất"
const PRODUCT_DESCRIPTION =
  "Dầu cá tự nhiên giàu EPA và DHA, hỗ trợ tim mạch, não bộ, mắt"

// ---------------------------------------------------------------------------

type KeywordRule = { keywords: string[]; tags: string[] }

const RULES: KeywordRule[] = [
  {
    keywords: [
      "omega",
      "omega-3",
      "omega3",
      "dầu cá",
      "fish oil",
      "epa",
      "dha",
    ],
    tags: ["omega-3", "dầu cá", "EPA", "DHA", "fish oil"],
  },
  {
    keywords: [
      "tim",
      "tim mạch",
      "huyết áp",
      "cholesterol",
      "mỡ máu",
      "tuần hoàn",
    ],
    tags: ["tim mạch", "cholesterol", "huyết áp", "sức khỏe tim"],
  },
  {
    keywords: ["não", "não bộ", "trí nhớ", "tập trung", "nhận thức"],
    tags: ["não bộ", "trí nhớ", "tập trung", "bổ não"],
  },
  {
    keywords: ["mắt", "thị lực", "mắt khô", "thị giác"],
    tags: ["mắt", "thị lực", "bảo vệ mắt"],
  },
  {
    keywords: ["viêm", "chống viêm", "kháng viêm"],
    tags: ["chống viêm"],
  },
  {
    keywords: ["vitamin", "khoáng chất", "vi chất", "bổ sung"],
    tags: ["vitamin", "khoáng chất", "bổ sung dinh dưỡng"],
  },
  {
    keywords: ["canxi", "calcium", "xương", "khớp", "loãng xương"],
    tags: ["canxi", "xương khớp", "loãng xương"],
  },
  {
    keywords: ["vitamin c", "vitamin d", "vitamin e", "vitamin b", "vitamin k"],
    tags: ["vitamin tổng hợp"],
  },
  {
    keywords: ["glucosamine", "collagen", "sụn khớp", "đau khớp"],
    tags: ["glucosamine", "collagen", "sụn khớp", "đau khớp"],
  },
  {
    keywords: ["probiotics", "men vi sinh", "tiêu hóa", "đường ruột"],
    tags: ["probiotics", "men vi sinh", "tiêu hóa"],
  },
  {
    keywords: ["miễn dịch", "đề kháng", "kháng khuẩn", "kháng virus"],
    tags: ["miễn dịch", "tăng đề kháng"],
  },
  {
    keywords: ["magie", "magnesium", "kẽm", "zinc", "sắt", "iron", "selen"],
    tags: ["khoáng chất thiết yếu"],
  },
  {
    keywords: ["người cao tuổi", "người lớn tuổi", "người già"],
    tags: ["người cao tuổi"],
  },
  {
    keywords: ["trẻ em", "trẻ nhỏ", "bé", "nhi đồng"],
    tags: ["trẻ em"],
  },
  {
    keywords: ["phụ nữ", "mang thai", "bà bầu", "cho con bú"],
    tags: ["phụ nữ mang thai", "bà bầu"],
  },
  {
    keywords: ["thể thao", "vận động", "gym", "tập luyện", "phục hồi"],
    tags: ["thể thao", "phục hồi cơ bắp"],
  },
]

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

function suggestTagsLocal(
  name: string,
  category: string,
  description: string,
): string[] {
  const combined = normalize(`${name} ${category} ${description}`)
  const found = new Set<string>()

  for (const rule of RULES) {
    const hit = rule.keywords.some((kw) => combined.includes(normalize(kw)))
    if (hit) rule.tags.forEach((t) => found.add(t))
  }

  // Thêm tên hoạt chất/từ khóa kỹ thuật xuất hiện trong mô tả (viết hoa)
  const techTerms = [
    ...`${name} ${description}`.matchAll(/\b[A-Z]{2,}\d*\b/g),
  ].map((m) => m[0])
  techTerms.forEach((t) => found.add(t))

  return [...found]
}

function main() {
  console.log("\n=== Gợi ý Tags Sản Phẩm Sức Khỏe ===\n")
  console.log(`Sản phẩm : ${PRODUCT_NAME}`)
  console.log(`Danh mục : ${PRODUCT_CATEGORY}`)
  console.log(`Mô tả    : ${PRODUCT_DESCRIPTION || "(không có)"}`)

  const tags = suggestTagsLocal(
    PRODUCT_NAME,
    PRODUCT_CATEGORY,
    PRODUCT_DESCRIPTION,
  )

  if (tags.length === 0) {
    console.log("\n(Không tìm được tags phù hợp — thử thêm mô tả chi tiết hơn)")
    return
  }

  console.log("\n✓ Tags gợi ý:")
  console.log(tags.join(", "))
  console.log(
    '\nCopy danh sách trên và paste vào form "Từ khóa tìm kiếm" khi tạo sản phẩm.',
  )
}

main()
