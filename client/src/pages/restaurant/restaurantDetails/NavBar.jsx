import "../../../styles/DetailsNavBarStyles.css";

export default function NavBar() {
    const handleScroll = (e, sectionId) => {
        e.preventDefault();
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <ul className="nav nav-underline">
            <li className="nav-item">
                <a
                    className="nav-link active"
                    href="#overview"
                    onClick={(e) => handleScroll(e, "tongquan")}
                >
                    Tổng quan
                </a>
            </li>

            <li className="nav-item">
                <a
                    className="nav-link"
                    href="#hallist"
                    onClick={(e) => handleScroll(e, "hallist")}
                >
                    Sảnh tiệc
                </a>
            </li>

            <li className="nav-item">
                <a
                    className="nav-link"
                    href="#menu"
                    onClick={(e) => handleScroll(e, "menu")}
                >
                    Thực đơn
                </a>
            </li>

            <li className="nav-item">
                <a
                    className="nav-link"
                    href="#services"
                    onClick={(e) => handleScroll(e, "services")}
                >
                    Dịch vụ
                </a>
            </li>

            <li className="nav-item">
                <a
                    className="nav-link"
                    href="#reviews"
                    onClick={(e) => handleScroll(e, "reviews")}
                >
                    Đánh giá
                </a>
            </li>
        </ul>
    );
}
