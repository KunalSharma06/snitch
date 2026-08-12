import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";
import mongoose from "mongoose";
import { ChatMistralAI } from "@langchain/mistralai";
import { config } from "../config/config.js";
import Fuse from "fuse.js";

export async function createProduct(req, res) {
  const { title, description, priceAmount, priceCurrency, productType, brand, discountedPriceAmount } = req.body;
  const seller = req.user;

  const images = await Promise.all(
    req.files.map(async (file) => {
      return await uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
      });
    }),
  );

  const product = await productModel.create({
    title,
    productType,
    brand,
    description,
    price: {
      amount: priceAmount,
      currency: priceCurrency || "INR",
    },
     discountedPrice: discountedPriceAmount
      ? { amount: Number(discountedPriceAmount), currency: priceCurrency || "INR" }
      : undefined,
    images,
    seller: seller._id,
  });

  res.status(201).json({
    message: "Product created successfully",
    success: true,
    product,
  });
}


export const searchProducts = async (req, res) => {
  const { q } = req.query;
  const query = q?.trim();

  if (!query) {
    return res.status(200).json({ success: true, products: [] });
  }

  try {
    const allProducts = await productModel.find({});

    const lowerQuery = query.toLowerCase();

    // Step 1: exact/substring match first (precise, fast, handles correctly spelled queries)
    const exactMatches = allProducts.filter((p) => {
      const haystack = `${p.title} ${p.brand} ${p.productType}`.toLowerCase();
      return haystack.includes(lowerQuery);
    });

    if (exactMatches.length > 0) {
      return res.status(200).json({
        success: true,
        products: exactMatches.slice(0, 30),
      });
    }

    // Step 2: no exact match found — likely a typo, use fuzzy search
    const fuse = new Fuse(allProducts, {
      keys: ["title", "brand", "productType"],
      threshold: 0.4,
      ignoreLocation: true,
    });

    const fuzzyResults = fuse.search(query);
    const products = fuzzyResults.slice(0, 30).map((r) => r.item);

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ message: "Error searching products" });
  }
}

export async function getSellerProducts(req, res) {
  const seller = req.user;
  const products = await productModel.find({ seller: seller._id });
  res.status(200).json({
    message: "Products fetched successfully",
    success: true,
    products,
  });
}

export async function getAllProducts(req, res) {
  const products = await productModel.find();
  return res.status(200).json({
    message: "Product fetched successfully",
    success: true,
    products,
  });
}

export async function getFeaturedProducts(req, res) {
  try {
    const products = await productModel.aggregate([{ $sample: { size: 8 } }]);

    return res.status(200).json({
      message: "Featured products fetched successfully",
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return res
      .status(500)
      .json({ message: "Error fetching featured products", success: false });
  }
}

export async function getProductDetail(req, res) {
  const { id } = req.params;
  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({
      message: "Product Not found",
      success: false,
    });
  }

  return res.status(200).json({
    message: "Product details fetched successfully",
    success: true,
    product,
  });
}

export async function getSimilarProducts(req, res) {
  try {
    const { id } = req.params;
    const currentProduct = await productModel.findById(id);

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found", success: false });
    }

    const { productType } = currentProduct;

    // We can only match on productType if it exists on the document (backwards compatibility or not all products have it)
    const matchQuery = { _id: { $ne: new mongoose.Types.ObjectId(id) } };
    if (productType) {
      matchQuery.productType = productType;
    }

    const similarProducts = await productModel.aggregate([
      { $match: matchQuery },
      { $sample: { size: 4 } }
    ]);

    let finalProducts = similarProducts;

    if (similarProducts.length < 4) {
      const remainingSize = 4 - similarProducts.length;
      const similarProductIds = similarProducts.map(p => p._id);
      
      const randomProducts = await productModel.aggregate([
        { 
          $match: { 
            _id: { 
              $ne: new mongoose.Types.ObjectId(id), 
              $nin: similarProductIds 
            } 
          } 
        },
        { $sample: { size: remainingSize } }
      ]);
      
      finalProducts = [...similarProducts, ...randomProducts];
    }

    return res.status(200).json({
      message: "Similar products fetched successfully",
      success: true,
      products: finalProducts,
    });
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return res.status(500).json({ message: "Error fetching similar products", success: false });
  }
}

