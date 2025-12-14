import React, { useState } from 'react';

// ===== INTERFACES =====
interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    description: string;
    suitableFor: string[];
    coachReview: string;
    availability: 'in-stock' | 'pre-order';
    isRecommended?: boolean;
    specs?: { label: string; value: string }[];
}

interface Combo {
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    description: string;
    image: string;
    price: number;
    originalPrice: number;
    products: string[];
    coachNote: string;
    isHot?: boolean;
}

type CategoryKey = 'all' | 'vot-hoan-chinh' | 'cot-vot' | 'mat-vot' | 'bong' | 'phu-kien';
type ViewType = 'products' | 'combos' | 'detail';

// ===== DATA =====
const categories: { key: CategoryKey; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất cả', icon: 'fa-th-large' },
    { key: 'vot-hoan-chinh', label: 'Vợt hoàn chỉnh', icon: 'fa-table-tennis-paddle-ball' },
    { key: 'cot-vot', label: 'Cốt vợt', icon: 'fa-grip-lines' },
    { key: 'mat-vot', label: 'Mặt vợt', icon: 'fa-circle' },
    { key: 'bong', label: 'Bóng', icon: 'fa-baseball' },
    { key: 'phu-kien', label: 'Phụ kiện', icon: 'fa-bag-shopping' },
];

