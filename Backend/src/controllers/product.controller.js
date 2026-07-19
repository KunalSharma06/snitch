import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
  const { title, description, priceAmount, priceCurrency } = req.body;
  const seller = req.user;

  const images = await Promise.all(req.files.map(async (file) => {
    return await uploadFile({
      buffer: file.buffer,
      fileName: file.originalname,
    })
  }))

  const product = await productModel.create({
    title,
    description,
    price: {
      amount: priceAmount,
      currency: priceCurrency || "INR"
    },
    images,
    seller: seller._id,
  });

  res.status(201).json({
    message: "Product created successfully",
    success: true,
    product,
  });

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

function getAttributeCombinations(attributes) {
  const entries = Object.entries(attributes).map(([key, val]) => {
    const values = typeof val === "string"
      ? val.split(",").map(v => v.trim()).filter(Boolean)
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
    })
  }

  const files = req.files;
  const images = [];
  if (files && files.length !== 0) {
    (await Promise.all(files.map(async (file) => {
      const image = await uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
      })
      return image
    }))).map(image => images.push(image))
  }

  const price = req.body.priceAmount;
  const stock = req.body.stock;
  const attributes = JSON.parse(req.body.attributes || "{}");

  const combos = getAttributeCombinations(attributes);

  for (const combo of combos) {
    product.variants.push({
      images,
      price: {
        amount: Number(price) || product.price.amount,
        currency: req.body.priceCurrency || product.price.currency
      },
      stock: Number(stock) || 0,
      attributes: combo,
    });
  }

  await product.save();

  return res.status(200).json({
    message: "Product variant added successfully",
    success: true,
    product
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
  const { title, description, priceAmount, priceCurrency } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    seller: req.user._id,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found", success: false });
  }

  if (title) product.title = title;
  if (description) product.description = description;
  if (priceAmount) product.price.amount = Number(priceAmount);
  if (priceCurrency) product.price.currency = priceCurrency;

  await product.save();

  return res.status(200).json({
    message: "Product updated successfully",
    success: true,
    product,
  });
}

export async function updateVariant(req, res) {
  const { productId, variantId } = req.params;
  const { priceAmount, priceCurrency, stock, attributes } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    seller: req.user._id,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found", success: false });
  }

  const variant = product.variants.id(variantId);
  if (!variant) {
    return res.status(404).json({ message: "Variant not found", success: false });
  }

  if (stock !== undefined) variant.stock = Number(stock);
  if (priceAmount !== undefined) {
    variant.price = {
      amount: Number(priceAmount),
      currency: priceCurrency || variant.price?.currency || product.price.currency,
    };
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