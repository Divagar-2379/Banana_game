import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Coins, Check, Lock, Store, Wand2, Paintbrush, User, Loader2 } from 'lucide-react';
import { playSound } from '../../utils/audio';

const Shop = () => {
    const { user, updateUserStats } = useAuth();
    const [coins, setCoins] = useState(user?.stats?.goldCoins || 0);
    const [shopItems, setShopItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShop = async () => {
            try {
                const res = await api.get('/shop/items');
                setShopItems(res.data.items);
                setCoins(user?.stats?.goldCoins || 0);
            } catch (err) {
                console.error("Failed to load shop", err);
            } finally {
                setLoading(false);
            }
        };
        fetchShop();
    }, [user?.stats?.goldCoins]);

    const handlePurchase = async (id, price) => {
        if (coins >= price) {
            try {
                const res = await api.post('/shop/purchase', { itemId: id });
                playSound('win');
                setCoins(res.data.coinsRemaining);
                updateUserStats({ ...user.stats, goldCoins: res.data.coinsRemaining });
                setShopItems(items => items.map(item => item.id === id ? { ...item, owned: true } : item));
            } catch (err) {
                console.error("Purchase failed", err);
                playSound('wrong');
            }
        } else {
            playSound('wrong');
        }
    };

    const handleEquip = async (type, value) => {
        try {
            await api.post('/shop/equip', { type, value });
            playSound('click');
            if (type === 'theme' && value === 'Cyberpunk Theme') {
                document.body.classList.add('theme-cyberpunk');
            }
            alert('Equipped! Refresh may be needed for some changes.');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            <Store className="w-10 h-10 text-indigo-500" /> Item Shop
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Spend your hard-earned gold coins on exclusive cosmetics.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-black text-xl flex items-center gap-2 shadow-lg shadow-orange-500/30">
                        <Coins className="w-6 h-6 fill-white drop-shadow-md" /> {user?.stats?.goldCoins || coins}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shopItems.map((item, idx) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex items-center gap-6"
                        >
                            <div className="w-20 h-20 shrink-0 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform duration-300">
                                {item.icon}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        {item.type === 'avatar' ? <User className="w-3 h-3"/> : item.type === 'theme' ? <Paintbrush className="w-3 h-3"/> : <Wand2 className="w-3 h-3"/>}
                                        {item.type}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">{item.name}</h3>
                                
                                {item.owned ? (
                                    <button 
                                        onClick={() => handleEquip(item.type, item.name)}
                                        className="w-full py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                    >
                                        <Check className="w-4 h-4" /> Equip
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handlePurchase(item.id, item.price)}
                                        disabled={coins < item.price}
                                        className={`w-full py-2 font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                                            coins >= item.price 
                                            ? 'bg-white dark:bg-slate-700 border-indigo-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-600 hover:border-indigo-300 hover:shadow-sm active:scale-95'
                                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                        }`}
                                    >
                                        {coins < item.price ? <Lock className="w-4 h-4" /> : null}
                                        {item.price} Coins
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
