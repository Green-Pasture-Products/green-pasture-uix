import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import Modal from ".";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { XCircle } from "lucide-react";

const ViewProduct: React.FC<{
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    title?: string;
}> = ({ product, isOpen, onClose, children, onClick, className, title }) => {
    const [open, setOpen] = useState(isOpen);
    
    useEffect(() => {
        setOpen(isOpen);
    }, [isOpen]);

    const handleClick = () => {
        setOpen(true);
        onClick?.();
    };

    const handleClose = () => {
        setOpen(false);
        onClose?.();
    };

    const [current, setCurrent] = useState(0);
    const images = product?.images && product.images.length > 0
        ? product.images
        : product?.image
            ? [product.image]
            : [];

    const handlePrev = () => {
        setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // Extract public ID from Cloudinary URL if needed
    const getCloudinaryPublicId = (url: string) => {
        if (url.includes('res.cloudinary.com')) {
            const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
            return match ? match[1] : url;
        }
        return url;
    };

    return (
        <>
            <button
                onClick={handleClick}
                className={className}
                title={title}
            >
                {children}
            </button>

            <Modal
                isOpen={open}
                onClose={handleClose}
                title="Product Details"
                size="md"
            >               
                {/* Product Image Carousel */}
                {images.length > 0 && (
                    <div className="relative w-full h-64 mb-4 bg-gray-100 rounded-md overflow-hidden">
                        <CldImage 
                            src={getCloudinaryPublicId(images[current])} 
                            alt={product?.name ?? "Product image"} 
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            quality="auto"
                            dpr="auto"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                                    aria-label="Previous image"
                                >
                                    &lt;
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                                    aria-label="Next image"
                                >
                                    &gt;
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Product Details */}
                <h2 className="text-2xl font-bold mb-2">{product?.name}</h2>
                <p className="text-gray-700 mb-4">{product?.description}</p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold">Category</h3>
                        <p>{product?.category}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Price</h3>
                        <p>#{product?.price}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Quantity</h3>
                        <p>{product?.quantity}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">In Stock</h3>
                        <p>{product?.inStock ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <strong>Rating: {product?.rating || 0}</strong>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ViewProduct;