import favouriteModel from "../models/favourite.model.js";

export const getFavourites = async (req, res) => {
  try {
    const favourites = await favouriteModel
      .find({ user: req.user._id })
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      favourites,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching favourites" });
  }
};

export const addFavourite = async (req, res) => {
  const { productId } = req.params;

  try {
    const existing = await favouriteModel.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Already in favourites",
        isFavourite: true,
      });
    }

    await favouriteModel.create({
      user: req.user._id,
      product: productId,
    });

    return res.status(201).json({
      success: true,
      message: "Added to favourites",
      isFavourite: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error adding favourite" });
  }
};

export const removeFavourite = async (req, res) => {
  const { productId } = req.params;

  try {
    await favouriteModel.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    return res.status(200).json({
      success: true,
      message: "Removed from favourites",
      isFavourite: false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error removing favourite" });
  }
};

// Returns just the list of favourited product IDs — lightweight, for showing filled hearts on product cards
export const getFavouriteIds = async (req, res) => {
  try {
    const favourites = await favouriteModel
      .find({ user: req.user._id })
      .select("product");

    return res.status(200).json({
      success: true,
      productIds: favourites.map((f) => f.product.toString()),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching favourite ids" });
  }
};
