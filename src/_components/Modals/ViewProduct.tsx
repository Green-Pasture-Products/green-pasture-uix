import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import Modal from ".";

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
    const [current, setCurrent] = useState(0);
    
    useEffect(() => {
        setOpen(isOpen);
        setCurrent(0); // Reset to first image when product changes
    }, [isOpen]);

    const handleClick = () => {
        setOpen(true);
        onClick?.();
    };

    const handleClose = () => {
        setOpen(false);
        onClose?.();
    };

    const handlePrev = () => {
        setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const row = product as any; // Cast to any to access photos

    const images : string[] = row?.photos?.map((photo: any) => photo.url) 
    ?? (row?.image ? [row.image] : []);

    const category = row?.product?.name ?? row?.category ?? "—";
    const quantity = row?.unit ?? row?.quantity ?? 0;
    const inStock = (row?.unit ?? row?.quantity ?? 0) > 0;
    const rating = row?.ratingStats?.average ?? row?.rating ?? 0;
    const reviews = row?.ratingStats?.count ?? row?.reviews ?? 0;

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
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">            
                {/* Product Image Carousel */}
                {images.length > 0 ? (
                    <div className="relative w-full h-64 mb-4 bg-gray-100 rounded-md overflow-hidden">
                        <img
                            src={images[current]}
                            alt={product?.name ?? "Product image"}
                            className="w-full h-full object-cover"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                                >                        
                                    &lt;
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                                >
                                    &gt;
                                </button>
                                {/* Dot indicators */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {images.map((_: string, idx: number) => (
                                    <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`w-2 h-2 rounded-full transition cursor-pointer ${
                                        idx === current ? "bg-white" : "bg-gray-400 hover:bg-gray-200"
                                    }`}
                                    />
                                ))}
                                </div>
                            </>
                        )}
                    </div>
                    ) : (
                    <div className="w-full h-48 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No images available</span>
                    </div>
                    )
                }

                {/* Product Details */}
                <h2 className="text-2xl font-bold mb-2">{product?.name}</h2>
                
                <p className="text-gray-700 mb-4">{product?.description}</p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold">Category</h3>
                        <p>{category}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Price</h3>
                        <p>#{product?.price?.toLocaleString()}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Quantity</h3>
                        <p>{quantity}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase">Stock</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                        {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase">Rating</h3>
                        <p className="font-medium">⭐ {rating.toFixed(1)} ({reviews} reviews)</p>
                    </div>
                </div>
            </div>
            </Modal>
        </>
    );
};

export default ViewProduct;