export async function getFilterOptions(req, res) {
  try {
    const [categories, brands] = await Promise.all([
      productModel.distinct("productType"),
      productModel.distinct("brand"),
    ]);

    return res.status(200).json({
      success: true,
      categories: categories.filter(Boolean),
      brands: brands.filter((b) => b && b !== "Unbranded"),
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return res
      .status(500)
      .json({ message: "Error fetching filter options", success: false });
  }
}

function getAttributeCombinations(attributes) {
  const entries = Object.entries(attributes).map(([key, val]) => {
    const values =
      typeof val === "string"
        ? val
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : [val];
    return { key, values };
  });

  let results = [{}];
  for (const { key, values } of entries) {
    const temp = [];
    for (const res of results) {
      for (const val of values) {
        temp.push({ ...res, [key]: val });
      }
    }
    results = temp;
  }
  return results;
}



export async function addProductVariant(req, res) {
  const productId = req.params.productId;
  const product = await productModel.findOne({
    _id: productId,
    seller: req.user._id,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      success: false,
    });
  }

  const files = req.files;
  const images = [];
  if (files && files.length !== 0) {
    (
      await Promise.all(
        files.map(async (file) => {
          const image = await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
          });
          return image;
        }),
      )
    ).map((image) => images.push(image));
  }

  const price = req.body.priceAmount;
  const stock = req.body.stock;
   const discountedPrice = req.body.discountedPriceAmount;
  const attributes = JSON.parse(req.body.attributes || "{}");


  const combos = getAttributeCombinations(attributes);

  for (const combo of combos) {
    product.variants.push({
      images,
      price: {
        amount: Number(price) || product.price.amount,
        currency: req.body.priceCurrency || product.price.currency,
      },
      discountedPrice: discountedPrice
        ? {
            amount: Number(discountedPrice),
            currency: req.body.priceCurrency || product.price.currency,
          }
        : undefined,
      stock: Number(stock) || 0,
      attributes: combo,
    });
  }

  await product.save();

  return res.status(200).json({
    message: "Product variant added successfully",
    success: true,
    product,
  });
}

export async function updateVariantStock(req, res) {
  const { productId, variantId } = req.params;
  const { stock } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    seller: req.user._id,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      success: false,
    });
  }

  const variant = product.variants.id(variantId);
  if (!variant) {
    return res.status(404).json({
      message: "Variant not found",
      success: false,
    });
  }

  variant.stock = Number(stock) || 0;
  await product.save();

  return res.status(200).json({
    message: "Stock updated successfully",
    success: true,
    product,
  });
}

export async function updateProduct(req, res) {
  const { productId } = req.params;
  const { title, description, priceAmount, priceCurrency, productType, brand, discountedPriceAmount } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    seller: req.user._id,
  });

  if (!product) {
    return res
      .status(404)
      .json({ message: "Product not found", success: false });
  }

  if (title) product.title = title;
  if (productType) product.productType = productType;
  if (brand) product.brand = brand;
  if (description) product.description = description;
  if (priceAmount) product.price.amount = Number(priceAmount);
  if (priceCurrency) product.price.currency = priceCurrency;
  if (discountedPriceAmount !== undefined) {
    product.discountedPrice = discountedPriceAmount
      ? { amount: Number(discountedPriceAmount), currency: priceCurrency || product.price.currency }
      : undefined;
  }

  await product.save();

  return res.status(200).json({
    message: "Product updated successfully",
    success: true,
    product,
  });
}

