/**
 * Shop Product Model
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { query, getClient } = require('../config/database');

const ShopProductModel = {
    /**
     * Get all active products with filters
     */
    async findAll({ category, brand, recommended, limit = 50, offset = 0 } = {}) {
        let sql = `
            SELECT *
            FROM shop_products
            WHERE is_active = true
        `;
        const params = [];
        let paramIndex = 1;

        if (category && category !== 'all') {
            sql += ` AND category = $${paramIndex++}`;
            params.push(category);
        }

        if (brand) {
            sql += ` AND brand = $${paramIndex++}`;
            params.push(brand);
        }

        if (recommended) {
            sql += ` AND is_recommended = true`;
        }

        sql += ` ORDER BY is_recommended DESC, created_at DESC`;
        sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    /**
     * Get all products for admin (including inactive)
     */
    async findAllAdmin({ category, brand, is_active, limit = 100, offset = 0 } = {}) {
        let sql = `SELECT * FROM shop_products WHERE 1=1`;
        const params = [];
        let paramIndex = 1;

        if (category && category !== 'all') {
            sql += ` AND category = $${paramIndex++}`;
            params.push(category);
        }

        if (brand) {
            sql += ` AND brand = $${paramIndex++}`;
            params.push(brand);
        }

        if (is_active !== undefined) {
            sql += ` AND is_active = $${paramIndex++}`;
            params.push(is_active);
        }

        sql += ` ORDER BY created_at DESC`;
        sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    /**
     * Get product by ID
     */
    async findById(id) {
        const sql = 'SELECT * FROM shop_products WHERE id = $1';
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Get product by slug
     */
    async findBySlug(slug) {
        const sql = 'SELECT * FROM shop_products WHERE slug = $1 AND is_active = true';
        const result = await query(sql, [slug]);
        return result.rows[0];
    },

    /**
     * Create new product
     */
    async create(data) {
        const sql = `
            INSERT INTO shop_products (
                name, slug, brand, category,
                price, original_price, stock,
                description, short_description,
                image_url, images, specs, suitable_for,
                coach_review, is_recommended, is_active, availability
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `;
        const params = [
            data.name,
            data.slug || this.generateSlug(data.name),
            data.brand || null,
            data.category,
            data.price,
            data.original_price || null,
            data.stock || 0,
            data.description || null,
            data.short_description || null,
            data.image_url || null,
            JSON.stringify(data.images || []),
            JSON.stringify(data.specs || []),
            JSON.stringify(data.suitable_for || []),
            data.coach_review || null,
            data.is_recommended || false,
            data.is_active !== false,
            data.availability || 'in-stock'
        ];
        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Update product
     */
    async update(id, data) {
        const fields = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = [
            'name', 'slug', 'brand', 'category',
            'price', 'original_price', 'stock',
            'description', 'short_description',
            'image_url', 'coach_review',
            'is_recommended', 'is_active', 'availability'
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = $${paramIndex++}`);
                params.push(data[field]);
            }
        }

        // JSON fields need special handling
        const jsonFields = ['images', 'specs', 'suitable_for'];
        for (const field of jsonFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = $${paramIndex++}`);
                params.push(JSON.stringify(data[field]));
            }
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        params.push(id);
        const sql = `
            UPDATE shop_products
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Delete product (soft delete - set is_active = false)
     */
    async delete(id) {
        const sql = `
            UPDATE shop_products
            SET is_active = false
            WHERE id = $1
            RETURNING *
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Hard delete product
     */
    async hardDelete(id) {
        const sql = 'DELETE FROM shop_products WHERE id = $1 RETURNING *';
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Update stock
     */
    async updateStock(id, quantity) {
        const sql = `
            UPDATE shop_products
            SET stock = stock + $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await query(sql, [quantity, id]);
        return result.rows[0];
    },

    /**
     * Get product count
     */
    async count({ category, is_active } = {}) {
        let sql = 'SELECT COUNT(*) as total FROM shop_products WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (category && category !== 'all') {
            sql += ` AND category = $${paramIndex++}`;
            params.push(category);
        }

        if (is_active !== undefined) {
            sql += ` AND is_active = $${paramIndex++}`;
            params.push(is_active);
        }

        const result = await query(sql, params);
        return parseInt(result.rows[0].total);
    },

    /**
     * Get all categories with product count
     */
    async getCategories() {
        const sql = `
            SELECT 
                category,
                COUNT(*) as product_count
            FROM shop_products
            WHERE is_active = true
            GROUP BY category
            ORDER BY product_count DESC
        `;
        const result = await query(sql);
        return result.rows;
    },

    /**
     * Get all brands with product count
     */
    async getBrands() {
        const sql = `
            SELECT 
                brand,
                COUNT(*) as product_count
            FROM shop_products
            WHERE is_active = true AND brand IS NOT NULL
            GROUP BY brand
            ORDER BY product_count DESC
        `;
        const result = await query(sql);
        return result.rows;
    },

    /**
     * Helper: Generate slug from name
     */
    generateSlug(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};

module.exports = ShopProductModel;
