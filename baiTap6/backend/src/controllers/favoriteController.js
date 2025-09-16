import { addFavoriteService, removeFavoriteService, listFavoritesService } from "../services/favoriteService.js";

export const addFavorite = async (req, res) => {
    try {
        const { productId} = req.params;
        const userId = req.user.id; 
        const favorite = await addFavoriteService(userId, productId);
        return res.status(201).json(favorite);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const { productId} = req.params;
        const userId = req.user.id; 
        const favorite = await removeFavoriteService(userId, productId);
        return res.status(200).json(favorite);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const listFavorites = async (req, res) => {
    try {
        const userId = req.user.id; 
        const favorites = await listFavoritesService(userId);
        return res.status(200).json(favorites);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