export async function updateVariant(req, res) {
  const { productId, variantId } = req.params;
  const { priceAmount, priceCurrency, stock, attributes, discountedPriceAmount } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    seller: req.user._id,
  });

  if (!product) {
    return res
      .status(404)
      .json({ message: "Product not found", success: false });
  }

  const variant = product.variants.id(variantId);
  if (!variant) {
    return res
      .status(404)
      .json({ message: "Variant not found", success: false });
  }

  if (stock !== undefined) variant.stock = Number(stock);
  if (priceAmount !== undefined) {
    variant.price = {
      amount: Number(priceAmount),
      currency:
        priceCurrency || variant.price?.currency || product.price.currency,
    };
  }
  if (discountedPriceAmount !== undefined) {
    variant.discountedPrice = discountedPriceAmount
      ? {
          amount: Number(discountedPriceAmount),
          currency:
            priceCurrency || variant.price?.currency || product.price.currency,
        }
      : undefined;
  }
  if (attributes) {
    // Replace the attributes map
    variant.attributes = attributes;
  }

  await product.save();

  return res.status(200).json({
    message: "Variant updated successfully",
    success: true,
    product,
  });
}

export const deleteProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.seller.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    await productModel.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting product" });
  }
};

export const deleteVariant = async (req, res) => {
  const { productId, variantId } = req.params;

  try {
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this product" });
    }

    product.variants = product.variants.filter(
      (v) => v._id.toString() !== variantId,
    );

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Variant removed successfully",
      product,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting variant" });
  }
};

