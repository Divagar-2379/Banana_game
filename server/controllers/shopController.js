const { query } = require('../config/database');

exports.getShopItems = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get all active shop items
        const shopResult = await query(`SELECT * FROM shop_items WHERE is_active = true ORDER BY id ASC`);
        
        // Get user's purchased items
        const inventoryResult = await query(`
            SELECT item_id FROM user_inventory WHERE user_id = $1
        `, [userId]);
        
        const ownedItems = inventoryResult.rows.map(row => row.item_id);
        
        // Format the response 
        const shopItems = shopResult.rows.map(item => ({
            id: item.id,
            type: item.type,
            name: item.name,
            price: item.price,
            icon: item.icon,
            owned: ownedItems.includes(item.id)
        }));
        
        res.json({ items: shopItems });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.purchaseItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id;
        
        // Check if item exists
        const itemResult = await query(`SELECT * FROM shop_items WHERE id = $1 AND is_active = true`, [itemId]);
        if (itemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        const item = itemResult.rows[0];
        
        // Check if already owned
        const checkInventory = await query(`SELECT * FROM user_inventory WHERE user_id = $1 AND item_id = $2`, [userId, itemId]);
        if (checkInventory.rows.length > 0) {
            return res.status(400).json({ message: 'Item already owned' });
        }
        
        // Get user balance
        const userResult = await query(`SELECT gold_coins FROM users WHERE id = $1`, [userId]);
        const userCoins = userResult.rows[0].gold_coins;
        
        if (userCoins < item.price) {
            return res.status(400).json({ message: 'Insufficient coins' });
        }
        
        // Deduct coins and add to inventory (in transaction roughly)
        await query(`UPDATE users SET gold_coins = gold_coins - $1 WHERE id = $2`, [item.price, userId]);
        await query(`INSERT INTO user_inventory (user_id, item_id) VALUES ($1, $2)`, [userId, itemId]);
        
        res.json({ 
            message: 'Purchase successful',
            item_id: itemId,
            coinsRemaining: userCoins - item.price
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.equipItem = async (req, res) => {
    // optional logic to set user active theme/avatar based on owned inventory.
    try {
        const { type, value } = req.body; // e.g., type: 'theme', value: 'cyberpunk'
        const userId = req.user.id;
        
        if (type === 'theme') {
            await query(`UPDATE users SET theme = $1 WHERE id = $2`, [value, userId]);
        } else if (type === 'avatar') {
            await query(`UPDATE users SET avatar = $1 WHERE id = $2`, [value, userId]);
        }
        
        res.json({ message: 'Equipped successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
