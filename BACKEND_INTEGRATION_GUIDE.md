# Backend Database Integration - Setup Guide

## What I've Implemented

I've set up your Next.js frontend to persist product uploads to your backend database on Render. Here's what's changed:

### 1. **New API Routes** (Next.js Proxy to Your Backend)

Created two new API endpoints that proxy requests to your Render backend:

- **`src/pages/api/products.ts`** - Handles GET (fetch all) and POST (create product)
- **`src/pages/api/products/[id].ts`** - Handles GET (single), PUT (update), DELETE (remove)

### 2. **Updated Product Actions**

Modified `src/_redux/actions/products.action.ts` to:
- Fetch products from `/api/products` instead of mock data
- Includes fallback to mock data if backend is unavailable
- Handles both array and object responses from backend

### 3. **Updated Add/Edit Product Modal**

Enhanced `src/_components/Modals/AddProduct.tsx` to:
- Make actual API calls when saving products (POST/PUT)
- Show loading state while saving
- Display success/error notifications
- Automatically update Redux store with server response

### 4. **Auto-Load Products on App Start**

Updated `src/pages/_app.tsx` to:
- Automatically fetch products from backend when app initializes
- Products load before any page renders

---

## Backend API Requirements

Your Render backend at `https://green-pasture-api.onrender.com/api/v1/` must have these endpoints:

### **GET /api/v1/products**
Returns all products.

**Expected Response:**
```json
[
  {
    "id": "some-id",
    "name": "Product Name",
    "price": 35000,
    "originalPrice": 40000,
    "image": "https://cloudinary-url...",
    "images": ["url1", "url2"],
    "category": "Fruits",
    "description": "Product description",
    "inStock": true,
    "quantity": 10,
    "rating": 4.8,
    "reviews": 124
  }
]
```

Or if your backend wraps it:
```json
{
  "products": [...]
}
```

### **POST /api/v1/products**
Creates a new product.

**Request Body:**
```json
{
  "id": "generated-id",
  "name": "New Product",
  "price": 20000,
  "originalPrice": 25000,
  "image": "https://cloudinary-url/image.jpg",
  "images": ["https://cloudinary-url/image.jpg"],
  "category": "Vegetables",
  "description": "Description here",
  "inStock": true,
  "quantity": 1,
  "rating": 0,
  "reviews": 0
}
```

**Expected Response:** Return the created product with backend-generated ID (if applicable)

### **PUT /api/v1/products/:id**
Updates an existing product.

**Request Body:** Same as POST

**Expected Response:** Return updated product

### **DELETE /api/v1/products/:id**
Deletes a product.

**Expected Response:**
```json
{ "success": true }
```

---

## How It Works - Data Flow

```
1. User uploads images to Cloudinary (via AddProduct modal)
2. Images are stored in Cloudinary, URLs returned to form
3. User clicks "Create" or "Update"
4. Next.js API route (/api/products) is called
5. Next.js sends request to your Render backend
6. Backend saves product to database
7. Response returns to frontend
8. Redux store is updated with saved product
9. Product is now persistent - survives app restart!
```

---

## Testing the Integration

1. **Start your app** - Products load from backend automatically
2. **Add a new product** with images from the Admin panel
3. **Refresh the page** - New product should still be there
4. **Restart the app** - Products should persist

---

## Environment Variables

Make sure you have in your `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=https://green-pasture-api.onrender.com/api/v1/
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

---

## Troubleshooting

### Products not persisting after refresh?
- Check that your backend POST/PUT endpoints are actually saving to database
- Check browser DevTools Network tab - are requests succeeding?
- Check backend logs on Render

### Getting 404 errors?
- Verify endpoint URL: should be `/api/v1/products` (with `/api/v1/` prefix)
- Check if backend is running/deployed

### Backend unavailable?
- Frontend falls back to mock data automatically (see console message)
- Once backend is up, products will sync

---

## Next Steps

1. **Verify your backend endpoints** match the structure above
2. **Test a product upload** from the admin panel
3. **Check if data persists** after page refresh
4. If issues, share backend API response format and I'll adjust the integration