export const generateProductAISummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { variantId, question } = req.body;

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return res.status(500).json({ message: "MISTRAL_API_KEY is missing", success: false });
    }

    const activeVariant = variantId
      ? product.variants.find((v) => v._id.toString() === variantId)
      : product.variants?.[0];

    const price = activeVariant?.discountedPrice?.amount
      ? activeVariant.discountedPrice
      : activeVariant?.price?.amount
        ? activeVariant.price
        : product.discountedPrice?.amount
          ? product.discountedPrice
          : product.price;

    const originalPrice = activeVariant?.discountedPrice?.amount
      ? activeVariant.price
      : product.discountedPrice?.amount
        ? product.price
        : null;

    const priceText = originalPrice
      ? `${price.currency} ${price.amount} (originally ${originalPrice.currency} ${originalPrice.amount})`
      : `${price?.currency || ""} ${price?.amount || "N/A"}`;

    const attributesText = activeVariant?.attributes
      ? Object.entries(
          activeVariant.attributes instanceof Map
            ? Object.fromEntries(activeVariant.attributes)
            : activeVariant.attributes
        )
          .filter(([key]) => key.toLowerCase() !== "size")
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ") || "Not specified"
      : "Not specified";

    const llm = new ChatMistralAI({
      model: "mistral-large-latest",
      apiKey: config.MISTRAL_API_KEY,
      maxTokens: 900,
      temperature: 0.7,
    });

    const baseContext = `
PRODUCT INFORMATION:
Brand: ${product.brand || "Not specified"}
Product Name: ${product.title || "Not specified"}
Product Type: ${product.productType || "Not specified"}
Selected Variant: ${attributesText}
Description: ${product.description || "No detailed description available"}
Price: ${priceText}
`;

    // Follow-up question mode — short, focused answer using same product context
    if (question) {
      const followUpPrompt = `
You are a fashion stylist for a premium Indian clothing website. Using ONLY the product information below, answer the customer's question directly and honestly in 2-3 short sentences. Do not invent details not provided. Do not use markdown symbols such as *, **, or #.

${baseContext}

CUSTOMER QUESTION: ${question}
`;
      const response = await llm.invoke(followUpPrompt);
      const cleanText = (text) =>
        text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/#{1,6}\s?/g, "")
          .trim();
      return res.status(200).json({ success: true, answer: cleanText(response.content) });
    }

    // Full review mode
    const prompt = `
You are an expert fashion stylist and personal shopping advisor for a premium Indian clothing website.

Your job is to carefully analyze the product information below — including the SPECIFIC VARIANT selected (color/size/etc if provided) — and give the customer a detailed, practical, and honest fashion recommendation for that exact variant.

${baseContext}

IMPORTANT RULES:
1. Use ONLY the information provided about the product and selected variant.
2. Do not invent fabric, color, fit, size, stretch, quality, design details, or other features that are not mentioned.
3. If some information is not available, do not pretend that you know it.
4. You may give general fashion-styling advice based on the product type and explicitly mentioned fit/style/variant attributes.
5. Be honest. Do not automatically say the product is excellent or worth buying.
6. Make the recommendation useful to someone who is actually deciding whether to buy this specific variant.
7. Do not mention that you are an AI.
8. Do not use markdown symbols such as *, **, #, or bullet characters.
9. Use clear section headings followed by short paragraphs.
10. Keep the response detailed but easy to read.

COVER THESE POINTS:

PRODUCT OVERVIEW:
Explain what the product is, its overall style, appearance, and the type of fashion look it represents based only on the provided information, referencing the selected variant where relevant.

STYLE & VIBE:
Explain what kind of overall look the product can create, such as casual, smart-casual, streetwear, minimal, relaxed, trendy, formal, or versatile, but only when supported by the product information.

FIT & WHO IT SUITS:
Explain what type of person or styling preference would generally suit this product and variant.
If the product description mentions a specific fit such as slim fit, regular fit, relaxed fit, oversized, straight fit, bootcut, skinny, or wide leg, explain what that fit means and who usually prefers it.
Do not claim that a particular body type will definitely look good or bad in it.

WHEN TO WEAR:
Explain suitable occasions and situations for wearing this product, such as college, casual outings, shopping, dates, parties, office, travel, dinners, or everyday wear, depending on the product type and style.

HOW TO STYLE:
Give practical suggestions for styling the product.
Explain what type of tops, bottoms, footwear, or accessories could generally pair well with it, considering the selected color/variant if mentioned.
Do not invent exact product features that are not provided.

OUTFIT IDEAS:
Give 2 or 3 simple outfit combinations that would work well with this variant.

VALUE FOR MONEY:
Consider the listed price for this variant and the available product information.
Explain whether it appears reasonably priced, expensive, or potentially good value based only on the information provided.
Do not make claims about competitors or market prices unless that information is provided.

FINAL VERDICT:
Give a clear final recommendation.
Say who should consider buying it and who may prefer another style.
Be honest and balanced rather than always recommending the purchase.

LENGTH RULES (STRICT):
Each section must be 2 to 3 sentences maximum. Do not write long paragraphs.
The OUTFIT IDEAS section must list exactly 2 short outfit combinations, each in a single sentence.
The entire response must fit comfortably within 400 words total.
Always finish every section completely. Never cut off mid-sentence.

IMPORTANT:
Do not repeat the same information in different sections.
Do not make the response unnecessarily complicated.
Use a premium, stylish, natural tone suitable for a modern fashion e-commerce website.
`;

    const cleanText = (text) =>
      text
        .replace(/\*\*(.*?)\*\*/g, "$1") // remove **bold**
        .replace(/\*(.*?)\*/g, "$1")     // remove *italic*
        .replace(/#{1,6}\s?/g, "")        // remove markdown headers
        .trim();

    const response = await llm.invoke(prompt);
    const cleanedSummary = cleanText(response.content);

    // A few relevant follow-up prompts for the UI to show as chips
    const suggestedQuestions = [
      "Is this good for daily wear?",
      "What footwear pairs well with this?",
      "Is this worth the price?",
      "Who should avoid this style?",
    ];

    return res.status(200).json({
      success: true,
      summary: cleanedSummary,
      suggestedQuestions,
    });

  } catch (error) {
    console.error("AI Summary Error:", error);
    return res.status(500).json({ message: "Could not generate AI summary", success: false });
  }
};