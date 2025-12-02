import React from "react";
import { useLocation } from 'react-router-dom';

function HeroSection() {
    const location = useLocation();

    const scrollToContent = () => {
        const searchBar = document.querySelector('.header--searchbar');
        if (searchBar) {
            searchBar.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {location.pathname === "/" && (
                <div className="hero-section position-relative" style={{ height: '100vh' }}>
                    <img
                        src="https://images.pexels.com/photos/1043902/pexels-photo-1043902.jpeg"
                        alt="wedding"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-lg-8 col-md-10 col-sm-12 text-center">
                                    <div className="hero-content text-white">
                                        <h1 className="display-3 fw-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                                            Chạm đến sự tinh tế – Đặt chỗ cho kỳ nghỉ mơ ước ngay hôm nay.
                                        </h1>
                                        <p className="lead mb-5 fs-4" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                                            Khám phá những trải nghiệm tuyệt vời và dịch vụ đẳng cấp hàng đầu từ khắp nơi trên thế giới.
                                        </p>
                                        <button
                                            className="btn btn-light btn-lg px-5 py-3 fs-5 fw-bold"
                                            onClick={scrollToContent}
                                            style={{
                                                backgroundColor: '#934',
                                                border: 'none',
                                                color: 'white',
                                                borderRadius: '50px',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                            }}
                                        >
                                            Khám phá ngay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HeroSection;
