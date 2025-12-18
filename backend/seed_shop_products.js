/**
 * Seed Shop Products from existing data
 * CLB Bóng Bàn Lê Quý Đôn
 * 
 * Run: node seed_shop_products.js
 */

require('dotenv').config();
const { query, pool } = require('./src/config/database');

// Helper to generate slug
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Product data from Shop.tsx
const products = [
    // ===== MẶT VỢT BUTTERFLY =====
    // Dòng Tenergy
    {
        name: 'Tenergy 05',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image_url: '/images/products/tenergy-05.jpg',
        description: 'Mặt vợt cao cấp hàng đầu thế giới. Xoáy cực mạnh, được VĐV chuyên nghiệp sử dụng. Phù hợp lối chơi tấn công mạnh mẽ.',
        suitable_for: ['Người chơi cao cấp', 'Thi đấu chuyên nghiệp', 'Đã có kỹ thuật vững'],
        coach_review: 'Mặt vợt "trong mơ" của nhiều người. Xoáy và tốc độ cực tốt nhưng cần kỹ thuật cao.',
        availability: 'in-stock',
        is_recommended: true,
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Công nghệ', value: 'Spring Sponge X' },
            { label: 'Tốc độ', value: '13.0' },
            { label: 'Xoáy', value: '11.5' },
            { label: 'Kiểm soát', value: '8.5' },
        ],
    },
    {
        name: 'Tenergy 05 FX',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image_url: '/images/products/tenergy-05-fx.jpg',
        description: 'Phiên bản FX của Tenergy 05 với mút mềm hơn, dễ kiểm soát hơn nhưng vẫn giữ xoáy tốt.',
        suitable_for: ['Người chơi trung cấp đến cao', 'Thích cảm giác mềm', 'Chơi đa dạng'],
        coach_review: 'Dễ đánh hơn Tenergy 05 thường, phù hợp ai muốn xoáy tốt mà không quá khó kiểm soát.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor FX' },
            { label: 'Tốc độ', value: '12.5' },
            { label: 'Xoáy', value: '11.0' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        name: 'Rozena',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 700000,
        image_url: '/images/products/rozena.jpg',
        description: 'Mặt vợt tensor phổ biến. Dễ đánh, xoáy tốt, giá hợp lý. Lựa chọn tuyệt vời cho người mới nâng cấp.',
        suitable_for: ['Người mới đến trung cấp', 'Muốn nâng cấp từ Sriver', 'Ngân sách hợp lý'],
        coach_review: 'HLV hay khuyên cho ai đã chơi được 6 tháng-1 năm. Dễ đánh mà vẫn xoáy tốt.',
        availability: 'in-stock',
        is_recommended: true,
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Công nghệ', value: 'Spring Sponge' },
            { label: 'Tốc độ', value: '11.5' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '9.5' },
        ],
    },
    {
        name: 'Sriver',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 550000,
        image_url: '/images/products/sriver.jpg',
        description: 'Mặt vợt huyền thoại, cân bằng hoàn hảo. Dễ đánh, dễ kiểm soát, bền bỉ. Lựa chọn kinh điển.',
        suitable_for: ['Mọi trình độ', 'Người mới chọn mặt đầu tiên', 'Rèn kỹ thuật'],
        coach_review: 'Mặt vợt "kinh điển" mà HLV hay recommend. Không quá nhanh, không quá chậm.',
        availability: 'in-stock',
        is_recommended: true,
        specs: [
            { label: 'Loại', value: 'Inverted' },
            { label: 'Độ dày', value: '1.5-2.1mm' },
            { label: 'Tốc độ', value: '10.5' },
            { label: 'Xoáy', value: '10.0' },
            { label: 'Kiểm soát', value: '10.0' },
        ],
    },

    // ===== YASAKA =====
    {
        name: 'Rakza Z',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 790000,
        image_url: '/images/products/rakza-z.jpg',
        description: 'Dòng Rakza trung cấp. Cân bằng tốt với giá hợp lý.',
        suitable_for: ['Người chơi trung cấp', 'Muốn nâng cấp', 'Ngân sách vừa phải'],
        coach_review: 'Lựa chọn tốt trong tầm giá. Hiệu suất tốt cho người chơi trung cấp.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '12.0' },
            { label: 'Xoáy', value: '11.0' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        name: 'Mark V',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 450000,
        image_url: '/images/products/mark-v.jpg',
        description: 'Mặt vợt huyền thoại của Yasaka. Cân bằng hoàn hảo, bền bỉ. Lựa chọn kinh điển.',
        suitable_for: ['Mọi trình độ', 'Người mới bắt đầu', 'Rèn kỹ thuật'],
        coach_review: 'Huyền thoại trong làng bóng bàn. Dễ đánh, bền, giá rẻ.',
        availability: 'in-stock',
        is_recommended: true,
        specs: [
            { label: 'Loại', value: 'Inverted' },
            { label: 'Tốc độ', value: '9.5' },
            { label: 'Xoáy', value: '10.0' },
            { label: 'Kiểm soát', value: '10.5' },
        ],
    },

    // BÓNG
    {
        name: 'Nittaku Premium 3 sao',
        brand: 'Nittaku',
        category: 'bong',
        price: 130000,
        image_url: '/images/products/nittaku-premium.jpg',
        description: 'Bóng thi đấu cao cấp của Nittaku, độ nảy và độ tròn hoàn hảo.',
        suitable_for: ['Thi đấu chính thức', 'Người chơi chuyên nghiệp'],
        coach_review: 'Bóng chất lượng cao, nhiều giải lớn sử dụng.',
        availability: 'in-stock',
        specs: [
            { label: 'Tiêu chuẩn', value: 'ITTF Approved' },
            { label: 'Số lượng', value: '3 quả/hộp' },
            { label: 'Đường kính', value: '40+mm' },
        ],
    },

    // PHỤ KIỆN
    {
        name: 'Bao vợt Butterfly đơn',
        brand: 'Butterfly',
        category: 'phu-kien',
        price: 250000,
        image_url: '/images/products/placeholder.jpg',
        description: 'Bao vợt đơn chính hãng, bảo vệ vợt tốt, gọn nhẹ.',
        suitable_for: ['Tất cả mọi người'],
        coach_review: 'Bao vợt cơ bản, đủ dùng cho việc mang vợt đi tập.',
        availability: 'in-stock',
        specs: [
            { label: 'Chất liệu', value: 'Vải chống nước' },
        ],
    },
];

async function seedProducts() {
    console.log('Starting to seed shop products...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
        try {
            const slug = generateSlug(product.name);

            // Check if product already exists
            const existing = await query(
                'SELECT id FROM shop_products WHERE slug = $1',
                [slug]
            );

            if (existing.rows.length > 0) {
                console.log(`⏭️  Skipped (exists): ${product.name}`);
                continue;
            }

            // Insert product
            await query(`
                INSERT INTO shop_products (
                    name, slug, brand, category,
                    price, image_url, description,
                    suitable_for, coach_review,
                    availability, is_recommended, specs, is_active
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
            `, [
                product.name,
                slug,
                product.brand,
                product.category,
                product.price,
                product.image_url,
                product.description,
                JSON.stringify(product.suitable_for || []),
                product.coach_review,
                product.availability || 'in-stock',
                product.is_recommended || false,
                JSON.stringify(product.specs || [])
            ]);

            console.log(`✅ Added: ${product.name}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error adding ${product.name}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n========================================`);
    console.log(`Seeding completed!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`========================================\n`);

    await pool.end();
}

// Run
seedProducts().catch(console.error);