const products: Product[] = [


    // ===== MẶT VỢT BUTTERFLY =====
    // Dòng Tenergy
    {
        id: 'tenergy-05',
        name: 'Tenergy 05',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image: '/images/products/tenergy-05.jpg',
        description: 'Mặt vợt cao cấp hàng đầu thế giới. Xoáy cực mạnh, được VĐV chuyên nghiệp sử dụng. Phù hợp lối chơi tấn công mạnh mẽ.',
        suitableFor: ['Người chơi cao cấp', 'Thi đấu chuyên nghiệp', 'Đã có kỹ thuật vững'],
        coachReview: 'Mặt vợt "trong mơ" của nhiều người. Xoáy và tốc độ cực tốt nhưng cần kỹ thuật cao.',
        availability: 'in-stock',
        isRecommended: true,
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Công nghệ', value: 'Spring Sponge X' },
            { label: 'Tốc độ', value: '13.0' },
            { label: 'Xoáy', value: '11.5' },
            { label: 'Kiểm soát', value: '8.5' },
        ],
    },
    {
        id: 'tenergy-05-fx',
        name: 'Tenergy 05 FX',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image: '/images/products/tenergy-05-fx.jpg',
        description: 'Phiên bản FX của Tenergy 05 với mút mềm hơn, dễ kiểm soát hơn nhưng vẫn giữ xoáy tốt.',
        suitableFor: ['Người chơi trung cấp đến cao', 'Thích cảm giác mềm', 'Chơi đa dạng'],
        coachReview: 'Dễ đánh hơn Tenergy 05 thường, phù hợp ai muốn xoáy tốt mà không quá khó kiểm soát.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor FX' },
            { label: 'Tốc độ', value: '12.5' },
            { label: 'Xoáy', value: '11.0' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        id: 'tenergy-05-hard',
        name: 'Tenergy 05 Hard',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image: '/images/products/tenergy-05-hard.jpg',
        description: 'Phiên bản Hard của Tenergy 05 với mút cứng hơn, tốc độ cao hơn cho người chơi mạnh.',
        suitableFor: ['Người chơi cao cấp', 'Lối chơi tấn công mạnh', 'Cần tốc độ cực cao'],
        coachReview: 'Cho ai đánh mạnh và cần độ bật cao. Khó kiểm soát nếu kỹ thuật chưa vững.',
        availability: 'pre-order',
        specs: [
            { label: 'Loại', value: 'Tensor Hard' },
            { label: 'Tốc độ', value: '13.5' },
            { label: 'Xoáy', value: '11.5' },
            { label: 'Kiểm soát', value: '8.0' },
        ],
    },
    {
        id: 'tenergy-80',
        name: 'Tenergy 80',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image: '/images/products/tenergy-80.jpg',
        description: 'Cân bằng giữa tốc độ và xoáy. Phù hợp các kiểu đánh đa dạng.',
        suitableFor: ['Người chơi trung cấp đến cao', 'Lối chơi đa dạng', 'Cần cân bằng tốc độ/xoáy'],
        coachReview: 'Lựa chọn cân bằng trong dòng Tenergy. Đánh được nhiều kiểu.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '12.5' },
            { label: 'Xoáy', value: '11.0' },
            { label: 'Kiểm soát', value: '8.5' },
        ],
    },
    {
        id: 'tenergy-80-fx',
        name: 'Tenergy 80 FX',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image: '/images/products/tenergy-80-fx.jpg',
        description: 'Phiên bản FX mềm hơn của Tenergy 80, dễ kiểm soát và phù hợp nhiều người.',
        suitableFor: ['Người chơi trung cấp', 'Thích cảm giác mềm', 'Chơi đa dạng'],
        coachReview: 'Dễ đánh, cân bằng tốt. Phù hợp nhiều người chơi.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor FX' },
            { label: 'Tốc độ', value: '12.0' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        id: 'tenergy-64',
        name: 'Tenergy 64',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image: '/images/products/tenergy-64.jpg',
        description: 'Nhẹ và nhanh. Phù hợp lối chơi đặt bóng xa bàn và phản công nhanh.',
        suitableFor: ['Người chơi trung cấp đến cao', 'Lối chơi xa bàn', 'Cần tốc độ cao'],
        coachReview: 'Nhanh nhẹ, tốt cho đánh xa bàn và phản công. Xoáy ít hơn Tenergy 05.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '13.0' },
            { label: 'Xoáy', value: '10.0' },
            { label: 'Kiểm soát', value: '8.5' },
        ],
    },
    {
        id: 'tenergy-64-fx',
        name: 'Tenergy 64 FX',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image: '/images/products/tenergy-64-fx.jpg',
        description: 'Phiên bản FX mềm hơn của Tenergy 64, dễ kiểm soát hơn.',
        suitableFor: ['Người chơi trung cấp', 'Thích tốc độ nhưng cần kiểm soát'],
        coachReview: 'Nhanh và dễ đánh hơn Tenergy 64 thường.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor FX' },
            { label: 'Tốc độ', value: '12.5' },
            { label: 'Xoáy', value: '9.5' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        id: 'tenergy-19',
        name: 'Tenergy 19',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1300000,
        image: '/images/products/tenergy-19.jpg',
        description: 'Mới nhất trong dòng Tenergy. Tốc độ cao với độ bám tốt.',
        suitableFor: ['Người chơi cao cấp', 'Lối chơi tấn công', 'Cần tốc độ + bám'],
        coachReview: 'Phiên bản mới nhất, kết hợp ưu điểm của các dòng Tenergy trước.',
        availability: 'pre-order',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '12.5' },
            { label: 'Xoáy', value: '11.0' },
            { label: 'Kiểm soát', value: '8.5' },
        ],
    },

    // Dòng Dignics
    {
        id: 'dignics-05',
        name: 'Dignics 05',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1500000,
        image: '/images/products/dignics-05.jpg',
        description: 'Dòng cao cấp nhất của Butterfly. Xoáy và tốc độ vượt trội, được VĐV đỉnh cao sử dụng.',
        suitableFor: ['VĐV chuyên nghiệp', 'Thi đấu cấp cao', 'Kỹ thuật rất vững'],
        coachReview: 'Mặt vợt đỉnh cao. Chỉ dành cho ai đã làm chủ kỹ thuật hoàn toàn.',
        availability: 'pre-order',
        specs: [
            { label: 'Loại', value: 'Tensor Pro' },
            { label: 'Tốc độ', value: '14.0' },
            { label: 'Xoáy', value: '12.0' },
            { label: 'Kiểm soát', value: '7.5' },
        ],
    },
    {
        id: 'dignics-80',
        name: 'Dignics 80',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1500000,
        image: '/images/products/dignics-80.jpg',
        description: 'Cân bằng giữa tốc độ và xoáy trong dòng Dignics. Phù hợp lối chơi đa dạng.',
        suitableFor: ['VĐV cao cấp', 'Lối chơi đa dạng', 'Cần cân bằng cao'],
        coachReview: 'Cân bằng tốt trong dòng Dignics. Vẫn rất nhanh và xoáy.',
        availability: 'pre-order',
        specs: [
            { label: 'Loại', value: 'Tensor Pro' },
            { label: 'Tốc độ', value: '13.5' },
            { label: 'Xoáy', value: '11.5' },
            { label: 'Kiểm soát', value: '8.0' },
        ],
    },
    {
        id: 'dignics-64',
        name: 'Dignics 64',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1500000,
        image: '/images/products/dignics-64.jpg',
        description: 'Nhanh nhất trong dòng Dignics. Tốc độ cực cao cho lối chơi tấn công mạnh.',
        suitableFor: ['VĐV cao cấp', 'Lối chơi tấn công xa bàn', 'Cần tốc độ tối đa'],
        coachReview: 'Cực nhanh. Phù hợp ai chơi xa bàn và cần độ bật cao.',
        availability: 'pre-order',
        specs: [
            { label: 'Loại', value: 'Tensor Pro' },
            { label: 'Tốc độ', value: '14.5' },
            { label: 'Xoáy', value: '11.0' },
            { label: 'Kiểm soát', value: '7.5' },
        ],
    },
    {
        id: 'dignics-09c',
        name: 'Dignics 09C',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 1500000,
        image: '/images/products/dignics-09c.jpg',
        description: 'Mặt vợt dính (tacky). Cực kỳ xoáy, phù hợp lối chơi xoáy đỉnh cao.',
        suitableFor: ['VĐV cao cấp', 'Lối chơi xoáy mạnh', 'Thích mặt dính'],
        coachReview: 'Xoáy khủng khiếp. Cho ai chuyên về lối chơi xoáy.',
        availability: 'pre-order',
        specs: [
            { label: 'Loại', value: 'Tensor Tacky' },
            { label: 'Tốc độ', value: '12.5' },
            { label: 'Xoáy', value: '13.0' },
            { label: 'Kiểm soát', value: '8.0' },
        ],
    },

    // Dòng Glayzer
    {
        id: 'glayzer',
        name: 'Glayzer',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 900000,
        image: '/images/products/glayzer.jpg',
        description: 'Mặt vợt trung cấp mới. Cân bằng tốt giữa hiệu suất và giá cả.',
        suitableFor: ['Người chơi trung cấp', 'Muốn nâng cấp từ Rozena', 'Ngân sách vừa phải'],
        coachReview: 'Lựa chọn tốt cho ai muốn mặt tốt hơn Rozena mà chưa cần Tenergy.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '12.0' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        id: 'glayzer-09c',
        name: 'Glayzer 09C',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 900000,
        image: '/images/products/glayzer-09c.jpg',
        description: 'Phiên bản tacky (dính) của Glayzer. Xoáy mạnh hơn, phù hợp lối chơi xoáy.',
        suitableFor: ['Người chơi trung cấp', 'Thích mặt dính', 'Lối chơi xoáy'],
        coachReview: 'Dính và xoáy tốt với giá phải chăng. Tốt cho ai đang tập lối chơi xoáy.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor Tacky' },
            { label: 'Tốc độ', value: '11.5' },
            { label: 'Xoáy', value: '11.5' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },

    // Dòng Rozena & Sriver
    {
        id: 'rozena',
        name: 'Rozena',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 700000,
        image: '/images/products/rozena.jpg',
        description: 'Mặt vợt tensor phổ biến. Dễ đánh, xoáy tốt, giá hợp lý. Lựa chọn tuyệt vời cho người mới nâng cấp.',
        suitableFor: ['Người mới đến trung cấp', 'Muốn nâng cấp từ Sriver', 'Ngân sách hợp lý'],
        coachReview: 'HLV hay khuyên cho ai đã chơi được 6 tháng-1 năm. Dễ đánh mà vẫn xoáy tốt.',
        availability: 'in-stock',
        isRecommended: true,
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Công nghệ', value: 'Spring Sponge' },
            { label: 'Tốc độ', value: '11.5' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '9.5' },
        ],
    },
    {
        id: 'sriver',
        name: 'Sriver',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 550000,
        image: '/images/products/sriver.jpg',
        description: 'Mặt vợt huyền thoại, cân bằng hoàn hảo. Dễ đánh, dễ kiểm soát, bền bỉ. Lựa chọn kinh điển.',
        suitableFor: ['Mọi trình độ', 'Người mới chọn mặt đầu tiên', 'Rèn kỹ thuật'],
        coachReview: 'Mặt vợt "kinh điển" mà HLV hay recommend. Không quá nhanh, không quá chậm.',
        availability: 'in-stock',
        isRecommended: true,
        specs: [
            { label: 'Loại', value: 'Inverted' },
            { label: 'Độ dày', value: '1.5-2.1mm' },
            { label: 'Tốc độ', value: '10.5' },
            { label: 'Xoáy', value: '10.0' },
            { label: 'Kiểm soát', value: '10.0' },
        ],
    },
    {
        id: 'sriver-fx',
        name: 'Sriver FX',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 550000,
        image: '/images/products/sriver-fx.jpg',
        description: 'Phiên bản FX mềm hơn của Sriver. Dễ kiểm soát hơn, phù hợp người mới.',
        suitableFor: ['Người mới bắt đầu', 'Thích cảm giác mềm', 'Rèn kỹ thuật cơ bản'],
        coachReview: 'Mềm và dễ đánh hơn Sriver thường. Tốt cho người mới.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Inverted FX' },
            { label: 'Tốc độ', value: '10.0' },
            { label: 'Xoáy', value: '9.5' },
            { label: 'Kiểm soát', value: '10.5' },
        ],
    },
    {
        id: 'tackiness-drive',
        name: 'Tackiness Drive',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 550000,
        image: '/images/products/tackiness-drive.jpg',
        description: 'Mặt vợt dính giá rẻ. Phù hợp tập lối chơi xoáy với ngân sách thấp.',
        suitableFor: ['Người mới', 'Muốn thử mặt dính', 'Ngân sách thấp'],
        coachReview: 'Tốt để tập làm quen với mặt dính trước khi nâng cấp.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tacky' },
            { label: 'Tốc độ', value: '9.5' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '10.0' },
        ],
    },
    {
        id: 'super-anti',
        name: 'Super Anti',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 550000,
        image: '/images/products/super-anti.jpg',
        description: 'Mặt vợt anti-spin. Dùng để hóa giải xoáy của đối thủ, lối chơi phòng thủ đặc biệt.',
        suitableFor: ['Lối chơi phòng thủ', 'Cần hóa giải xoáy', 'Chơi gai/chop'],
        coachReview: 'Mặt anti đặc biệt. Dùng cho lối chơi phòng thủ hoặc gây khó cho đối thủ.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Anti-Spin' },
            { label: 'Tốc độ', value: '7.0' },
            { label: 'Xoáy', value: '2.0' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },

    // Dòng Zyre
    {
        id: 'zyre-03',
        name: 'Zyre-03',
        brand: 'Butterfly',
        category: 'mat-vot',
        price: 2100000,
        image: '/images/products/zyre-03.jpg',
        description: 'Dòng cao cấp mới nhất. Công nghệ tiên tiến cho hiệu suất tối đa.',
        suitableFor: ['VĐV chuyên nghiệp', 'Cần công nghệ mới nhất', 'Thi đấu đỉnh cao'],
        coachReview: 'Mặt vợt công nghệ mới nhất của Butterfly. Dành cho cấp đấu cao.',
        availability: 'pre-order',
        specs: [
            { label: 'Loại', value: 'Tensor Pro+' },
            { label: 'Tốc độ', value: '14.0' },
            { label: 'Xoáy', value: '12.0' },
            { label: 'Kiểm soát', value: '7.5' },
        ],
    },

    // ===== MẶT VỢT YASAKA =====
    // Dòng Rakza
    {
        id: 'rakza-xx',
        name: 'Rakza XX',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 1100000,
        image: '/images/products/rakza-xx.jpg',
        description: 'Mặt vợt cao cấp nhất của Yasaka. Tốc độ và xoáy tuyệt vời.',
        suitableFor: ['Người chơi cao cấp', 'Thi đấu', 'Cần hiệu suất cao'],
        coachReview: 'Đỉnh cao của Yasaka. Cạnh tranh tốt với các dòng cao cấp Butterfly.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '13.0' },
            { label: 'Xoáy', value: '11.5' },
            { label: 'Kiểm soát', value: '8.5' },
        ],
    },
    {
        id: 'rakza-z',
        name: 'Rakza Z',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 790000,
        image: '/images/products/rakza-z.jpg',
        description: 'Dòng Rakza trung cấp. Cân bằng tốt với giá hợp lý.',
        suitableFor: ['Người chơi trung cấp', 'Muốn nâng cấp', 'Ngân sách vừa phải'],
        coachReview: 'Lựa chọn tốt trong tầm giá. Hiệu suất tốt cho người chơi trung cấp.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '12.0' },
            { label: 'Xoáy', value: '11.0' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        id: 'rakza-x',
        name: 'Rakza X',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 790000,
        image: '/images/products/rakza-x.jpg',
        description: 'Dòng Rakza phổ biến. Tốc độ nhanh với kiểm soát tốt.',
        suitableFor: ['Người chơi trung cấp', 'Lối chơi tấn công', 'Cần tốc độ tốt'],
        coachReview: 'Nhanh và ổn định. Phù hợp lối chơi tấn công.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '12.5' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '8.5' },
        ],
    },
    {
        id: 'rakza-x-soft',
        name: 'Rakza X Soft',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 790000,
        image: '/images/products/rakza-x-soft.jpg',
        description: 'Phiên bản mềm của Rakza X. Dễ kiểm soát hơn.',
        suitableFor: ['Người chơi trung cấp', 'Thích cảm giác mềm', 'Cần kiểm soát tốt'],
        coachReview: 'Mềm và dễ đánh hơn Rakza X thường.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor Soft' },
            { label: 'Tốc độ', value: '12.0' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        id: 'rakza-9',
        name: 'Rakza 9',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 750000,
        image: '/images/products/rakza-9.jpg',
        description: 'Dòng Rakza entry-level. Tốc độ tốt với giá rẻ.',
        suitableFor: ['Người mới đến trung cấp', 'Muốn thử Yasaka', 'Ngân sách hợp lý'],
        coachReview: 'Lựa chọn tốt để bắt đầu với Yasaka.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '11.5' },
            { label: 'Xoáy', value: '10.0' },
            { label: 'Kiểm soát', value: '9.5' },
        ],
    },
    {
        id: 'rakza-7',
        name: 'Rakza 7',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 750000,
        image: '/images/products/rakza-7.jpg',
        description: 'Dòng Rakza entry-level với độ cứng trung bình.',
        suitableFor: ['Người mới đến trung cấp', 'Cần cân bằng', 'Ngân sách hợp lý'],
        coachReview: 'Cân bằng tốt. Dễ đánh cho nhiều người.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor' },
            { label: 'Tốc độ', value: '11.0' },
            { label: 'Xoáy', value: '10.0' },
            { label: 'Kiểm soát', value: '9.5' },
        ],
    },
    {
        id: 'rakza-7-soft',
        name: 'Rakza 7 Soft',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 750000,
        image: '/images/products/rakza-7-soft.jpg',
        description: 'Phiên bản mềm của Rakza 7. Dễ kiểm soát và dễ đánh.',
        suitableFor: ['Người mới', 'Thích cảm giác mềm', 'Rèn kỹ thuật'],
        coachReview: 'Rất dễ đánh. Tốt cho người mới làm quen với Yasaka.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor Soft' },
            { label: 'Tốc độ', value: '10.5' },
            { label: 'Xoáy', value: '9.5' },
            { label: 'Kiểm soát', value: '10.0' },
        ],
    },

    // Dòng Rising Dragon / Shining Dragon
    {
        id: 'rising-dragon',
        name: 'Rising Dragon',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 700000,
        image: '/images/products/rising-dragon.jpg',
        description: 'Mặt vợt tacky (dính). Xoáy mạnh với giá tốt.',
        suitableFor: ['Người chơi trung cấp', 'Thích mặt dính', 'Lối chơi xoáy'],
        coachReview: 'Dính và xoáy tốt. Giá hợp lý cho mặt dính.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tacky' },
            { label: 'Tốc độ', value: '11.0' },
            { label: 'Xoáy', value: '11.5' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        id: 'rising-dragon-ii',
        name: 'Rising Dragon II',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 760000,
        image: '/images/products/rising-dragon-ii.jpg',
        description: 'Phiên bản 2 của Rising Dragon. Nâng cấp xoáy và tốc độ.',
        suitableFor: ['Người chơi trung cấp đến cao', 'Thích mặt dính', 'Muốn nâng cấp từ Rising Dragon'],
        coachReview: 'Nâng cấp tốt từ Rising Dragon. Xoáy và tốc độ tốt hơn.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tacky' },
            { label: 'Tốc độ', value: '11.5' },
            { label: 'Xoáy', value: '12.0' },
            { label: 'Kiểm soát', value: '8.5' },
        ],
    },
    {
        id: 'shining-dragon',
        name: 'Shining Dragon',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 700000,
        image: '/images/products/shining-dragon.jpg',
        description: 'Dòng Dragon với đặc tính tốc độ hơn xoáy.',
        suitableFor: ['Người chơi trung cấp', 'Thích mặt dính nhanh', 'Lối chơi tấn công'],
        coachReview: 'Nhanh hơn Rising Dragon. Phù hợp lối chơi tấn công.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tacky' },
            { label: 'Tốc độ', value: '11.5' },
            { label: 'Xoáy', value: '11.0' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        id: 'shining-dragon-ii',
        name: 'Shining Dragon II',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 760000,
        image: '/images/products/shining-dragon-ii.jpg',
        description: 'Phiên bản 2 của Shining Dragon. Cân bằng giữa tốc độ và xoáy.',
        suitableFor: ['Người chơi trung cấp đến cao', 'Thích mặt dính', 'Lối chơi đa dạng'],
        coachReview: 'Cân bằng tốt. Phù hợp nhiều lối chơi.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tacky' },
            { label: 'Tốc độ', value: '12.0' },
            { label: 'Xoáy', value: '11.5' },
            { label: 'Kiểm soát', value: '8.5' },
        ],
    },

    // Dòng Mark V & Rigan
    {
        id: 'mark-v',
        name: 'Mark V',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 450000,
        image: '/images/products/mark-v.jpg',
        description: 'Mặt vợt huyền thoại của Yasaka. Cân bằng hoàn hảo, bền bỉ. Lựa chọn kinh điển.',
        suitableFor: ['Mọi trình độ', 'Người mới bắt đầu', 'Rèn kỹ thuật'],
        coachReview: 'Huyền thoại trong làng bóng bàn. Dễ đánh, bền, giá rẻ.',
        availability: 'in-stock',
        isRecommended: true,
        specs: [
            { label: 'Loại', value: 'Inverted' },
            { label: 'Tốc độ', value: '9.5' },
            { label: 'Xoáy', value: '10.0' },
            { label: 'Kiểm soát', value: '10.5' },
        ],
    },
    {
        id: 'mark-v-hps',
        name: 'Mark V HPS',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 670000,
        image: '/images/products/mark-v-hps.jpg',
        description: 'Phiên bản cao cấp của Mark V. Nhanh hơn và xoáy hơn.',
        suitableFor: ['Người chơi trung cấp', 'Muốn nâng cấp từ Mark V', 'Cần hiệu suất cao hơn'],
        coachReview: 'Nâng cấp tốt từ Mark V thường. Hiệu suất cao hơn.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Inverted Pro' },
            { label: 'Tốc độ', value: '11.0' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '9.5' },
        ],
    },
    {
        id: 'mark-v-hps-soft',
        name: 'Mark V HPS Soft',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 670000,
        image: '/images/products/mark-v-hps-soft.jpg',
        description: 'Phiên bản mềm của Mark V HPS. Dễ kiểm soát hơn.',
        suitableFor: ['Người chơi trung cấp', 'Thích cảm giác mềm', 'Cần kiểm soát tốt'],
        coachReview: 'Mềm và dễ đánh. Tốt cho ai thích cảm giác êm.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Inverted Soft' },
            { label: 'Tốc độ', value: '10.5' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '10.0' },
        ],
    },
    {
        id: 'rigan',
        name: 'Rigan',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 550000,
        image: '/images/products/rigan.jpg',
        description: 'Mặt vợt entry-level của Yasaka. Giá rẻ, dễ đánh.',
        suitableFor: ['Người mới bắt đầu', 'Ngân sách thấp', 'Rèn kỹ thuật cơ bản'],
        coachReview: 'Giá rẻ, chất lượng ổn. Tốt cho người mới.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Inverted' },
            { label: 'Tốc độ', value: '9.0' },
            { label: 'Xoáy', value: '9.0' },
            { label: 'Kiểm soát', value: '10.5' },
        ],
    },
    {
        id: 'rigan-spin',
        name: 'Rigan Spin',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 550000,
        image: '/images/products/rigan-spin.jpg',
        description: 'Phiên bản xoáy hơn của Rigan. Tập trung vào khả năng tạo xoáy.',
        suitableFor: ['Người mới', 'Muốn tập xoáy', 'Ngân sách thấp'],
        coachReview: 'Xoáy tốt với giá rẻ. Tốt để tập làm xoáy.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Inverted Spin' },
            { label: 'Tốc độ', value: '8.5' },
            { label: 'Xoáy', value: '10.0' },
            { label: 'Kiểm soát', value: '10.5' },
        ],
    },

    // Dòng đặc biệt
    {
        id: 'xtend-hs',
        name: 'Xtend HS',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 670000,
        image: '/images/products/xtend-hs.jpg',
        description: 'Mặt vợt tensor với công nghệ mới. Hiệu suất cao.',
        suitableFor: ['Người chơi trung cấp', 'Muốn thử công nghệ mới', 'Lối chơi tấn công'],
        coachReview: 'Công nghệ tensor mới của Yasaka. Đáng để thử.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Tensor HS' },
            { label: 'Tốc độ', value: '11.5' },
            { label: 'Xoáy', value: '10.5' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },
    {
        id: 'trick-anti',
        name: 'Trick Anti',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 690000,
        image: '/images/products/trick-anti.jpg',
        description: 'Mặt vợt anti-spin đặc biệt. Gây khó chịu cho đối thủ.',
        suitableFor: ['Lối chơi phòng thủ', 'Cần hóa giải xoáy', 'Chơi gai/chop'],
        coachReview: 'Mặt anti đặc biệt. Gây khó cho đối thủ bằng cách hóa giải xoáy.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Anti-Spin' },
            { label: 'Tốc độ', value: '6.5' },
            { label: 'Xoáy', value: '2.5' },
            { label: 'Kiểm soát', value: '9.5' },
        ],
    },
    {
        id: 'anti-power',
        name: 'Anti Power',
        brand: 'Yasaka',
        category: 'mat-vot',
        price: 450000,
        image: '/images/products/anti-power.jpg',
        description: 'Mặt anti giá rẻ. Phù hợp tập lối chơi phòng thủ.',
        suitableFor: ['Người mới chơi anti', 'Lối chơi phòng thủ', 'Ngân sách thấp'],
        coachReview: 'Giá rẻ để thử lối chơi anti.',
        availability: 'in-stock',
        specs: [
            { label: 'Loại', value: 'Anti-Spin' },
            { label: 'Tốc độ', value: '6.0' },
            { label: 'Xoáy', value: '2.0' },
            { label: 'Kiểm soát', value: '9.0' },
        ],
    },

    // BÓNG

    {
        id: 'bong-nittaku-premium',
        name: 'Nittaku Premium 3 sao',
        brand: 'Nittaku',
        category: 'bong',
        price: 130000,
        image: '/images/products/nittaku-premium.jpg',
        description: 'Bóng thi đấu cao cấp của Nittaku, độ nảy và độ tròn hoàn hảo.',
        suitableFor: ['Thi đấu chính thức', 'Người chơi chuyên nghiệp'],
        coachReview: 'Bóng chất lượng cao, nhiều giải lớn sử dụng.',
        availability: 'in-stock',
        specs: [
            { label: 'Tiêu chuẩn', value: 'ITTF Approved' },
            { label: 'Số lượng', value: '3 quả/hộp' },
            { label: 'Đường kính', value: '40+mm' },
        ],
    },


    // PHỤ KIỆN
    {
        id: 'bao-vot-butterfly',
        name: 'Bao vợt Butterfly đơn',
        brand: 'Butterfly',
        category: 'phu-kien',
        price: 250000,
        image: '/images/products/placeholder.jpg',
        description: 'Bao vợt đơn chính hãng, bảo vệ vợt tốt, gọn nhẹ.',
        suitableFor: ['Tất cả mọi người'],
        coachReview: 'Bao vợt cơ bản, đủ dùng cho việc mang vợt đi tập.',
        availability: 'in-stock',
        specs: [
            { label: 'Chất liệu', value: 'Vải chống nước' },
            { label: 'Số ngăn', value: '1 ngăn' },
        ],
    },
    {
        id: 'bao-vot-doi',
        name: 'Bao vợt Butterfly đôi cao cấp',
        brand: 'Butterfly',
        category: 'phu-kien',
        price: 450000,
        image: '/images/products/placeholder.jpg',
        description: 'Bao vợt đôi, đựng được 2 vợt + bóng + phụ kiện.',
        suitableFor: ['Người chơi thường xuyên', 'Cần mang nhiều đồ'],
        coachReview: 'Tiện lợi khi cần mang cả vợt dự phòng.',
        availability: 'in-stock',
        specs: [
            { label: 'Chất liệu', value: 'Da PU cao cấp' },
            { label: 'Số ngăn', value: '3 ngăn' },
        ],
    },
    {
        id: 'keo-dan-vot',
        name: 'Keo dán mặt vợt Butterfly Free Chack',
        brand: 'Butterfly',
        category: 'phu-kien',
        price: 180000,
        image: '/images/products/placeholder.jpg',
        description: 'Keo dán mặt vợt dạng nước, dễ dán và dễ bóc. Chai 37ml.',
        suitableFor: ['Người tự ráp vợt', 'Cần thay mặt thường xuyên'],
        coachReview: 'Keo chuẩn, dùng được lâu. CLB hay dùng loại này.',
        availability: 'in-stock',
        specs: [
            { label: 'Dung tích', value: '37ml' },
            { label: 'Loại', value: 'Water-based' },
        ],
    },
    {
        id: 'mieng-bao-ve-mat',
        name: 'Miếng bảo vệ mặt vợt Butterfly',
        brand: 'Butterfly',
        category: 'phu-kien',
        price: 80000,
        image: '/images/products/placeholder.jpg',
        description: 'Miếng dán bảo vệ mặt vợt khỏi bụi và hư hại. Bộ 2 miếng.',
        suitableFor: ['Tất cả mọi người'],
        coachReview: 'Phụ kiện nhỏ nhưng quan trọng, giúp mặt vợt bền hơn.',
        availability: 'in-stock',
        specs: [
            { label: 'Số lượng', value: '2 miếng/bộ' },
            { label: 'Chất liệu', value: 'Nhựa dẻo' },
        ],
    },
];

const combos: Combo[] = [
    {
        id: 'combo-nguoi-moi',
        name: 'Combo Người Mới - HLV Khuyên Dùng',
        level: 'beginner',
        description: 'Bộ combo đầu tiên hoàn hảo cho người mới bắt đầu. Đã được HLV CLB chọn lọc và kiểm chứng.',
        image: 'https://images.unsplash.com/photo-1558657795-61c7ec6a5b00?w=400',
        price: 750000,
        originalPrice: 880000,
        products: ['Vợt Butterfly Timo Boll 1000', 'Bao vợt đơn', 'Bóng tập 3 quả'],
        coachNote: 'Đây là combo HLV hay recommend cho người mới vào CLB. Đủ dùng để tập 6 tháng đầu.',
        isHot: true,
    },
    {
        id: 'combo-trung-cap',
        name: 'Combo Trung Cấp - Nâng Tầm Kỹ Thuật',
        level: 'intermediate',
        description: 'Dành cho người đã tập được 6 tháng - 1 năm, muốn có bộ vợt riêng để phát triển.',
        image: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400',
        price: 2800000,
        originalPrice: 3200000,
        products: ['Cốt Koki Niwa Wood', 'Mặt Sriver x2', 'Bao vợt đôi', 'Keo dán'],
        coachNote: 'Combo này giúp bạn có bộ vợt riêng chuẩn. Cốt gỗ rèn kỹ thuật, mặt Sriver cân bằng.',
    },
    {
        id: 'combo-thi-dau',
        name: 'Combo Thi Đấu Phong Trào',
        level: 'advanced',
        description: 'Cho người chơi nghiêm túc, tham gia các giải phong trào và muốn nâng cao thành tích.',
        image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400',
        price: 4200000,
        originalPrice: 4800000,
        products: ['Cốt Primorac Carbon', 'Mặt Rozena x2', 'Bao vợt đôi cao cấp', 'Keo dán', 'Miếng bảo vệ'],
        coachNote: 'Bộ combo cho ai muốn đấu giải. Cốt carbon nhanh, mặt Rozena xoáy tốt. Đủ sức đấu cấp CLB.',
    },
];

// ===== COMPONENT =====
const Shop: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewType>('products');
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderItem, setOrderItem] = useState<{ type: 'product' | 'combo'; item: Product | Combo } | null>(null);

    const [selectedBrand, setSelectedBrand] = useState('all');
    const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc'>('default');

    // Get unique brands from products
    const brands = ['all', ...Array.from(new Set(products.map(p => p.brand)))];

    const filteredProducts = products.filter(p => {
        const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchBrand = selectedBrand === 'all' || p.brand === selectedBrand;
        return matchCategory && matchBrand;
    }).sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        return 0;
    });

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedBrand, sortOption]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        const gridElement = document.querySelector('.shop-categories');
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const handleOrder = (type: 'product' | 'combo', item: Product | Combo) => {
        setOrderItem({ type, item });
        setShowOrderModal(true);
    };

    const getLevelLabel = (level: string) => {
        switch (level) {
            case 'beginner': return 'Người mới';
            case 'intermediate': return 'Trung cấp';
            case 'advanced': return 'Cao cấp';
            default: return level;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'beginner': return '#4caf50';
            case 'intermediate': return '#2196f3';
            case 'advanced': return '#ff9800';
            default: return '#666';
        }
    };

    return (
        <section id="shop" className="section shop-section">
            <div className="container">
                {/* Header */}
                <div className="shop-header">
                    <div className="shop-title-wrapper">
                        <span className="shop-badge">
                            <i className="fas fa-store"></i>
                            Shop Nội Bộ CLB
                        </span>
                        <h2 className="shop-main-title">
                            Dụng Cụ Bóng Bàn <span>Chính Hãng</span>
                        </h2>
                        <p className="shop-subtitle">
                            Sản phẩm được HLV CLB chọn lọc và kiểm chứng,
                            phù hợp cho người mới, người đang tập và thi đấu phong trào.
                        </p>
                    </div>

                    {/* Trust Badges */}
                    <div className="shop-trust-badges">
                        <div className="trust-badge">
                            <i className="fas fa-shield-check"></i>
                            <span>100% Chính hãng</span>
                        </div>
                        <div className="trust-badge">
                            <i className="fas fa-user-check"></i>
                            <span>HLV kiểm chứng</span>
                        </div>
                        <div className="trust-badge">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>Nhận tại CLB</span>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="shop-view-toggle">
                        <button
                            className={`view-toggle-btn ${currentView === 'products' ? 'active' : ''}`}
                            onClick={() => setCurrentView('products')}
                        >
                            <i className="fas fa-th-large"></i>
                            Sản phẩm
                        </button>
                        <button
                            className={`view-toggle-btn ${currentView === 'combos' ? 'active' : ''}`}
                            onClick={() => setCurrentView('combos')}
                        >
                            <i className="fas fa-gift"></i>
                            Combo theo trình độ
                        </button>
                    </div>
                </div>

                {/* Products View */}
                {currentView === 'products' && !selectedProduct && (
                    <>
                        {/* Category Filter */}
                        <div className="shop-categories">
                            {categories.map(cat => (
                                <button
                                    key={cat.key}
                                    className={`category-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.key)}
                                >
                                    <i className={`fas ${cat.icon}`}></i>
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Brand Filter */}
                        <div className="shop-brands">
                            {brands.map(brand => (
                                <button
                                    key={brand}
                                    className={`brand-btn ${selectedBrand === brand ? 'active' : ''}`}
                                    onClick={() => setSelectedBrand(brand)}
                                >
                                    {brand === 'all' ? 'Tất cả thương hiệu' : brand}
                                </button>
                            ))}
                        </div>

                        {/* Sort Filter */}
                        <div className="shop-sort-container">
                            <div className="sort-wrapper">
                                <label htmlFor="sort-price">
                                    <i className="fas fa-sort"></i> Sắp xếp:
                                </label>
                                <select
                                    id="sort-price"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as any)}
                                    className="sort-select"
                                >
                                    <option value="default">Mặc định (Mới nhất)</option>
                                    <option value="price-asc">Giá tăng dần</option>
                                    <option value="price-desc">Giá giảm dần</option>
                                </select>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="shop-products-grid">
                            {currentProducts.map(product => (
                                <div key={product.id} className="shop-product-card">
                                    {product.isRecommended && (
                                        <div className="product-badge recommended">
                                            <i className="fas fa-star"></i> HLV Khuyên Dùng
                                        </div>
                                    )}
                                    {product.availability === 'pre-order' && (
                                        <div className="product-badge pre-order">
                                            <i className="fas fa-clock"></i> Đặt trước
                                        </div>
                                    )}

                                    <div className="product-image" onClick={() => setSelectedProduct(product)}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                                            }}
                                        />
                                        <div className="product-overlay">
                                            <span>Xem chi tiết</span>
                                        </div>
                                    </div>

                                    <div className="product-info">
                                        <span className="product-brand">{product.brand}</span>
                                        <h4 className="product-name" onClick={() => setSelectedProduct(product)}>
                                            {product.name}
                                        </h4>
                                        <p className="product-desc-short">{product.description.slice(0, 80)}...</p>

                                        <div className="product-suitable">
                                            <i className="fas fa-user-check"></i>
                                            <span>{product.suitableFor[0]}</span>
                                        </div>

                                        <div className="product-pricing">
                                            <div className="price-main">
                                                <span className="price-current">₫{formatPrice(product.price)}</span>
                                                {product.originalPrice && (
                                                    <span className="price-original">₫{formatPrice(product.originalPrice)}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="product-actions">
                                            <button
                                                className="btn-product-detail"
                                                onClick={() => setSelectedProduct(product)}
                                            >
                                                <i className="fas fa-info-circle"></i>
                                                Chi tiết
                                            </button>
                                            <button
                                                className="btn-product-order"
                                                onClick={() => handleOrder('product', product)}
                                            >
                                                <i className="fas fa-shopping-bag"></i>
                                                Đặt hàng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="shop-pagination">
                                <button
                                    className="pagination-btn icon"
                                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                    disabled={currentPage === 1}
                                    aria-label="Previous Page"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    className="pagination-btn icon"
                                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    aria-label="Next Page"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Product Detail View */}
                {currentView === 'products' && selectedProduct && (
                    <div className="product-detail-view">
                        <button className="btn-back" onClick={() => setSelectedProduct(null)}>
                            <i className="fas fa-arrow-left"></i>
                            Quay lại
                        </button>

                        <div className="product-detail-grid">
                            <div className="product-detail-image">
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x500?text=No+Image';
                                    }}
                                />
                                {selectedProduct.isRecommended && (
                                    <div className="detail-badge">
                                        <i className="fas fa-star"></i> HLV CLB Khuyên Dùng
                                    </div>
                                )}
                            </div>

                            <div className="product-detail-info">
                                <span className="detail-brand">{selectedProduct.brand}</span>
                                <h2 className="detail-name">{selectedProduct.name}</h2>

                                <div className="detail-price-box">
                                    <span className="detail-price">₫{formatPrice(selectedProduct.price)}</span>
                                    {selectedProduct.originalPrice && (
                                        <span className="detail-original">₫{formatPrice(selectedProduct.originalPrice)}</span>
                                    )}
                                    <span className={`detail-stock ${selectedProduct.availability}`}>
                                        {selectedProduct.availability === 'in-stock' ? '✓ Có sẵn' : '⏳ Đặt trước (2-5 ngày)'}
                                    </span>
                                </div>

                                <p className="detail-description">{selectedProduct.description}</p>

                                <div className="detail-section">
                                    <h4><i className="fas fa-user-check"></i> Phù hợp với ai</h4>
                                    <ul className="suitable-list">
                                        {selectedProduct.suitableFor.map((s, i) => (
                                            <li key={i}><i className="fas fa-check"></i> {s}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="detail-section coach-review-box">
                                    <h4><i className="fas fa-comment-dots"></i> HLV CLB nhận xét</h4>
                                    <p className="coach-review-text">"{selectedProduct.coachReview}"</p>
                                </div>

                                {selectedProduct.specs && (
                                    <div className="detail-section">
                                        <h4><i className="fas fa-list-check"></i> Thông số kỹ thuật</h4>
                                        <div className="specs-grid">
                                            {selectedProduct.specs.map((spec, i) => (
                                                <div key={i} className="spec-item">
                                                    <span className="spec-label">{spec.label}</span>
                                                    <span className="spec-value">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="detail-source">
                                    <i className="fas fa-check-circle"></i>
                                    Sản phẩm chính hãng Butterfly
                                </div>

                                <div className="detail-actions">
                                    <button
                                        className="btn btn-primary btn-large"
                                        onClick={() => handleOrder('product', selectedProduct)}
                                    >
                                        <i className="fas fa-shopping-bag"></i>
                                        Đặt trước – Nhận tại CLB
                                    </button>
                                    <a href="tel:0913909012" className="btn btn-outline btn-large">
                                        <i className="fas fa-phone-alt"></i>
                                        Hỏi HLV tư vấn
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Combos View */}
                {currentView === 'combos' && (
                    <div className="shop-combos">
                        <div className="combos-intro">
                            <h3><i className="fas fa-gift"></i> Combo Theo Trình Độ</h3>
                            <p>Tiết kiệm hơn khi mua combo! Mỗi combo được HLV CLB chọn lọc phù hợp với từng giai đoạn tập luyện.</p>
                        </div>

                        <div className="combos-grid">
                            {combos.map(combo => (
                                <div key={combo.id} className={`combo-card ${combo.isHot ? 'hot' : ''}`}>
                                    {combo.isHot && (
                                        <div className="combo-hot-badge">
                                            <i className="fas fa-fire"></i> Bán chạy
                                        </div>
                                    )}

                                    <div className="combo-header">
                                        <img
                                            src={combo.image}
                                            alt={combo.name}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Combo';
                                            }}
                                        />
                                        <div
                                            className="combo-level-badge"
                                            style={{ backgroundColor: getLevelColor(combo.level) }}
                                        >
                                            {getLevelLabel(combo.level)}
                                        </div>
                                    </div>

                                    <div className="combo-body">
                                        <h4 className="combo-name">{combo.name}</h4>
                                        <p className="combo-description">{combo.description}</p>

                                        <div className="combo-products">
                                            <h5>Bao gồm:</h5>
                                            <ul>
                                                {combo.products.map((p, i) => (
                                                    <li key={i}><i className="fas fa-check"></i> {p}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="combo-coach-note">
                                            <i className="fas fa-user-tie"></i>
                                            <p>"{combo.coachNote}"</p>
                                        </div>

                                        <div className="combo-pricing">
                                            <div className="combo-price-main">
                                                <span className="combo-price-current">₫{formatPrice(combo.price)}</span>
                                                <span className="combo-price-original">₫{formatPrice(combo.originalPrice)}</span>
                                            </div>
                                            <span className="combo-savings">
                                                Tiết kiệm ₫{formatPrice(combo.originalPrice - combo.price)}
                                            </span>
                                        </div>

                                        <button
                                            className="btn btn-primary btn-full"
                                            onClick={() => handleOrder('combo', combo)}
                                        >
                                            <i className="fas fa-shopping-bag"></i>
                                            Đặt Combo
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                <div className="shop-cta">
                    <div className="shop-cta-content">
                        <h3>Cần tư vấn chọn vợt?</h3>
                        <p>HLV CLB sẵn sàng giúp bạn chọn dụng cụ phù hợp với trình độ và ngân sách.</p>
                        <div className="shop-cta-buttons">
                            <a href="tel:0913909012" className="btn btn-primary">
                                <i className="fas fa-phone-alt"></i>
                                Gọi: 0913 909 012
                            </a>
                            <a href="https://zalo.me/0913909012" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                                <i className="fas fa-comment"></i>
                                Nhắn Zalo
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Modal */}
            {showOrderModal && orderItem && (
                <div className="order-modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowOrderModal(false)}>
                            <i className="fas fa-times"></i>
                        </button>

                        <div className="order-modal-header">
                            <i className="fas fa-shopping-bag"></i>
                            <h3>Đặt Hàng - Nhận Tại CLB</h3>
                        </div>

                        <div className="order-modal-body">
                            <div className="order-item-summary">
                                <h4>{orderItem.type === 'product' ? (orderItem.item as Product).name : (orderItem.item as Combo).name}</h4>
                                <p className="order-price">
                                    Giá: ₫{formatPrice(orderItem.type === 'product' ? (orderItem.item as Product).price : (orderItem.item as Combo).price)}
                                </p>
                            </div>

                            <div className="order-steps">
                                <div className="order-step">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <h5>Liên hệ đặt hàng</h5>
                                        <p>Gọi hoặc nhắn Zalo cho CLB</p>
                                    </div>
                                </div>
                                <div className="order-step">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <h5>Xác nhận & thanh toán</h5>
                                        <p>Đặt cọc 50% hoặc thanh toán toàn bộ</p>
                                    </div>
                                </div>
                                <div className="order-step">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <h5>Nhận hàng</h5>
                                        <p>Nhận trực tiếp tại CLB (2-5 ngày)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="order-contact-options">
                                <a href="tel:0913909012" className="btn btn-primary btn-full">
                                    <i className="fas fa-phone-alt"></i>
                                    Gọi ngay: 0913 909 012
                                </a>
                                <a href="https://zalo.me/0913909012" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-full">
                                    <i className="fas fa-comment"></i>
                                    Nhắn Zalo
                                </a>
                            </div>

                            <p className="order-note">
                                <i className="fas fa-info-circle"></i>
                                Sản phẩm chính hãng được đặt và giao đến CLB trong 2-5 ngày.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Shop;
